// import { findRelevantContent } from '@/lib/ai/embedding';
// import { createEmbedding } from '@/lib/db/actions/embeddings';
import { createChat, getChat } from '@/lib/db/actions/chats';
import { createMessage, getChatMessagesWithPagination } from '@/lib/db/actions/messages';
import { validateFingerprint } from '@/lib/server/fingerprint/auth';
import { retrieveMemories } from '@/lib/server/mem0/mem0-utils';
import { SYSTEM_HIGHLIGHT_PROMPT } from '@/lib/server/mem0/prompt';
import { searchWebTool } from '@/lib/tools/search-web/backend';
import { generateChatTitleTool } from '@/lib/tools/chat-title';
import { Writer } from '@/types/server';
import { getBaseSystemPrompt } from '@/lib/api/chat/system-prompt';
import { createFinishHandler } from '@/lib/api/chat/finish-handler';
import { createChatStreamResponse } from '@/lib/api/chat/stream-response';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import z from 'zod';
import fs from 'fs';

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
  createMessage({
    chatId: chat.id,
    userId: userId!,
    content: userMessage.content,
    parts: userMessage.parts || null,
    role: 'user',
  }); // DONE dokazu replikovat pozdeji

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