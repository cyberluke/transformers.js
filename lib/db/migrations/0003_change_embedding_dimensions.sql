-- Migration to change embedding vector dimensions from 1536 to 3072
-- This is required because we switched from text-embedding-ada-002 (1536) to text-embedding-3-large (3072)

-- Step 1: Drop the existing HNSW index (it needs to be recreated after column change)
DROP INDEX IF EXISTS "embeddingIndex";

-- Step 2: Drop the existing embedding column
ALTER TABLE "embeddings" DROP COLUMN "embedding";

-- Step 3: Add the new embedding column with 3072 dimensions
ALTER TABLE "embeddings" ADD COLUMN "embedding" vector(3072) NOT NULL DEFAULT '[]'::vector;

-- Step 4: Remove the default constraint (it was only needed for the ALTER TABLE)
ALTER TABLE "embeddings" ALTER COLUMN "embedding" DROP DEFAULT;

-- Step 5: Recreate the HNSW index for efficient similarity search
CREATE INDEX "embeddingIndex" ON "embeddings" USING hnsw ("embedding" vector_cosine_ops);