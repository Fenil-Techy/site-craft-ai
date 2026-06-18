import { db } from "@/config/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { desc, eq, inArray } from "drizzle-orm";
import { chatTable, frameTable, projectTable } from "@/config/schema";

type ProjectListEntry = {
  projectId: string;
  frameId: string;
  chats: {
    id: number;
    frameId: string | null;
    chatMessage: unknown;
    createdBy: string | null;
    createdOn: Date | null;
  }[];
};

export async function GET(req: NextRequest) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) {
    return NextResponse.json({ error: "User email not found" }, { status: 400 });
  }

  const projects = await db
    .select()
    .from(projectTable)
    .where(eq(projectTable.createdBy, email))
    .orderBy(desc(projectTable.id));

  const results: ProjectListEntry[] = [];

  for (const project of projects) {
    if (!project.projectId) continue;

    const frames = await db
      .select({ frameId: frameTable.frameId })
      .from(frameTable)
      .where(eq(frameTable.projectId, project.projectId));

    const frameIds = frames
      .map((f) => f.frameId)
      .filter((id): id is string => id !== null);

    let chats: ProjectListEntry["chats"] = [];
    if (frameIds.length > 0) {
      chats = await db
        .select()
        .from(chatTable)
        .where(inArray(chatTable.frameId, frameIds));
    }

    for (const frame of frames) {
      if (!frame.frameId) continue;
      results.push({
        projectId: project.projectId,
        frameId: frame.frameId,
        chats: chats.filter((c) => c.frameId === frame.frameId),
      });
    }
  }

  return NextResponse.json(results);
}
