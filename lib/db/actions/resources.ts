'use server';

import {
  NewResourceParams,
  insertResourceSchema,
  resources,
} from '@/lib/db/schema/resources';
import { db } from '@/lib/db';
import { generateEmbeddings } from '@/lib/ai/embedding';
import { embeddings as embeddingsTable } from '@/lib/db/schema/embeddings';

export const createResource = async (input: NewResourceParams & { userId: string }) => {
  try {
    const { content, userId } = input;

    const [resource] = await db
      .insert(resources)
      .values({ content, userId })
      .returning();

    const embeddings = await generateEmbeddings(content);
    await db.insert(embeddingsTable).values(
      embeddings.map(embedding => ({
        resourceId: resource.id,
        userId: userId,
        ...embedding,
      })),
    );

    return 'Resource successfully created and embedded.';
  } catch (error) {
    return error instanceof Error && error.message.length > 0
      ? error.message
      : 'Error, please try again.';
  }
};