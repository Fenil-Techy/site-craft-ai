import { db } from "@/config/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { desc, eq, inArray } from "drizzle-orm";
import { chatTable, frameTable, projectTable } from "@/config/schema";
import { getOrCreateUser } from "@/lib/user-helper";

type ProjectListEntry = {
  projectId: string;
  frameId: string;
  chats: {
    id: number;
    frameId: string | null;
    chatMessage: unknown;
    createdBy: number | null;
    createdOn: Date | null;
  }[];
};

export async function GET(req: NextRequest) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dbUser = await getOrCreateUser(user);
  if (!dbUser) {
    return NextResponse.json({ error: "User profile not found" }, { status: 404 });
  }

  // 3.1 — Batch all queries: 3 total instead of 1 + N + N
  // Query 1: All projects for this user
  const projects = await db
    .select()
    .from(projectTable)
    .where(eq(projectTable.createdBy, dbUser.id))
    .orderBy(desc(projectTable.id));

  if (projects.length === 0) {
    return NextResponse.json([]);
  }

  const projectIds = projects
    .map((p) => p.projectId)
    .filter((id): id is string => id !== null);

  // Query 2: All frames for all projects in one shot
  const allFrames = await db
    .select({ frameId: frameTable.frameId, projectId: frameTable.projectId })
    .from(frameTable)
    .where(inArray(frameTable.projectId, projectIds));

  const allFrameIds = allFrames
    .map((f) => f.frameId)
    .filter((id): id is string => id !== null);

  // Query 3: All chats for all frames in one shot
  let allChats: ProjectListEntry["chats"] = [];
  if (allFrameIds.length > 0) {
    allChats = await db
      .select()
      .from(chatTable)
      .where(inArray(chatTable.frameId, allFrameIds));
  }

  // Reshape in JS — O(n) with Maps
  const framesByProject = new Map<string, string[]>();
  for (const frame of allFrames) {
    if (!frame.projectId || !frame.frameId) continue;
    const existing = framesByProject.get(frame.projectId) ?? [];
    existing.push(frame.frameId);
    framesByProject.set(frame.projectId, existing);
  }

  const chatsByFrame = new Map<string, ProjectListEntry["chats"]>();
  for (const chat of allChats) {
    if (!chat.frameId) continue;
    const existing = chatsByFrame.get(chat.frameId) ?? [];
    existing.push(chat);
    chatsByFrame.set(chat.frameId, existing);
  }

  const results: ProjectListEntry[] = [];
  for (const project of projects) {
    if (!project.projectId) continue;
    const frameIds = framesByProject.get(project.projectId) ?? [];
    for (const frameId of frameIds) {
      results.push({
        projectId: project.projectId,
        frameId,
        chats: chatsByFrame.get(frameId) ?? [],
      });
    }
  }

  return NextResponse.json(results);
}
