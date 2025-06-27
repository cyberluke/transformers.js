// import { findRelevantContent } from '@/lib/ai/embedding';
// import { createEmbedding } from '@/lib/db/actions/embeddings';
import { createChat, getChat } from '@/lib/db/actions/chats';
import { createMessage } from '@/lib/db/actions/messages';
import client from '@/lib/server/fingerprint/client';
import { addMemories, getMemories, retrieveMemories } from '@/lib/server/mem0/mem0-utils';
import { SYSTEM_HIGHLIGHT_PROMPT } from '@/lib/server/mem0/prompt';
// import { retrieveMemories } from '@/lib/server/mem0/server';
// import { retrieveMemories } from '@/lib/server/mem0/server';
//import { addMemories, getMemories } from "@mem0/vercel-ai-provider";
import { openai } from '@ai-sdk/openai';
import { frontendTools } from '@assistant-ui/react-ai-sdk';
import { createDataStreamResponse, streamText, tool } from 'ai';
import { randomUUID } from 'crypto';
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
    role: message.role,
    content: message.content,
    attachments: message.attachments,
    metadata: message.metadata,
  };
}

export async function POST(req: Request) {
  const { messages, customData } = await req.json();

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

  console.log(messages);

  // userId = randomUUID();
  // userId = "e1de4137-ea87-4b4d-b005-cbcb3aadd7f1";

  console.log(userId);
  console.log(messages);

  const config = {
    user_id: userId,
    rerank: true,
    threshold: 0.1,
    output_format: "v1.0",
    enable_graph: true
  }


  // const memories = await getMemories(messages, config);
  // const memories = await getMemories(messages);
  const {memories, systemMessage} = await retrieveMemories(messages, config);
  const systemPrompt = [SYSTEM_HIGHLIGHT_PROMPT, systemMessage].filter(Boolean).join("\n");
  // console.log(memories);
  // console.log(memories, systemMessage);

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    // forward system prompt and tools from the frontend
    toolCallStreaming: true,
    system: systemPrompt,
    tools: {
      // addResource: tool({
      //   description: `add a resource to your knowledge base.
      //     If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
      //   parameters: z.object({
      //     content: z
      //       .string()
      //       .describe('the content or resource to add to the knowledge base'),
      //   }),
      //   execute: async ({ content }) => {
      //     if (!userId) throw new Error('User not authenticated');
      //     return createEmbedding({ content, userId });
      //   },
      // }),
      // getInformation: tool({
      //   description: `get information from your knowledge base to answer questions.`,
      //   parameters: z.object({
      //     question: z.string().describe('the users question'),
      //   }),
      //   execute: async ({ question }) => {
      //     if (!userId) throw new Error('User not authenticated');
      //     return findRelevantContent(question, userId);
      //   },
      // }),
      // ...frontendTools(tools),
    },
    onError: console.log,
    onFinish: (finishData) => {
      const userMessage = messages[0];
      const aiMessage = finishData.text;

      createMessage({
        chatId: chat.id,
        userId: userId,
        data: clearUserMessage(userMessage),
        role: 'user',
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
      writer.writeMessageAnnotation({
        type: "chat-id",
        chatId: chat.id,
      });
      
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