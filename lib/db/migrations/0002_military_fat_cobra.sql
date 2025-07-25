CREATE TABLE "files" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"file_name" text NOT NULL,
	"file_hash" varchar(64) NOT NULL,
	"content_type" varchar(100) NOT NULL,
	"file_size" integer NOT NULL,
	"source_url" text,
	"page_count" integer DEFAULT 0,
	"user_id" varchar(191) NOT NULL,
	"assistant_id" varchar(191),
	"status" varchar(20) DEFAULT 'processing',
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "embeddings" ALTER COLUMN "id" SET DATA TYPE varchar(26);--> statement-breakpoint
ALTER TABLE "embeddings" ADD COLUMN "file_id" varchar(26) NOT NULL;--> statement-breakpoint
ALTER TABLE "embeddings" ADD COLUMN "page_number" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
CREATE INDEX "files_hash_idx" ON "files" USING btree ("file_hash");--> statement-breakpoint
CREATE INDEX "files_user_id_idx" ON "files" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "files_user_id_ulid_idx" ON "files" USING btree ("user_id","id");--> statement-breakpoint
CREATE INDEX "files_assistant_id_idx" ON "files" USING btree ("assistant_id");--> statement-breakpoint
CREATE INDEX "files_status_idx" ON "files" USING btree ("status");--> statement-breakpoint
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "embeddings_file_id_idx" ON "embeddings" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "embeddings_file_page_idx" ON "embeddings" USING btree ("file_id","page_number");--> statement-breakpoint
CREATE INDEX "embeddings_user_id_idx" ON "embeddings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "embeddings_assistant_id_idx" ON "embeddings" USING btree ("assistant_id");--> statement-breakpoint
ALTER TABLE "embeddings" DROP COLUMN "updated_at";