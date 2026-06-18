import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

// Lazily instantiate so the module loads even without env vars configured
let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error(
        "Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN environment variables. " +
        "Create a free Redis database at https://upstash.com and add credentials to .env.local"
      );
    }
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

// Pre-defined limiters for different endpoint risk profiles
const limiters = {
  /** AI generation: expensive, 10 req / 60s per user */
  aiGeneration: () =>
    new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      analytics: true,
      prefix: "rl:ai-model",
    }),

  /** Project creation: credit-gated, 5 req / 60s per user */
  projectCreation: () =>
    new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(5, "60 s"),
      analytics: true,
      prefix: "rl:projects",
    }),

  /** Image upload: 20 req / 60s per user */
  imageUpload: () =>
    new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(20, "60 s"),
      analytics: true,
      prefix: "rl:imagekit",
    }),

  /** General API: 60 req / 60s per user */
  general: () =>
    new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(60, "60 s"),
      analytics: true,
      prefix: "rl:general",
    }),
} as const;

type LimiterKey = keyof typeof limiters;

/**
 * Check rate limit for a given identifier.
 * Returns null if under limit, or a 429 NextResponse if over limit.
 *
 * Usage:
 * ```ts
 * const limited = await checkRateLimit(req, userId, "aiGeneration");
 * if (limited) return limited;
 * ```
 */
export async function checkRateLimit(
  req: NextRequest,
  identifier: string,
  limiterKey: LimiterKey = "general"
): Promise<NextResponse | null> {
  // If Upstash is not configured, skip rate limiting (dev mode)
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    console.warn("[RateLimit] Upstash not configured — rate limiting is disabled.");
    return null;
  }

  try {
    const limiter = limiters[limiterKey]();
    const { success, limit, remaining, reset } = await limiter.limit(identifier);

    if (!success) {
      return NextResponse.json(
        {
          error: "Too many requests. Please slow down.",
          retryAfter: Math.ceil((reset - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": String(reset),
            "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
          },
        }
      );
    }

    return null; // Under limit — allow through
  } catch (error) {
    // If Redis is unreachable, fail open (don't block users)
    console.error("[RateLimit] Redis error — failing open:", error);
    return null;
  }
}
