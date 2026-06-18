import { currentUser } from "@clerk/nextjs/server";
import { AI_MODELS } from "@/config/models";
import { checkRateLimit } from "@/lib/rate-limit";
import { NextRequest } from "next/server";

const ALLOWED_MODELS = new Set(AI_MODELS.map((m) => m.id));

export async function POST(req: NextRequest) {
  try {
    // 2.1 — Auth guard: every caller must have a valid Clerk session
    const user = await currentUser();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 2.4 — Rate limit: 10 AI generations per 60 seconds per user
    const limited = await checkRateLimit(req, user.id, "aiGeneration");
    if (limited) return limited;

    const { messages, model } = await req.json();

    // 2.7 — Validate model against server-side allowlist
    if (!model || !ALLOWED_MODELS.has(model)) {
      return new Response(
        JSON.stringify({ error: "Invalid or unsupported model." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Basic message array validation
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "messages must be a non-empty array." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          max_tokens: 12000,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("[AI_MODEL_ERROR]", error);

      return new Response(error, {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Proxy the SSE stream back to the client
    const reader = response.body!.getReader();

    const readable = new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[AI_MODEL_ROUTE_ERROR]", error);
    return new Response(
      JSON.stringify({ error: "Internal server error." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}