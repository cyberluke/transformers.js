import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from '@/lib/db';
import { cosineDistance, desc, gt, sql, eq } from 'drizzle-orm';
import { embeddings } from '@/lib/db/schema/embeddings';

const embeddingModel = openai.embedding('text-embedding-3-large');

const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split('.')
    .filter(i => i !== '');
};

export const generateEmbeddings = async (
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });
  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll('\\n', ' ');
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};

export const findRelevantContent = async (userQuery: string, userId: string) => {

  console.log(userQuery);
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded,
  )})`;
  const similarGuides = await db
    .select({ name: embeddings.content, similarity })
    .from(embeddings)
    .where(
      sql`${gt(similarity, 0.5)} AND ${eq(embeddings.userId, userId)}`
    )
    .orderBy(t => desc(t.similarity))
    .limit(4);
  return similarGuides;
};