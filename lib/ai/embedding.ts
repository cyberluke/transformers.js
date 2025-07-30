import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from '@/lib/db';
import { cosineDistance, desc, gt, sql, eq, or, isNull, and } from 'drizzle-orm';
import { embeddings } from '@/lib/db/schema/embeddings';

const embeddingModel = openai.embedding('text-embedding-3-large', {
  dimensions: 1536,
});

const generateChunks = (input: string): string[] => {
  return [input]
    // .trim()
    // .split('.')
    // .filter(i => i !== '');
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

export const findRelevantContent = async (userQuery: string, userId: string, assistantId?: string) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded,
  )})`;
  
  // Základní podmínka - podobnost musí být vyšší než 0.3
  const similarityCondition = gt(similarity, 0.3);
  
  // Společné podmínky pro embeddings
  const userGeneralEmbeddings = and(
    eq(embeddings.userId, userId),
    isNull(embeddings.assistantId)
  );
  
  const globalEmbeddings = and(
    isNull(embeddings.userId),
    isNull(embeddings.assistantId)
  );
  
  let whereCondition;
  if (assistantId) {
    // Pokud máme assistantId, hledáme navíc i embeddings pro konkrétního assistanta
    const assistantEmbeddings = and(
      isNull(embeddings.userId),
      eq(embeddings.assistantId, assistantId)
    );
    
    whereCondition = and(
      similarityCondition,
      or(assistantEmbeddings, userGeneralEmbeddings, globalEmbeddings)
    );
  } else {
    // Bez assistantId hledáme pouze obecné embeddings
    whereCondition = and(
      similarityCondition,
      or(userGeneralEmbeddings, globalEmbeddings)
    );
  }
  
  const similarGuides = await db
    .select({ name: embeddings.content, similarity })
    .from(embeddings)
    .where(whereCondition)
    .orderBy(t => desc(t.similarity))
    .limit(2);
  return similarGuides;
};