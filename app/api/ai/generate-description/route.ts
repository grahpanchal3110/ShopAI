// app/api/ai/generate-description/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateProductDescription } from "@/lib/ai/product-description";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { aiRateLimiter } from "@/lib/cache/redis";

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { role: true },
  });
  if (user?.role !== "SELLER" && user?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Seller access required" },
      { status: 403 },
    );
  }

  const { success } = await aiRateLimiter.limit(`desc:${clerkId}`);
  if (!success)
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const body = await req.json();
  const result = await generateProductDescription(body);
  return NextResponse.json(result);
}
