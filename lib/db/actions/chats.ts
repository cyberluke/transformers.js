import { db } from '@/lib/db';
import { chats, Chat, ChatWithoutUserId, NewChatParams, UpdateChatParams } from '@/lib/db/schema/chats';
import { eq, desc, or, isNull, sql, and, lt } from 'drizzle-orm';

// Vytvoření nového chatu
export const createChat = async (input: NewChatParams): Promise<Chat> => {
  try {
    const [chat] = await db
      .insert(chats)
      .values({
        ...input,
        updatedAt: new Date(),
      })
      .returning();

    return chat;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create chat');
  }
};

// NOVÁ FUNKCE: Paginace chatů s ULID cursor (načte prvních 10, pak dalších 10, atd.)
export const getUserChatsWithPagination = async (
  userId: string,
  cursor?: string, // ULID cursor
  limit: number = 10
): Promise<{
  chats: ChatWithoutUserId[];
  nextCursor: string | null;
  hasMore: boolean;
}> => {
  try {
    const whereClause = cursor
      ? and(
          eq(chats.userId, userId),
          lt(chats.id, cursor) // ULID jsou sortable, takže lt() funguje
        )
      : eq(chats.userId, userId);

    const results = await db
      .select({
        id: chats.id,
        assistentId: chats.assistentId,
        title: chats.title,
        createdAt: chats.createdAt,
        updatedAt: chats.updatedAt,
        metadata: chats.metadata,
        // userId vynecháno - je známo z kontextu
      })
      .from(chats)
      .where(whereClause)
      .orderBy(desc(chats.id)) // Seřadit podle ULID (chronologicky)
      .limit(limit + 1); // +1 pro zjištění hasMore

    const hasMore = results.length > limit;
    const chatsList = hasMore ? results.slice(0, -1) : results;
    const nextCursor = hasMore ? chatsList[chatsList.length - 1].id : null;

    return {
      chats: chatsList,
      nextCursor,
      hasMore,
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to get paginated chats');
  }
};

// Získání konkrétního chatu
export const getChat = async (chatId: string, userId: string): Promise<Chat | null> => {
  try {
    const [chat] = await db
      .select()
      .from(chats)
      .where(
        eq(chats.id, chatId)
      );

    if (!chat) return null;

    // Kontrola přístupu - vlastník nebo sdílený chat
    const hasAccess = 
      chat.userId === userId || 
      (chat.metadata && (chat.metadata as any)?.shared === true);

    return hasAccess ? chat : null;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to get chat');
  }
};

// Aktualizace chatu
export const updateChat = async (
  chatId: string, 
  userId: string, 
  updates: UpdateChatParams
): Promise<Chat | null> => {
  try {
    // Nejdřív ověříme přístup
    const existingChat = await getChat(chatId, userId);
    if (!existingChat || existingChat.userId !== userId) {
      throw new Error('Chat not found or access denied');
    }

    const [updatedChat] = await db
      .update(chats)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(chats.id, chatId))
      .returning();

    return updatedChat;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update chat');
  }
};

// Smazání chatu
export const deleteChat = async (chatId: string, userId: string): Promise<boolean> => {
  try {
    // Nejdřív ověříme přístup
    const existingChat = await getChat(chatId, userId);
    if (!existingChat || existingChat.userId !== userId) {
      throw new Error('Chat not found or access denied');
    }

    await db
      .delete(chats)
      .where(eq(chats.id, chatId));

    return true;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete chat');
  }
};

// Sdílení/unshare chatu
export const shareChat = async (
  chatId: string, 
  userId: string, 
  shared: boolean = true
): Promise<Chat | null> => {
  try {
    const existingChat = await getChat(chatId, userId);
    if (!existingChat || existingChat.userId !== userId) {
      throw new Error('Chat not found or access denied');
    }

    const metadata = {
      ...(existingChat.metadata as any || {}),
      shared,
    };

    return await updateChat(chatId, userId, { metadata });
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to share chat');
  }
};

// Alias pro unshare
export const unshareChat = async (chatId: string, userId: string): Promise<Chat | null> => {
  return shareChat(chatId, userId, false);
};

// Získání všech sdílených chatů (veřejné chaty)
export const getSharedChats = async (): Promise<Chat[]> => {
  try {
    return await db
      .select()
      .from(chats)
      .where(sql`${chats.metadata}->>'shared' = 'true'`)
      .orderBy(desc(chats.updatedAt));
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to get shared chats');
  }
}; 