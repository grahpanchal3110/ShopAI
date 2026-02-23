// app/api/cron/recommendations/route.ts
// Refresh recommendations for active users daily
// Add to vercel.json: { "crons": [{ "path": "/api/cron/recommendations", "schedule": "0 2 * * *" }] }

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getPersonalizedRecommendations } from "@/lib/ai/recommendations";
import { redis } from "@/lib/cache/redis";

export async function GET(req: NextRequest) {
  if (
    req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get active users (ordered in last 7 days)
  const activeUsers = await prisma.user.findMany({
    where: {
      orders: {
        some: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
    },
    select: { id: true },
    take: 100,
  });

  for (const user of activeUsers) {
    // Clear old cache and pre-warm
    await redis.del(`recs:${user.id}:8`);
    await getPersonalizedRecommendations(user.id, 8).catch(console.error);
    await new Promise((r) => setTimeout(r, 200)); // rate limit
  }

  return NextResponse.json({ refreshed: activeUsers.length });
}
