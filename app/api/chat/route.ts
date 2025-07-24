// import { findRelevantContent } from '@/lib/ai/embedding';
// import { createEmbedding } from '@/lib/db/actions/embeddings';
import { processAttachmentsForEmbeddings } from '@/lib/ai/embedding';
import { createChat, getChat } from '@/lib/db/actions/chats';
import { createMessage, getChatMessagesWithPagination } from '@/lib/db/actions/messages';
import { validateFingerprint } from '@/lib/server/fingerprint/auth';
import { retrieveMemories } from '@/lib/server/mem0/mem0-utils';
import { SYSTEM_HIGHLIGHT_PROMPT } from '@/lib/server/mem0/prompt';
import { searchWebTool } from '@/lib/tools/search-web/backend';
import { generateChatTitleTool } from '@/lib/tools/chat-title';
import { findRelevantContentTool } from '@/lib/tools/find-relevant-content';
import { Writer } from '@/types/server';
import { getBaseSystemPrompt } from '@/lib/api/chat/system-prompt';
import { createFinishHandler } from '@/lib/api/chat/finish-handler';
import { createChatStreamResponse } from '@/lib/api/chat/stream-response';
import { openai } from '@ai-sdk/openai';
import { generateObject, NoSuchToolError, streamText } from 'ai';
import z from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { message, customData } = await req.json();
  // TODO: Security check zod

  // Validace fingerprint
  const { userId, error } = await validateFingerprint(customData?.fingerprint);

  if (error) {
    return error;
  }

  let chat = null;
  let messages = [];

  if (!customData.chatId) {
    chat = await createChat({
      userId: userId!,
      title: 'New Chat',
      metadata: {
        detailed: customData.detailed,
      }

    });
    messages.push(message);
  } else {
    chat = await getChat(customData.chatId, userId!);
    
    if (!chat) {
      return new Response('Chat not found', { status: 404 });
    }
    
    const messageCount = chat.metadata?.detailed ? 100 : 10;
    const rawMessages = await getChatMessagesWithPagination(customData.chatId, userId!, undefined, messageCount);
    messages = rawMessages.messages;
    messages.push(message);
  }

  const config = {
    user_id: userId!,
    rerank: true,
    threshold: 0.1,
    output_format: "v1.0",
    enable_graph: true
  }

  let writerRef: { value: Writer | null } = {
    value: null
  }

  const {memories, systemMessage} = await retrieveMemories(messages, config);
  const systemPrompt = [getBaseSystemPrompt(), SYSTEM_HIGHLIGHT_PROMPT, systemMessage].filter(Boolean).join("\n");

  const userMessage = message;
  console.log(userMessage);

  createMessage({
    chatId: chat.id,
    userId: userId!,
    content: userMessage.content,
    parts: userMessage.parts || null,
    experimental_attachments: userMessage.experimental_attachments || null,
    role: 'user',
  }); // DONE dokazu replikovat pozdeji

  // Zpracujeme attachments pro embeddings pokud existují
  if (userMessage.experimental_attachments && userMessage.experimental_attachments.length > 0) {
    console.log('Zpracovávám experimental_attachments pro embeddings...');
    
    try {
      const embeddingResults = await processAttachmentsForEmbeddings(
        userMessage.experimental_attachments,
        userId!,
        chat.assistentId || undefined
      );
      
      console.log('Výsledky zpracování embeddingů:', embeddingResults);
      
      // Můžeme přidat info do systémové zprávy, že máme k dispozici obsah z dokumentů
      const processedFiles = embeddingResults
        .filter(result => result.status === 'success')
        .map(result => result.fileName);
        
      if (processedFiles.length > 0) {
        console.log(`Úspěšně zpracovány soubory pro embeddings: ${processedFiles.join(', ')}`);
      }
      
    } catch (error) {
      console.error('Chyba při zpracování attachments pro embeddings:', error);
      // Pokračujeme i při chybě, embeddings jsou volitelné
    }
  }

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    maxSteps: 5,
    // forward system prompt and tools from the frontend
    toolCallStreaming: true,
    system: systemPrompt,
    tools: {
      generateChatTitle: generateChatTitleTool(writerRef, chat.id, userId!), // dodelat aby se nerunovalo pokud uz existuje
      searchWeb: searchWebTool(),
      findRelevantContent: findRelevantContentTool(userId!, chat.assistentId || undefined),
    },
    experimental_repairToolCall: async ({
      toolCall,
      tools,
      parameterSchema,
      error,
    }) => {
      if (NoSuchToolError.isInstance(error)) {
        return null; // do not attempt to fix invalid tool names
      }
  
      const tool = tools[toolCall.toolName as keyof typeof tools];
  
      const { object: repairedArgs } = await generateObject({
        model: openai('gpt-4o', { structuredOutputs: true }),
        schema: tool.parameters as z.ZodType<any>,
        prompt: [
          `The model tried to call the tool "${toolCall.toolName}"` +
            ` with the following arguments:`,
          JSON.stringify(toolCall.args),
          `The tool accepts the following schema:`,
          JSON.stringify(parameterSchema(toolCall)),
          'Please fix the arguments.',
        ].join('\n'),
      });
  
      return { ...toolCall, args: JSON.stringify(repairedArgs) };
    },
    onError: console.log,
    onFinish: createFinishHandler(chat.id, userId!)
  });

  return createChatStreamResponse({
    chatId: chat.id,
    memories,
    result,
    messages,
    userId: userId!,
    writerRef,
  });
}