import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/user-helper";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

// RAZORPAY_KEY_SECRET never reaches the frontend
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

const PLAN_CONFIG = {
  test: {
    amount: 100, // ₹1 in paise — minimum Razorpay amount for live testing
    credits: 1,
    tier: "free",
    label: "Test Plan",
  },
  pro: {
    amount: 79900, // ₹799 in paise
    credits: 50,
    tier: "pro",
    label: "Pro Plan",
  },
  elite: {
    amount: 249900, // ₹2,499 in paise
    credits: 200,
    tier: "elite",
    label: "Elite Plan",
  },
} as const;

export async function POST(req: NextRequest) {
  // Auth check — return 401 JSON (not redirect) for API calls
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
    const plan = body?.plan as keyof typeof PLAN_CONFIG;

    if (!plan || !PLAN_CONFIG[plan]) {
      return NextResponse.json(
        { error: "Invalid plan. Must be 'pro' or 'elite'." },
        { status: 400 }
      );
    }

    const config = PLAN_CONFIG[plan];

    // Receipt must be ≤ 40 chars — slice clerkId suffix + timestamp
    const receipt = `rcpt_${user.id.slice(-12)}_${Date.now()}`;

    const order = await razorpay.orders.create({
      amount: config.amount,
      currency: "INR",
      receipt,
      notes: {
        userId: dbUser.id.toString(),
        plan,
        credits: config.credits.toString(),
      },
    });

    return NextResponse.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err: any) {
    console.error("[CREATE_ORDER_ERROR]:", err);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
