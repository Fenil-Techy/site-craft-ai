CREATE TABLE "generation_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "generation_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer,
	"projectId" varchar,
	"model" varchar NOT NULL,
	"promptTokens" integer,
	"completionTokens" integer,
	"durationMs" integer,
	"mode" varchar(50),
	"createdOn" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "generation_logs" ADD CONSTRAINT "generation_logs_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;