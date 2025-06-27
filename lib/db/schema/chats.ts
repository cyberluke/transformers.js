import { index, pgTable, text, varchar, timestamp, json } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export const chats = pgTable(
  'chats',
  {
    id: varchar('id', { length: 191 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
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