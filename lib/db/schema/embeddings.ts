import { index, pgTable, text, varchar, vector, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export const embeddings = pgTable(
  "embeddings",
  {
    id: varchar('id', { length: 191 })
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    userId: varchar('user_id', { length: 191 }),
    assistantId: varchar('assistant_id', { length: 191 }),
    content: text('content').notNull(),
    embedding: vector('embedding', { dimensions: 1536 }).notNull(),
    createdAt: timestamp('created_at')
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at')
      .notNull()
      .default(sql`now()`),
  },
  table => ({
    embeddingIndex: index('embeddingIndex').using(
      'hnsw',
      table.embedding.op('vector_cosine_ops'),
    ),
  }),
);

// Todo embedings zmenit na to aby to slouzilo k ukladni souboru, tedy id soboru a to bude odkazovat na tabulku documents, kde bude mit db i podle hashů