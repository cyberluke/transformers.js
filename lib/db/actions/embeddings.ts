'use server';

import { db } from '@/lib/db';
import { generateEmbeddings } from '@/lib/ai/embedding';
import { embeddings as embeddingsTable } from '@/lib/db/schema/embeddings';

interface CreateEmbeddingInput {
  content: string;
  userId: string;
  assistantId?: string;
}

export const createEmbedding = async (input: CreateEmbeddingInput) => {
  try {
    const { content, userId, assistantId } = input;

    const embeddings = await generateEmbeddings(content);
    await db.insert(embeddingsTable).values(
      embeddings.map(embedding => ({
        userId: userId,
        assistantId: assistantId || null,
        ...embedding,
      })),
    );

    return 'Embedding successfully created.';
  } catch (error) {
    return error instanceof Error && error.message.length > 0
      ? error.message
      : 'Error, please try again.';
  }
};