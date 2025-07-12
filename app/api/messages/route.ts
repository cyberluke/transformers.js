import { NextRequest, NextResponse } from 'next/server';
import { getChatMessagesWithPagination } from '@/lib/db/actions/messages';
import { validateFingerprint } from '@/lib/server/fingerprint/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fingerprint = searchParams.get('fingerprint');
    const chatId = searchParams.get('chatId');
    const cursor = searchParams.get('cursor') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validace fingerprint
    const { userId, error } = await validateFingerprint(fingerprint);
    if (error) return error;

    if (!chatId) {
      return NextResponse.json({ error: 'Chat ID is required' }, { status: 400 });
    }

    // Získání zpráv s paginací (nejnovější pokud cursor není, starší pokud cursor je)
    const result = await getChatMessagesWithPagination(chatId, userId!, cursor, limit);

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