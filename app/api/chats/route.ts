import { NextRequest, NextResponse } from 'next/server';
import { getUserChatsWithPagination } from '@/lib/db/actions/chats';
import { getUserIdFromAPI } from '@/lib/server/auth/api-auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validace session
    const userIdResult = await getUserIdFromAPI(req);
    if (typeof userIdResult !== 'string') {
      return userIdResult; // Error response
    }

    // Získání paginovaných chatů
    const result = await getUserChatsWithPagination(userIdResult, cursor, limit);

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