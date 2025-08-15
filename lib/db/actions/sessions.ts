import { db } from '@/lib/db';
import { sessions, Session, NewSessionParams, UpdateSessionParams } from '@/lib/db/schema/sessions';
import { users, User } from '@/lib/db/schema/users';
import { eq, and, sql, desc } from 'drizzle-orm';

// === SESSION CRUD ===

export const createSession = async (params: NewSessionParams): Promise<Session> => {
  try {
    const [session] = await db
      .insert(sessions)
      .values({
        ...params,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dní
      })
      .returning();

    return session;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create session');
  }
};

export const getSessionByToken = async (sessionToken: string): Promise<Session | null> => {
  try {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.sessionToken, sessionToken))
      .limit(1);

    return session || null;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to get session by token');
  }
};

export const getUserSessions = async (userId: string): Promise<Session[]> => {
  try {
    const userSessions = await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(desc(sessions.lastUsedAt));

    return userSessions;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to get user sessions');
  }
};

export const updateSession = async (id: string, params: UpdateSessionParams): Promise<Session> => {
  try {
    const [session] = await db
      .update(sessions)
      .set(params)
      .where(eq(sessions.id, id))
      .returning();

    if (!session) {
      throw new Error('Session not found');
    }

    return session;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update session');
  }
};

export const deleteSession = async (id: string): Promise<void> => {
  try {
    await db
      .delete(sessions)
      .where(eq(sessions.id, id));
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to delete session');
  }
};

// === SESSION MANAGEMENT ===

export const refreshSessionTTL = async (sessionToken: string): Promise<Session> => {
  try {
    const now = new Date();
    const newExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dní od teď

    const [session] = await db
      .update(sessions)
      .set({
        lastUsedAt: now,
        expiresAt: newExpiresAt,
      })
      .where(eq(sessions.sessionToken, sessionToken))
      .returning();

    if (!session) {
      throw new Error('Session not found');
    }

    return session;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to refresh session TTL');
  }
};

export const getActiveUserSessions = async (userId: string): Promise<Session[]> => {
  try {
    const now = new Date();
    
    const activeSessions = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.userId, userId),
          eq(sessions.isActive, true),
          sql`${sessions.expiresAt} > ${now}`
        )
      )
      .orderBy(desc(sessions.lastUsedAt));

    return activeSessions;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to get active user sessions');
  }
};

export const revokeUserSessions = async (userId: string): Promise<void> => {
  try {
    await db
      .update(sessions)
      .set({ isActive: false })
      .where(eq(sessions.userId, userId));
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to revoke user sessions');
  }
};

export const revokeSessionsByFingerprint = async (userId: string, fingerprintId: string): Promise<void> => {
  try {
    await db
      .update(sessions)
      .set({ isActive: false })
      .where(
        and(
          eq(sessions.userId, userId),
          eq(sessions.fingerprintId, fingerprintId)
        )
      );
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to revoke sessions by fingerprint');
  }
};

// === SESSION VALIDATION ===

export const validateSession = async (sessionToken: string): Promise<{
  isValid: boolean;
  session?: Session;
  user?: User;
}> => {
  try {
    const [result] = await db
      .select({
        session: sessions,
        user: users,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.sessionToken, sessionToken))
      .limit(1);

    if (!result) {
      return { isValid: false };
    }

    const { session, user } = result;

    // // Kontrola, zda session není expirovaná a je aktivní
    const now = new Date();
    const isValid = 
      session.isActive && 
      session.expiresAt > now &&
      user.isActive;

    return {
      isValid,
      session: isValid ? session : undefined,
      user: isValid ? user : undefined,
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to validate session');
  }
};

export const isSessionExpired = (session: Session): boolean => {
  return session.expiresAt <= new Date();
};

export const shouldRefreshSession = (session: Session): boolean => {
  const now = new Date();
  const timeSinceLastUsed = now.getTime() - session.lastUsedAt.getTime();
  const thirtyMinutesInMs = 30 * 60 * 1000;
  
  return timeSinceLastUsed > thirtyMinutesInMs;
};

// === CLEANUP ===

export const cleanupExpiredSessions = async (): Promise<number> => {
  try {
    const now = new Date();
    
    const result = await db
      .delete(sessions)
      .where(sql`${sessions.expiresAt} < ${now}`)
      .returning({ id: sessions.id });

    return result.length;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to cleanup expired sessions');
  }
};
