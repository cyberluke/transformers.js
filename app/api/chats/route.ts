import { NextRequest, NextResponse } from 'next/server';
import { getUserChatsWithPagination } from '@/lib/db/actions/chats';
import { validateFingerprint } from '@/lib/server/fingerprint/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fingerprint = searchParams.get('fingerprint');
    const cursor = searchParams.get('cursor') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validace fingerprint
    const { userId, error } = await validateFingerprint(fingerprint);
    if (error) return error;

    // Získání paginovaných chatů
    const result = await getUserChatsWithPagination(userId!, cursor, limit);

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch chats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 