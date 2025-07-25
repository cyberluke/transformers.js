// import { findRelevantContent } from '@/lib/ai/embedding';
// import { createEmbedding } from '@/lib/db/actions/embeddings';
import { validateFingerprint } from '@/lib/server/fingerprint/auth';
import { ChatWorkflow } from '@/lib/gensx/workflow';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { message, customData } = await req.json();
  // TODO: Security check zod

  // Validace fingerprint
  const { userId, error } = await validateFingerprint(customData?.fingerprint);

  if (error) {
    return error;
  }

  return ChatWorkflow({
    userMessage: message,
    userId: userId!,
    agentId: customData.agentId,
    chatId: customData?.chatId,
  });
}