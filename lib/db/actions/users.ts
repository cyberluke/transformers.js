import { db } from '@/lib/db';
import { users, User, NewUserParams, UpdateUserParams } from '@/lib/db/schema/users';
import { eq, sql } from 'drizzle-orm';

// === BASIC USER CRUD ===

export const createUser = async (params: NewUserParams): Promise<User> => {
  try {
    const [user] = await db
      .insert(users)
      .values({
        ...params,
        updatedAt: new Date(),
      })
      .returning();

    return user;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create user');
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user || null;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to get user by ID');
  }
};

export const getUserByCasdoorId = async (casdoorId: string): Promise<User | null> => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.casdoorId, casdoorId))
      .limit(1);

    return user || null;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to get user by Casdoor ID');
  }
};

export const updateUser = async (id: string, params: UpdateUserParams): Promise<User> => {
  try {
    const [user] = await db
      .update(users)
      .set({
        ...params,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update user');
  }
};

// === TOKEN MANAGEMENT ===

export const addUserTokens = async (userId: string, tokensToAdd: number): Promise<User> => {
  try {
    const [user] = await db
      .update(users)
      .set({
        tokenBalance: sql`${users.tokenBalance} + ${tokensToAdd}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to add user tokens');
  }
};

export const removeUserTokens = async (userId: string, tokensToRemove: number): Promise<User> => {
  try {
    // Kontrola, že uživatel má dostatek tokenů
    const currentUser = await getUserById(userId);
    if (!currentUser) {
      throw new Error('User not found');
    }

    if (currentUser.tokenBalance < tokensToRemove) {
      throw new Error('Insufficient token balance');
    }

    const [user] = await db
      .update(users)
      .set({
        tokenBalance: sql`${users.tokenBalance} - ${tokensToRemove}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to remove user tokens');
  }
};

export const getUserTokens = async (userId: string): Promise<number> => {
  try {
    const [user] = await db
      .select({ tokenBalance: users.tokenBalance })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    return user.tokenBalance;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to get user tokens');
  }
};
