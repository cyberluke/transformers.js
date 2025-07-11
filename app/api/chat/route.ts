// import { findRelevantContent } from '@/lib/ai/embedding';
// import { createEmbedding } from '@/lib/db/actions/embeddings';
import { createChat, getChat } from '@/lib/db/actions/chats';
import { createMessage } from '@/lib/db/actions/messages';
import client from '@/lib/server/fingerprint/client';
import { addMemories, getMemories, retrieveMemories } from '@/lib/server/mem0/mem0-utils';
import { SYSTEM_HIGHLIGHT_PROMPT } from '@/lib/server/mem0/prompt';
import { searchWebTool } from '@/lib/tools/searchxng';
import { Writer } from '@/types/server';
// import { retrieveMemories } from '@/lib/server/mem0/server';
// import { retrieveMemories } from '@/lib/server/mem0/server';
//import { addMemories, getMemories } from "@mem0/vercel-ai-provider";
import { openai } from '@ai-sdk/openai';
import { frontendTools } from '@assistant-ui/react-ai-sdk';
import { SearxngSearch } from '@langchain/community/tools/searxng_search';
import { createDataStream, createDataStreamResponse, StreamData, streamText, tool } from 'ai';
import { randomUUID } from 'crypto';
import z from 'zod';
// import { z } from 'zod';
// import SelfHostedMem0 from '@/components/mem0/mem0';

export const maxDuration = 30;

// // Configure mem0 options
// const mem0Options = {
//   baseURL: process.env.MEM0_BASE_URL, // your self-hosted endpoint
//   apiKey: process.env.MEM0_API_KEY,   // your API key
// };

// // Použití
// const mem0 = new SelfHostedMem0(process.env.MEM0_BASE_URL || 'https://mem.nanotrik.ai');

// const retrieveMemories = (memories: any) => {
//   if (memories.length === 0) return "";
//   const systemPrompt =
//     "These are the memories I have stored. Give more weightage to the question by users and try to answer that first. You have to modify your answer based on the memories I have provided. If the memories are irrelevant you can ignore them. Also don't reply to this section of the prompt, or the memories, they are only for your reference. The System prompt starts after text System Message: \n\n";
//   const memoriesText = memories
//     .map((memory: any) => {
//       return `Memory: ${memory.memory}\n\n`;
//     })
//     .join("\n\n");

//   return `System Message: ${systemPrompt} ${memoriesText}`;
// };

function clearUserMessage(message: any) {
  return {
    // role: message.role,
    content: message.content,
    attachments: message.attachments,
    metadata: message.metadata,
  };
}

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
  `;
  console.log(baseSystemPrompt, "baseSystemPrompt");
  return baseSystemPrompt;
}

export async function POST(req: Request) {
  const { messages, customData } = await req.json();

  console.log(messages, customData, "customData");
  console.log(JSON.stringify(messages, null, 2), "req.body");

  let userId = null;

  try {
    const fingerprint = await client.getEvent(customData.fingerprint);
    userId = fingerprint.products.identification?.data?.visitorId;
  } catch (error) {
    console.log(error);
  }

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  let chat = null;

  if (!customData.chatId) {
    chat = await createChat({
      userId,
      title: 'New Chat',
    });
  } else {
    chat = await getChat(customData.chatId, userId);

    if (!chat) {
      return new Response('Chat not found', { status: 404 });
    }
  }

  // const chatId = chat.id;
  // const messageId = randomUUID();

  
  // const messages = messagesArray;
  // TODO: Check for security vulnerabilities with system prompt

  // console.log(messages);

  // userId = randomUUID();
  // userId = "e1de4137-ea87-4b4d-b005-cbcb3aadd7f1";

  // console.log(userId);
  // console.log(messages);

  const config = {
    user_id: userId,
    rerank: true,
    threshold: 0.1,
    output_format: "v1.0",
    enable_graph: true
  }

  // const dataStream = createDataStream({
  //   execute: async (writer) => {
  //     console.log("dataStream");
  //     // writer.writeMessageAnnotation({
  //     //   type: "chat-id",
  //     //   chatId: chat.id,
  //     // });
  //   }
  // });

  // const dataStream = createDataStream();

  let writerRef: { value: Writer | null } = {
    value: null
  }


  // const memories = await getMemories(messages, config);
  // const memories = await getMemories(messages);
  console.log(config, "first log");
  const {memories, systemMessage} = await retrieveMemories(messages, config);
  const systemPrompt = [getBaseSystemPrompt(), SYSTEM_HIGHLIGHT_PROMPT, systemMessage].filter(Boolean).join("\n");
  // console.log(memories);
  // console.log(memories, systemMessage);

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    maxSteps: 5,
    // forward system prompt and tools from the frontend
    toolCallStreaming: true,
    system: systemPrompt,
    tools: {
      // searchWeb: tool({
      //   description: `search the web for information.`,
      //   parameters: z.object({
      //     query: z.string().describe('the query to search the web for'),
      //   }),
      //   execute: async ({ query }) => {
      //     console.log(query, "query search");

      //     writerRef.writeMessageAnnotation({
      //       type: "search-web",
      //       query: query,
      //     });
          
      //     const result = await fetch(`${process.env.SEARXNG_URL}/search?q=${query}&format=json`);
      //     const data = await result.json();
      //     // console.log(data, "data search");
      //     return { success: true, result: data };
      //   },
      // })
      searchWeb: searchWebTool(writerRef),


    },
    onError: console.log,
    onFinish: (finishData) => {
      console.log("finishData");

      const userMessage = [
        clearUserMessage(messages[0])
      ];
      const aiMessage = finishData.response.messages;

      createMessage({
        chatId: chat.id,
        userId: userId,
        data: clearUserMessage(userMessage),
        role: 'user',
      });

      createMessage({
        chatId: chat.id,
        userId: userId,
        data: aiMessage,
        role: 'assistant',
      });

      // createMessage({
      //   chatId: chat.id,
      //   userId: userId,
      //   content: aiMessage,
      //   role: 'assistant',
      // });

      // console.log(JSON.stringify(message, null, 2));
      // const requestBodyRaw = finishData.request.body;
      // if (!requestBodyRaw) return;

      // try {
      //   const requestBody = JSON.parse(requestBodyRaw);
      //   console.log(requestBody);
      // } catch (error) {
      //   console.log(error);
      // }
      // console.log(message);
    }
  });

  const addMemoriesTask = addMemories(messages, { user_id: userId });

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

      const newMemories = await addMemoriesTask;
      if (newMemories.length > 0) {
        writer.writeMessageAnnotation({
          type: "mem0-update",
          memories: newMemories,
        });
      }
    },
  });
}