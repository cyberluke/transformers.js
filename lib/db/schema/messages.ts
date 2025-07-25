import { index, pgTable, text, varchar, timestamp, json } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { chats } from './chats';
import { ulid } from 'ulid';
import { AppMessage } from '@/types/messages';

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
    content: text('content').notNull(), // Hlavní textový obsah zprávy
    parts: json('parts'), // Strukturované části (tool invocations, step-start, atd.)
    experimental_attachments: json('experimental_attachments'), // Attachmenty pro zprávu
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
    contentIndex: index('messages_content_idx').on(table.content), // Pro full-text search
    // Nový index pro ULID paginaci
    chatIdUlidIndex: index('messages_chat_id_ulid_idx').on(table.chatId, table.id),
  }),
);

// Types
// export type MessageWithoutContext = Omit<Message, 'chatId' | 'userId'>;
export type NewMessageParams = {
  chatId: string;
  userId: string;
  content: string;
  parts?: AppMessage['parts'] | null;
  experimental_attachments?: AppMessage['experimental_attachments'] | null;
  role: 'user' | 'assistant' | 'system';
  metadata?: any;
}; 