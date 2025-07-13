import { db } from '@/lib/db';
import { messages, Message, MessageWithoutContext, NewMessageParams } from '@/lib/db/schema/messages';
import { chats } from '@/lib/db/schema/chats';
import { eq, desc, and, lt } from 'drizzle-orm';
import { getChat } from './chats';

// Vytvoření nové zprávy
export const createMessage = async (input: NewMessageParams): Promise<Message> => {
  try {
    // Ověříme, že chat existuje a uživatel k němu má přístup
    const chat = await getChat(input.chatId, input.userId);
    if (!chat) {
      throw new Error('Chat not found or access denied');
    }

    const [message] = await db
      .insert(messages)
      .values(input)
      .returning();

    // Aktualizujeme updatedAt u chatu
    await db
      .update(chats)
      .set({ updatedAt: new Date() })
      .where(eq(chats.id, input.chatId));

    return message;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create message');
  }
};

// SJEDNOCENÁ FUNKCE: Paginace zpráv (nejnovější i starší)
export const getChatMessagesWithPagination = async (
  chatId: string,
  userId: string,
  cursor?: string, // ULID cursor - pokud undefined, načte nejnovější
  limit: number = 10
): Promise<{
  messages: MessageWithoutContext[];
  nextCursor: string | null;
  hasMore: boolean;
}> => {
  try {
    // Ověříme přístup k chatu
    const chat = await getChat(chatId, userId);
    if (!chat) {
      throw new Error('Chat not found or access denied');
    }

    const whereClause = cursor
      ? and(
          eq(messages.chatId, chatId),
          lt(messages.id, cursor) // ULID jsou sortable, takže lt() najde starší zprávy
        )
      : eq(messages.chatId, chatId);

    const results = await db
      .select({
        id: messages.id,
        data: messages.data,
        role: messages.role,
        createdAt: messages.createdAt,
        metadata: messages.metadata,
        // chatId a userId vynecháno - jsou známo z kontextu
      })
      .from(messages)
      .where(whereClause)
      .orderBy(desc(messages.id)) // Nejnovější první (podle ULID)
      .limit(limit + 1); // +1 pro zjištění hasMore

    const hasMore = results.length > limit;
    const messagesList = hasMore ? results.slice(0, -1) : results;
    const nextCursor = hasMore ? messagesList[messagesList.length - 1].id : null;

    return {
      messages: messagesList.reverse(), // Reverse pro chronologické pořadí (nejstarší první)
      nextCursor,
      hasMore,
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to get messages');
  }
};

// Získání konkrétní zprávy
export const getMessage = async (
  messageId: string,
  userId: string
): Promise<Message | null> => {
  try {
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId));

    if (!message) return null;

    // Ověříme přístup přes chat
    const chat = await getChat(message.chatId, userId);
    if (!chat) return null;

    return message;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to get message');
  }
};

// Smazání zprávy
export const deleteMessage = async (
  messageId: string,
  userId: string
): Promise<boolean> => {
  try {
    const message = await getMessage(messageId, userId);
    if (!message) {
      throw new Error('Message not found or access denied');
    }

    // Pouze autor zprávy ji může smazat
    if (message.userId !== userId) {
      throw new Error('Only message author can delete it');
    }

    await db
      .delete(messages)
      .where(eq(messages.id, messageId));

    return true;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete message');
  }
};

// Hromadné vytvoření zpráv (pro import konverzací)
export const createMessages = async (
  messagesData: NewMessageParams[]
): Promise<Message[]> => {
  try {
    if (messagesData.length === 0) return [];

    // Ověříme přístup k chatu
    const chatId = messagesData[0].chatId;
    const userId = messagesData[0].userId;
    const chat = await getChat(chatId, userId);
    if (!chat) {
      throw new Error('Chat not found or access denied');
    }

    const insertedMessages = await db
      .insert(messages)
      .values(messagesData)
      .returning();

    // Aktualizujeme updatedAt u chatu
    await db
      .update(chats)
      .set({ updatedAt: new Date() })
      .where(eq(chats.id, chatId));

    return insertedMessages;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create messages');
  }
}; 