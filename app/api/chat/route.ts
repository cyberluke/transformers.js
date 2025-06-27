// import { findRelevantContent } from '@/lib/ai/embedding';
// import { createEmbedding } from '@/lib/db/actions/embeddings';
import client from '@/lib/server/fingerprint/client';
import { addMemories, getMemories, retrieveMemories } from '@/lib/server/mem0/mem0-utils';
import { SYSTEM_HIGHLIGHT_PROMPT } from '@/lib/server/mem0/prompt';
// import { retrieveMemories } from '@/lib/server/mem0/server';
// import { retrieveMemories } from '@/lib/server/mem0/server';
//import { addMemories, getMemories } from "@mem0/vercel-ai-provider";
import { anthropic } from '@ai-sdk/anthropic';
import { frontendTools } from '@assistant-ui/react-ai-sdk';
import { createDataStreamResponse, streamText, jsonSchema, tool } from 'ai';
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

export async function POST(req: Request) {
  const { messages: messagesArray, customData, tools } = await req.json();

  // const messages = [messagesArray[messagesArray.length - 1]];
  const messages = messagesArray;
  // TODO: Check for security vulnerabilities with system prompt

  console.log(messages);
  console.log("tools", tools);

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
  // console.log(memories);
  // console.log(memories, systemMessage);

  const result = streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    messages,
    // forward system prompt and tools from the frontend
    toolCallStreaming: true,
    system: [SYSTEM_HIGHLIGHT_PROMPT, systemMessage].filter(Boolean).join("\n"),
    tools: {
          ...Object.fromEntries(
            Object.entries<{ parameters: unknown }>(tools).map(([name, tool]) => [
              name,
              {
                parameters: jsonSchema(tool.parameters!),
              },
            ]),
          ),
        },
    onError: console.log,
    onFinish: (message) => {
      console.log(JSON.stringify(message, null, 2));
      // console.log(message);
    }
  });

  const addMemoriesTask = addMemories(messages, { user_id: userId });

  return createDataStreamResponse({
    execute: async (writer) => {
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