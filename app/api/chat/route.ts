import { findRelevantContent } from '@/lib/ai/embedding';
import { createResource } from '@/lib/db/actions/resources';
import client from '@/lib/server/fingerprint/client';
import { openai } from '@ai-sdk/openai';
import { frontendTools } from '@assistant-ui/react-ai-sdk';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

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

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    // forward system prompt and tools from the frontend
    toolCallStreaming: true,
    system: `You are a helpful assistant. Check your knowledge base before answering any questions (use the getInformation tool).`,
    tools: {
      addResource: tool({
        description: `add a resource to your knowledge base.
          If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
        parameters: z.object({
          content: z
            .string()
            .describe('the content or resource to add to the knowledge base'),
        }),
        execute: async ({ content }) => createResource({ content }),
      }),
      getInformation: tool({
        description: `get information from your knowledge base to answer questions.`,
        parameters: z.object({
          question: z.string().describe('the users question'),
        }),
        execute: async ({ question }) => findRelevantContent(question),
      }),
      ...frontendTools(tools),
    },
    onError: console.log,
    onFinish: (message) => {
      // console.log(message);
    }
  });

  return result.toDataStreamResponse();
}
