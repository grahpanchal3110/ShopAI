// lib/security/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/cache/redis";
import { NextRequest } from "next/server";

// Different limiters for different sensitivity levels
export const limiters = {
  // Public API: 30 req/min
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, "60 s"),
    prefix: "rl:api",
  }),

  // Auth endpoints: 5 attempts/15 min (brute force protection)
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    prefix: "rl:auth",
  }),

  // AI features: 10 req/min (cost control)
  ai: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    prefix: "rl:ai",
  }),

  // Checkout: 3 attempts/min (fraud prevention)
  checkout: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "60 s"),
    prefix: "rl:checkout",
  }),

  // Search: 60 req/min
  search: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, "60 s"),
    prefix: "rl:search",
  }),

  // Webhooks: bypass rate limiting (verified by signature)
  webhook: null,
};

export type LimiterKey = keyof typeof limiters;

export async function checkRateLimit(
  req: NextRequest,
  limiterKey: LimiterKey,
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}> {
  const limiter = limiters[limiterKey];
  if (!limiter)
    return { success: true, limit: 999, remaining: 999, reset: new Date() };

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1";

  const userId = req.headers.get("x-user-id"); // set by middleware
  const identifier = userId ?? ip;

  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: new Date(result.reset),
  };
}

export function rateLimitResponse(reset: Date) {
  return new Response(
    JSON.stringify({
      error: "Too many requests",
      retryAfter: Math.ceil((reset.getTime() - Date.now()) / 1000),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.ceil((reset.getTime() - Date.now()) / 1000)),
        "X-RateLimit-Reset": reset.toISOString(),
      },
    },
  );
}
