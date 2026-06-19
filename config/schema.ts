import { index, integer, json, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  credits: integer().notNull().default(2)
});

export const projectTable = pgTable("projects", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  projectId: varchar().notNull().unique(),

  createdBy: varchar().references(() => usersTable.email),

  selectedModel: varchar(),

  createdOn: timestamp().defaultNow(),
}, (t) => ({
  // 3.2 — Index on createdBy so per-user project queries are O(log n)
  createdByIdx: index("project_created_by_idx").on(t.createdBy),
}));

export const frameTable = pgTable("frames", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  frameId: varchar().notNull().unique(),

  designCode: text(),

  projectId: varchar().references(() => projectTable.projectId),

  createdOn: timestamp().defaultNow(),
}, (t) => ({
  // 3.2 — Index on projectId so frame lookups by project are O(log n)
  projectIdIdx: index("frame_project_id_idx").on(t.projectId),
}));

export const chatTable = pgTable("chats", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),

  frameId: varchar().references(() => frameTable.frameId),

  chatMessage: json(),

  createdBy: varchar().references(() => usersTable.email),

  createdOn: timestamp().defaultNow(),
}, (t) => ({
  // 3.2 — Index on frameId so chat lookups by frame are O(log n)
  frameIdIdx: index("chat_frame_id_idx").on(t.frameId),
}));