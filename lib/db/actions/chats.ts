import { db } from '@/lib/db';
import { chats, Chat, NewChatParams, UpdateChatParams } from '@/lib/db/schema/chats';
import { eq, desc, or, isNull, sql } from 'drizzle-orm';

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

// Získání všech chatů uživatele (jen vlastní chaty)
export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    return await db
      .select()
      .from(chats)
      .where(eq(chats.userId, userId))
      .orderBy(desc(chats.updatedAt));
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to get user chats');
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