import { index, pgTable, text, varchar, timestamp, json, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { ulid } from 'ulid';

// Interface pro file metadata
export interface FileMetadata {
  created?: string;
  modified?: string;
  creator?: string;
  author?: string;
  title?: string;
  subject?: string;
  [key: string]: any;
}

export const files = pgTable(
  'files',
  {
    id: varchar('id', { length: 26 })
      .primaryKey()
      .$defaultFn(() => ulid()),
    fileName: text('file_name').notNull(),
    fileHash: varchar('file_hash', { length: 64 }).notNull(), // SHA-256 hash
    contentType: varchar('content_type', { length: 100 }).notNull(),
    fileSize: integer('file_size').notNull(), // v bytes
    sourceUrl: text('source_url'), // původní URL odkud se stáhl
    pageCount: integer('page_count').default(0),
    userId: varchar('user_id', { length: 191 }).notNull(),
    assistantId: varchar('assistant_id', { length: 191 }),
    status: varchar('status', { length: 20 }).default('processing'), // processing, completed, error
    metadata: json('metadata'), // extra metadata z Tiky
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
  },
  table => ({
    fileHashIndex: index('files_hash_idx').on(table.fileHash), // rychlé hledání duplikátů
    userIdIndex: index('files_user_id_idx').on(table.userId),
    userIdUlidIndex: index('files_user_id_ulid_idx').on(table.userId, table.id), // ULID paginace
    assistantIdIndex: index('files_assistant_id_idx').on(table.assistantId),
    statusIndex: index('files_status_idx').on(table.status),
  }),
);

// Types
export type File = typeof files.$inferSelect & {
  metadata?: FileMetadata;
};
export type FileWithoutUserId = Omit<File, 'userId'>;
export type NewFileParams = {
  fileName: string;
  fileHash: string;
  contentType: string;
  fileSize: number;
  sourceUrl?: string;
  pageCount?: number;
  userId: string;
  assistantId?: string;
  status?: string;
  metadata?: FileMetadata;
};
export type UpdateFileParams = {
  pageCount?: number;
  status?: string;
  metadata?: FileMetadata;
}; 