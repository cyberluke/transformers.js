'use server';

import { db } from '@/lib/db';
import { files, File, NewFileParams, UpdateFileParams, FileMetadata } from '@/lib/db/schema/files';
import { eq } from 'drizzle-orm';

// Vytvoření nového file záznamu
export const createFile = async (input: NewFileParams): Promise<File> => {
  try {
    // Ověříme, že je poskytnut minimálně userId nebo assistantId
    if (!input.userId && !input.assistantId) {
      throw new Error('Musí být poskytnut minimálně userId nebo assistantId');
    }

    const [file] = await db
      .insert(files)
      .values(input)
      .returning();

    return {
      ...file,
      metadata: file.metadata as FileMetadata | undefined
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to create file record');
  }
};

// Update file (status, pageCount, metadata)
export const updateFile = async (
  fileId: string,
  updates: UpdateFileParams
): Promise<File> => {
  try {
    const [updatedFile] = await db
      .update(files)
      .set(updates)
      .where(eq(files.id, fileId))
      .returning();

    if (!updatedFile) {
      throw new Error('File not found');
    }

    return {
      ...updatedFile,
      metadata: updatedFile.metadata as FileMetadata | undefined
    };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to update file');
  }
};

// Získání file podle ID
export const getFileById = async (fileId: string): Promise<File | null> => {
  try {
    const [file] = await db
      .select()
      .from(files)
      .where(eq(files.id, fileId))
      .limit(1);

    return file ? {
      ...file,
      metadata: file.metadata as FileMetadata | undefined
    } : null;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to get file');
  }
}; 