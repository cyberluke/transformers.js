import { index, pgTable, text, varchar, timestamp, json } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { chats } from './chats';
import { ulid } from 'ulid';

export const messages = pgTable(
  'messages',
  {
    id: varchar('id', { length: 26 })
      .primaryKey()
      .$defaultFn(() => ulid()),
    chatId: varchar('chat_id', { length: 26 })
      .references(() => chats.id, { onDelete: 'cascade' })
      .notNull(),
    userId: varchar('user_id', { length: 191 }).notNull(),
    data: json('data').notNull(),
    role: varchar('role', { length: 20 }).notNull(), // 'user', 'assistant', 'system'
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
    metadata: json('metadata'),
  },
  table => ({
    chatIdIndex: index('messages_chat_id_idx').on(table.chatId),
    userIdIndex: index('messages_user_id_idx').on(table.userId),
    createdAtIndex: index('messages_created_at_idx').on(table.createdAt),
    // Nový index pro ULID paginaci
    chatIdUlidIndex: index('messages_chat_id_ulid_idx').on(table.chatId, table.id),
  }),
);

// Types
export type Message = typeof messages.$inferSelect;
export type NewMessageParams = {
  chatId: string;
  userId: string;
  data: any;
  role: 'user' | 'assistant' | 'system';
  metadata?: any;
}; 