import { vi, describe, it, expect, beforeEach } from "vitest";
import { POST } from "@/app/api/ai-model/route";
import { NextRequest } from "next/server";

// Mock Clerk auth
vi.mock("@clerk/nextjs/server", () => ({
  auth: () => Promise.resolve({ has: () => false }),
  currentUser: () => Promise.resolve({
    id: "user_clerk_123",
    emailAddresses: [{ emailAddress: "test@example.com" }],
    primaryEmailAddress: { emailAddress: "test@example.com" },
  }),
}));

// Mock feature/tier models check
vi.mock("@/config/features", () => ({
  isModelAllowed: () => true,
  isUpgradedTier: () => false,
  hasWatermark: () => true,
  hasUnlimitedChat: () => false,
}));

// Mock rate limit
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: () => Promise.resolve(undefined),
}));

// Mock user helper
vi.mock("@/lib/user-helper", () => ({
  getOrCreateUser: () => Promise.resolve({
    id: 123,
    email: "test@example.com",
    tier: "free",
  }),
}));

// Mock db
vi.mock("@/config/db", () => ({
  db: {
    insert: () => ({
      values: () => Promise.resolve(),
    }),
  },
}));

describe("POST /api/ai-model - Structured Output Validation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should classify code request and return x-generation-mode header as code", async () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock;

    // 1st call: classification (returns CODE)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: "CODE" } }],
      }),
    });

    // 2nd call: streaming generation
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("data: " + JSON.stringify({
          choices: [{ delta: { content: "<div>My Portfolio</div>" } }]
        }) + "\n"));
        controller.close();
      }
    });

    fetchMock.mockResolvedValueOnce({
      ok: true,
      body: mockStream,
    });

    const request = new NextRequest("http://localhost:3000/api/ai-model", {
      method: "POST",
      body: JSON.stringify({
        model: "google/gemma-4-26b-a4b-it",
        messages: [
          { role: "system", content: "You are a designer..." },
          { role: "user", content: "Create a portfolio for a Rust dev" },
        ],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("x-generation-mode")).toBe("code");
    expect(response.headers.get("Access-Control-Expose-Headers")).toBe("x-generation-mode");

    // Verify classification fetch was called with correct parameters
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const classificationArgs = fetchMock.mock.calls[0];
    const classificationBody = JSON.parse(classificationArgs[1].body);
    expect(classificationBody.messages[1].content).toBe("Create a portfolio for a Rust dev");
    expect(classificationBody.max_tokens).toBe(10);
    expect(classificationBody.stream).toBe(false);
  });

  it("should classify chat request and return x-generation-mode header as chat", async () => {
    const fetchMock = vi.fn();
    global.fetch = fetchMock;

    // 1st call: classification (returns CHAT)
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{ message: { content: "CHAT" } }],
      }),
    });

    // 2nd call: streaming generation
    const mockStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode("data: " + JSON.stringify({
          choices: [{ delta: { content: "Rust is a programming language..." } }]
        }) + "\n"));
        controller.close();
      }
    });

    fetchMock.mockResolvedValueOnce({
      ok: true,
      body: mockStream,
    });

    const request = new NextRequest("http://localhost:3000/api/ai-model", {
      method: "POST",
      body: JSON.stringify({
        model: "google/gemma-4-26b-a4b-it",
        messages: [
          { role: "system", content: "You are a designer..." },
          { role: "user", content: "What is Rust?" },
        ],
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(response.headers.get("x-generation-mode")).toBe("chat");
  });
});
