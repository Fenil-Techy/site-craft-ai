ALTER TABLE "users" ADD COLUMN "maxCredits" integer DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tier" varchar(50) DEFAULT 'free' NOT NULL;