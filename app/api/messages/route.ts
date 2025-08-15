import { NextRequest, NextResponse } from 'next/server';
import { getChatMessagesWithPagination } from '@/lib/db/actions/messages';
import { getUserIdFromAPI } from '@/lib/server/auth/api-auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get('chatId');
    const cursor = searchParams.get('cursor') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validace session
    const userIdResult = await getUserIdFromAPI(req);
    if (typeof userIdResult !== 'string') {
      return userIdResult; // Error response
    }

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    // Získání zpráv s paginací (nejnovější pokud cursor není, starší pokud cursor je)
    const result = await getChatMessagesWithPagination(chatId, userIdResult, cursor, limit);

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch messages',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 