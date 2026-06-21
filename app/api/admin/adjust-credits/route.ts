import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const adminClerkId = process.env.ADMIN_CLERK_ID;
    if (!adminClerkId || user.id !== adminClerkId) {
      console.warn(`[ADMIN_ACCESS_DENIED] User ${user.id} tried to adjust credits.`);
      return new Response("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const { userId, credits, maxCredits } = body;

    if (userId === undefined || credits === undefined || maxCredits === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await db
      .update(usersTable)
      .set({
        credits: parseInt(credits),
        maxCredits: parseInt(maxCredits),
      })
      .where(eq(usersTable.id, parseInt(userId)));

    console.log(`[ADMIN_CREDIT_ADJUSTMENT] Admin ${user.id} updated user ${userId}: credits=${credits}, maxCredits=${maxCredits}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_CREDIT_ADJUSTMENT_ERROR]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
