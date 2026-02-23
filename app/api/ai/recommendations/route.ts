// app/api/ai/recommendations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getPersonalizedRecommendations } from "@/lib/ai/recommendations";
import { getTrendingProducts } from "@/lib/ai/recommendations";

export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? 8);

  if (!clerkId) {
    const trending = await getTrendingProducts(limit);
    return NextResponse.json({ products: trending, type: "trending" });
  }

  const { prisma } = await import("@/lib/db/prisma");
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!user) return NextResponse.json({ products: [], type: "none" });

  const products = await getPersonalizedRecommendations(user.id, limit);
  return NextResponse.json({ products, type: "personalized" });
}
