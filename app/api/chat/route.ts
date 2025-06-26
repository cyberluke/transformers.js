import { findRelevantContent } from '@/lib/ai/embedding';
import { createResource } from '@/lib/db/actions/resources';
import client from '@/lib/server/fingerprint/client';
import { addMemories, getMemories } from "@mem0/vercel-ai-provider";
import { openai } from '@ai-sdk/openai';
import { frontendTools } from '@assistant-ui/react-ai-sdk';
import { createDataStreamResponse, streamText, tool } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

// Configure mem0 options
const mem0Options = {
  baseURL: process.env.MEM0_BASE_URL, // your self-hosted endpoint
  apiKey: process.env.MEM0_API_KEY,   // your API key
};

const retrieveMemories = (memories: any) => {
  if (memories.length === 0) return "";
  const systemPrompt =
    "These are the memories I have stored. Give more weightage to the question by users and try to answer that first. You have to modify your answer based on the memories I have provided. If the memories are irrelevant you can ignore them. Also don't reply to this section of the prompt, or the memories, they are only for your reference. The System prompt starts after text System Message: \n\n";
  const memoriesText = memories
    .map((memory: any) => {
      return `Memory: ${memory.memory}\n\n`;
    })
    .join("\n\n");

  return `System Message: ${systemPrompt} ${memoriesText}`;
};

export async function POST(req: Request) {
  const { messages, system, tools, customData } = await req.json();

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

  console.log(userId);

  const memories = await getMemories(messages, { user_id: userId, ...mem0Options  });
  const mem0Instructions = retrieveMemories(memories);

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    // forward system prompt and tools from the frontend
    toolCallStreaming: true,
    system: [system, mem0Instructions].filter(Boolean).join("\n"),
    tools: {
      addResource: tool({
        description: `add a resource to your knowledge base.
          If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
        parameters: z.object({
          content: z
            .string()
            .describe('the content or resource to add to the knowledge base'),
        }),
        execute: async ({ content }) => {
          if (!userId) throw new Error('User not authenticated');
          return createResource({ content, userId });
        },
      }),
      getInformation: tool({
        description: `get information from your knowledge base to answer questions.`,
        parameters: z.object({
          question: z.string().describe('the users question'),
        }),
        execute: async ({ question }) => {
          if (!userId) throw new Error('User not authenticated');
          return findRelevantContent(question, userId);
        },
      }),
      ...frontendTools(tools),
    },
    onError: console.log,
    onFinish: (message) => {
      // console.log(message);
    }
  });

  const addMemoriesTask = addMemories(messages, { user_id: userId, ...mem0Options });

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
