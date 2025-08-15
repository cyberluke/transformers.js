CREATE TABLE "users" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"casdoor_id" varchar(191) NOT NULL,
	"casdoor_token" text,
	"refresh_token" text,
	"token_expires_at" timestamp,
	"roles" json DEFAULT '[]'::json NOT NULL,
	"token_balance" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_casdoor_id_unique" UNIQUE("casdoor_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(26) PRIMARY KEY NOT NULL,
	"session_token" varchar(191) NOT NULL,
	"user_id" varchar(26) NOT NULL,
	"fingerprint_id" varchar(191) NOT NULL,
	"fingerprint_data" json NOT NULL,
	"ip_address" "inet" NOT NULL,
	"user_agent" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_used_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_session_token_unique" UNIQUE("session_token")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "users_casdoor_id_idx" ON "users" USING btree ("casdoor_id");--> statement-breakpoint
CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "users_is_active_idx" ON "users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "sessions_session_token_idx" ON "sessions" USING btree ("session_token");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_fingerprint_id_idx" ON "sessions" USING btree ("fingerprint_id");--> statement-breakpoint
CREATE INDEX "sessions_is_active_idx" ON "sessions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "sessions_expires_at_idx" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "sessions_is_active_expires_at_idx" ON "sessions" USING btree ("is_active","expires_at");