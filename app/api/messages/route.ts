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

    // console.log('result before transformation', result);

    // // Transformace z database formátu (S1) na AI SDK formát (S2)
    // const transformedMessages = result.messages.map(msg => {
    //   // Pokud message má data pole (database format), rozbalíme ho
    //   if (msg.data && Array.isArray(msg.data) && msg.data.length > 0) {
    //     const aiMessage = msg.data[0];
    //     return {
    //       id: aiMessage.id || msg.id,
    //       role: aiMessage.role,
    //       content: aiMessage.content,
    //       parts: aiMessage.parts || (typeof aiMessage.content === 'string' ? [{ type: 'text', text: aiMessage.content }] : aiMessage.content),
    //       createdAt: msg.createdAt,
    //       metadata: msg.metadata,
    //       // Zachováváme další properties z aiMessage
    //       ...aiMessage
    //     };
    //   }
    //   // Pokud už je v AI SDK formátu, vrátíme ho jak je
    //   return msg;
    // });

    // const transformedResult = {
    //   ...result,
    //   messages: transformedMessages
    // };

    // console.log('result after transformation', transformedResult);

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