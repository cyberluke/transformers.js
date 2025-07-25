import { index, pgTable, text, varchar, vector, timestamp, integer } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { ulid } from 'ulid';
import { files } from './files';

export const embeddings = pgTable(
  "embeddings",
  {
    id: varchar('id', { length: 26 })
      .primaryKey()
      .$defaultFn(() => ulid()),
    fileId: varchar('file_id', { length: 26 })
      .notNull()
      .references(() => files.id, { onDelete: 'cascade' }), // Foreign key s cascade delete
    pageNumber: integer('page_number').notNull().default(1),
    content: text('content').notNull(), // Zachováváme pro rychlost
    embedding: vector('embedding', { dimensions: 1536 }).notNull(),
    userId: varchar('user_id', { length: 191 }), // Možná redundantní, ale praktické pro queries
    assistantId: varchar('assistant_id', { length: 191 }),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
  },
  table => ({
    embeddingIndex: index('embeddingIndex').using(
      'hnsw',
      table.embedding.op('vector_cosine_ops'),
    ),
    fileIdIndex: index('embeddings_file_id_idx').on(table.fileId),
    filePageIndex: index('embeddings_file_page_idx').on(table.fileId, table.pageNumber),
    userIdIndex: index('embeddings_user_id_idx').on(table.userId),
    assistantIdIndex: index('embeddings_assistant_id_idx').on(table.assistantId),
  }),
);

// Todo embedings zmenit na to aby to slouzilo k ukladni souboru, tedy id soboru a to bude odkazovat na tabulku documents, kde bude mit db i podle hashů