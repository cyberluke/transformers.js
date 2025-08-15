import { index, pgTable, text, varchar, timestamp, json, boolean, inet } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { ulid } from 'ulid';
import { users } from './users';

export const sessions = pgTable(
  'sessions',
  {
    id: varchar('id', { length: 26 })
      .primaryKey()
      .$defaultFn(() => ulid()),
    sessionToken: varchar('session_token', { length: 191 })
      .notNull()
      .unique(),
    userId: varchar('user_id', { length: 26 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    fingerprintId: varchar('fingerprint_id', { length: 191 }).notNull(),
    fingerprintData: json('fingerprint_data')
      .notNull(),
    ipAddress: inet('ip_address').notNull(),
    userAgent: text('user_agent').notNull(),
    isActive: boolean('is_active')
      .notNull()
      .default(true),
    lastUsedAt: timestamp('last_used_at')
      .notNull()
      .default(sql`now()`),
    expiresAt: timestamp('expires_at')
      .notNull()
      .$defaultFn(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 dní
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
  },
  table => ({
    sessionTokenIndex: index('sessions_session_token_idx').on(table.sessionToken),
    userIdIndex: index('sessions_user_id_idx').on(table.userId),
    fingerprintIdIndex: index('sessions_fingerprint_id_idx').on(table.fingerprintId),
    isActiveIndex: index('sessions_is_active_idx').on(table.isActive),
    expiresAtIndex: index('sessions_expires_at_idx').on(table.expiresAt),
    // Composite index pro cleanup expirovaných sessions
    isActiveExpiresAtIndex: index('sessions_is_active_expires_at_idx').on(table.isActive, table.expiresAt),
  }),
);

// Types
export type Session = typeof sessions.$inferSelect;
export type NewSessionParams = {
  sessionToken: string;
  userId: string;
  fingerprintId: string;
  fingerprintData: any;
  ipAddress: string;
  userAgent: string;
};
export type UpdateSessionParams = {
  isActive?: boolean;
  lastUsedAt?: Date;
  expiresAt?: Date;
};
