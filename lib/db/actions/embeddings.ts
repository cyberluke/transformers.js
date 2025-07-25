'use server';

import { db } from '@/lib/db';
import { generateEmbedding } from '@/lib/ai/embedding';
import { embeddings as embeddingsTable } from '@/lib/db/schema/embeddings';

interface CreateEmbeddingInput {
  fileId: string;
  pageNumber: number;
  content: string;
  userId?: string; // Volitelné, může se získat z file
  assistantId?: string;
}

export const createEmbedding = async (input: CreateEmbeddingInput) => {
  try {
    const { fileId, pageNumber, content, userId, assistantId } = input;

    // Generujeme embedding pro celý obsah stránky (už nechunkujeme)
    const embedding = await generateEmbedding(content);
    
    const [insertedEmbedding] = await db.insert(embeddingsTable).values({
      fileId,
      pageNumber,
      content,
      embedding,
      userId: userId || null,
      assistantId: assistantId || null,
    }).returning();

    return {
      success: true,
      embeddingId: insertedEmbedding.id,
      message: 'Embedding successfully created.'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error && error.message.length > 0
        ? error.message
        : 'Error, please try again.'
    };
  }
};