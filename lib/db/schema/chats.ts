import { index, pgTable, text, varchar, timestamp, json } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { ulid } from 'ulid';

export const chats = pgTable(
  'chats',
  {
    id: varchar('id', { length: 26 })
      .primaryKey()
      .$defaultFn(() => ulid()),
    userId: varchar('user_id', { length: 191 }).notNull(),
    assistentId: varchar('assistent_id', { length: 191 }),
    title: text('title').notNull(),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`now()`),
    metadata: json('metadata'),
  },
  table => ({
    userIdIndex: index('chats_user_id_idx').on(table.userId),
    createdAtIndex: index('chats_created_at_idx').on(table.createdAt),
    // Nový index pro ULID paginaci
    userIdUlidIndex: index('chats_user_id_ulid_idx').on(table.userId, table.id),
  }),
);

// Types
export type Chat = typeof chats.$inferSelect;
export type NewChatParams = {
  userId: string;
  assistentId?: string;
  title: string;
  metadata?: any;
};
export type UpdateChatParams = {
  assistentId?: string;
  title?: string;
  metadata?: any;
}; 