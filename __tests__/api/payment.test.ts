import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock Clerk
vi.mock("@clerk/nextjs/server", () => ({
  currentUser: vi.fn(),
}));

// Mock user-helper
vi.mock("@/lib/user-helper", () => ({
  getOrCreateUser: vi.fn(),
}));

// Mock Razorpay
vi.mock("razorpay", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      orders: {
        create: vi.fn().mockResolvedValue({
          id: "order_test123",
          amount: 79900,
          currency: "INR",
        }),
      },
    })),
  };
});

// Mock DB
vi.mock("@/config/db", () => ({ db: { update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn() })) })) } }));
vi.mock("@/config/schema", () => ({ usersTable: {} }));
vi.mock("drizzle-orm", () => ({ eq: vi.fn(), sql: vi.fn() }));

import { currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/user-helper";

const mockClerkUser = { id: "clerk_user_test_id_12345" };
const mockDbUser = { id: 1, name: "Test User", email: "test@example.com", credits: 2, maxCredits: 2, tier: "free", clerkId: "clerk_user_test_id_12345" };

describe("POST /api/payment/create-order", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RAZORPAY_KEY_ID = "rzp_test_key";
    process.env.RAZORPAY_KEY_SECRET = "test_secret";
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(currentUser).mockResolvedValue(null);
    const { POST } = await import("@/app/api/payment/create-order/route");
    const req = new NextRequest("http://localhost:3000/api/payment/create-order", {
      method: "POST",
      body: JSON.stringify({ plan: "pro" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid plan", async () => {
    vi.mocked(currentUser).mockResolvedValue(mockClerkUser as any);
    vi.mocked(getOrCreateUser).mockResolvedValue(mockDbUser);
    const { POST } = await import("@/app/api/payment/create-order/route");
    const req = new NextRequest("http://localhost:3000/api/payment/create-order", {
      method: "POST",
      body: JSON.stringify({ plan: "starter" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("creates order for pro plan and returns order_id", async () => {
    vi.mocked(currentUser).mockResolvedValue(mockClerkUser as any);
    vi.mocked(getOrCreateUser).mockResolvedValue(mockDbUser);
    const { POST } = await import("@/app/api/payment/create-order/route");
    const req = new NextRequest("http://localhost:3000/api/payment/create-order", {
      method: "POST",
      body: JSON.stringify({ plan: "pro" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("order_id");
    expect(data).toHaveProperty("amount");
    expect(data).toHaveProperty("currency");
  });
});

describe("POST /api/payment/verify", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.RAZORPAY_KEY_SECRET = "test_secret";
  });

  it("returns 401 when unauthenticated", async () => {
    vi.mocked(currentUser).mockResolvedValue(null);
    const { POST } = await import("@/app/api/payment/verify/route");
    const req = new NextRequest("http://localhost:3000/api/payment/verify", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for missing fields", async () => {
    vi.mocked(currentUser).mockResolvedValue(mockClerkUser as any);
    vi.mocked(getOrCreateUser).mockResolvedValue(mockDbUser);
    const { POST } = await import("@/app/api/payment/verify/route");
    const req = new NextRequest("http://localhost:3000/api/payment/verify", {
      method: "POST",
      body: JSON.stringify({ plan: "pro" }), // missing payment fields
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid signature", async () => {
    vi.mocked(currentUser).mockResolvedValue(mockClerkUser as any);
    vi.mocked(getOrCreateUser).mockResolvedValue(mockDbUser);
    const { POST } = await import("@/app/api/payment/verify/route");
    const req = new NextRequest("http://localhost:3000/api/payment/verify", {
      method: "POST",
      body: JSON.stringify({
        razorpay_payment_id: "pay_fake",
        razorpay_order_id: "order_fake",
        razorpay_signature: "invalid_signature",
        plan: "pro",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("Signature");
  });
});
