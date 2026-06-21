CREATE TABLE "messages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "messages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"chatId" integer,
	"role" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"sequenceNumber" integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_chatId_chats_id_fk" FOREIGN KEY ("chatId") REFERENCES "public"."chats"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "message_chat_id_idx" ON "messages" USING btree ("chatId");--> statement-breakpoint
INSERT INTO "messages" ("chatId", "role", "content", "sequenceNumber")
SELECT 
  c.id as "chatId",
  m.role as "role",
  m.content as "content",
  (row_number() OVER (PARTITION BY c.id))::integer as "sequenceNumber"
FROM "chats" c,
json_to_recordset(c."chatMessage") as m(role text, content text);
--> statement-breakpoint
ALTER TABLE "chats" DROP COLUMN "chatMessage";