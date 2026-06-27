import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/user-helper";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq, sql } from "drizzle-orm";

const PLAN_CONFIG = {
  test: { credits: 1, tier: "free" },
  pro: { credits: 50, tier: "pro" },
  elite: { credits: 200, tier: "elite" },
} as const;

export async function POST(req: NextRequest) {
  // Auth check
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbUser = await getOrCreateUser(user);
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const body = await req.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan } = body;

    // Missing fields → 400
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !plan) {
      return NextResponse.json(
        { error: "Missing required fields: razorpay_payment_id, razorpay_order_id, razorpay_signature, plan" },
        { status: 400 }
      );
    }

    if (!PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    // Signature mismatch → 400, do NOT credit the user
    if (expectedSignature !== razorpay_signature) {
      console.error("[PAYMENT_VERIFY] Signature mismatch for user:", dbUser.id);
      return NextResponse.json(
        { error: "Signature verification failed" },
        { status: 400 }
      );
    }

    const config = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG];

    // Credit the user atomically
    await db
      .update(usersTable)
      .set({
        credits: sql`${usersTable.credits} + ${config.credits}`,
        maxCredits: sql`${usersTable.maxCredits} + ${config.credits}`,
        tier: config.tier,
      })
      .where(eq(usersTable.id, dbUser.id));

    console.log(`[PAYMENT_VERIFY] Awarded ${config.credits} credits (${plan}) to user ${dbUser.id}`);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[PAYMENT_VERIFY_ERROR]:", err);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
