// import { findRelevantContent } from '@/lib/ai/embedding';
// import { createEmbedding } from '@/lib/db/actions/embeddings';
import { getUserIdFromAPI } from '@/lib/server/auth/api-auth';
import { ChatWorkflow } from '@/lib/gensx/workflow';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { message, customData } = await req.json();
  // TODO: Security check zod

  // Validace session
  const userIdResult = await getUserIdFromAPI(req);

  if (typeof userIdResult !== 'string') {
    return userIdResult; // Error response
  }

  try {
    return await ChatWorkflow({
      userMessage: message,
      userId: userIdResult,
      agentId: customData.agentId,
      chatId: customData?.chatId,
    });
  } catch (error) {
    console.error('Chat workflow error:', error);
    
    // Speciální handling pro insufficient tokens
    if (error instanceof Error && error.message === 'Insufficient tokens') {
      return NextResponse.json(
        {
          error: 'insufficient_tokens',
          message: 'Nemáte dostatek tokenů pro odeslání zprávy',
          action: 'redirect_to_subscription'
        },
        { status: 402 } // Payment Required
      );
    }

    // Ostatní errory
    return NextResponse.json(
      {
        error: 'chat_error',
        message: 'Došlo k chybě při zpracování zprávy'
      },
      { status: 500 }
    );
  }
}