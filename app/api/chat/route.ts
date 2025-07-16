// import { findRelevantContent } from '@/lib/ai/embedding';
// import { createEmbedding } from '@/lib/db/actions/embeddings';
import { createChat, getChat, updateChat } from '@/lib/db/actions/chats';
import { createMessage } from '@/lib/db/actions/messages';
import { validateFingerprint } from '@/lib/server/fingerprint/auth';
import { addMemories, getMemories, retrieveMemories } from '@/lib/server/mem0/mem0-utils';
import { SYSTEM_HIGHLIGHT_PROMPT } from '@/lib/server/mem0/prompt';
import { searchWebTool } from '@/lib/tools/searchxng';
import { generateChatTitleTool } from '@/lib/tools/chat-title';
import { Writer } from '@/types/server';
// import { retrieveMemories } from '@/lib/server/mem0/server';
// import { retrieveMemories } from '@/lib/server/mem0/server';
//import { addMemories, getMemories } from "@mem0/vercel-ai-provider";
import { openai } from '@ai-sdk/openai';
import { createDataStreamResponse, streamText } from 'ai';
import z from 'zod';

export const maxDuration = 30;

const getBaseSystemPrompt = () => {
  const baseSystemPrompt = `
  Dnes je ${new Date().toLocaleDateString('cs-CZ', {
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  })}.
  Jsi asistent, který pomáhá lidem v České republice.
  Vždy se snaž odpovídat v češtině.
  Vždy se snaž mít vědomosti aktuální.
  
  DŮLEŽITÉ: Na začátku každé nové konverzace vždy vygeneruj krátký, výstižný název chatu (max 50 znaků) na základě uživatelovy první otázky. 
  Použij tool generateChatTitle pro odeslání názvu. Tento krok je nezbytný.
  `;
  console.log(baseSystemPrompt, "baseSystemPrompt");
  return baseSystemPrompt;
}

export async function POST(req: Request) {
  const { messages, customData } = await req.json();
  // TODO: Security check zod

  console.log(messages, customData, "customData");
  console.log(JSON.stringify(messages, null, 2), "req.body");

  // Validace fingerprint
  const { userId, error } = await validateFingerprint(customData?.fingerprint);

  if (error) {
    return error;
  }

  let chat = null;

  if (!customData.chatId) {
    chat = await createChat({
      userId: userId!,
      title: 'New Chat',
    });
  } else {
    chat = await getChat(customData.chatId, userId!);

    if (!chat) {
      return new Response('Chat not found', { status: 404 });
    }
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


  // const memories = await getMemories(messages, config);
  // const memories = await getMemories(messages);
  console.log(config, "first log");
  const {memories, systemMessage} = await retrieveMemories(messages, config);
  const systemPrompt = [getBaseSystemPrompt(), SYSTEM_HIGHLIGHT_PROMPT, systemMessage].filter(Boolean).join("\n");
  // console.log(memories);
  console.log(memories, systemMessage);

  // Uložíme user zprávu PŘED streamText - zajistí správné pořadí
  const userMessage = messages[0];
  createMessage({
    chatId: chat.id,
    userId: userId!,
    data: userMessage,
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
    onFinish: (finishData) => {
      console.log("finishData");

      const parts = []
      let textContent = ""

      for (const [stepIndex, step] of finishData.steps.entries()) {
        if (step.toolResults && step.toolResults.length > 0 && step.finishReason === "tool-calls") {
          parts.push({ type: "step-start" })

          for (const toolResult of step.toolResults) {
            if (toolResult.type === "tool-result") {
              parts.push({
                type: "tool-invocation",
                toolInvocation: {
                  state: "result",
                  step: stepIndex,
                  toolName: toolResult.toolName,
                  args: toolResult.args,
                  result: toolResult.result,
                }
              })
            }
          }
        } else if (step.text.length > 0) {
          parts.push({ type: "step-start" })
          textContent += step.text

          parts.push({
            type: "text",
            text: step.text,
          })
        }
      }
      
      const aiMessage = {
        role: "assistant",
        content: textContent,
        parts,
      }

      
      // console.log(JSON.stringify(finishData, null, 2), "aiMessage");
      // fs.writeFileSync('finishData.json', JSON.stringify(finishData, null, 2));

      // Uložíme jen assistant zprávu - user zpráva už je uložená
      createMessage({
        chatId: chat.id,
        userId: userId!,
        data: aiMessage,
        role: 'assistant',
      });

      console.log("DONE STREAMING");
    }
  });

  const addMemoriesTask = addMemories(messages, { user_id: userId! });

  return createDataStreamResponse({
    execute: async (writer) => {
      writerRef.value = writer;

      // writer.writeMessageAnnotation({
      //   type: "chat-id",
      //   chatId: chat.id,
      // });

      writer.writeData({
        type: "chat-id",
        chatId: chat.id,
      })
      
      if (memories.length > 0) {
        writer.writeMessageAnnotation({
          type: "mem0-get",
          memories,
        });
      }

      result.mergeIntoDataStream(writer);

      console.log("MERGED INTO DATA STREAM");

      const newMemories = await addMemoriesTask; // TODO: Check if needed, it takes a lot of time
      if (newMemories.length > 0) {
        writer.writeMessageAnnotation({
          type: "mem0-update",
          memories: newMemories,
        });
      }

      console.log("ADDED MEMORIES");
    },
  });
}