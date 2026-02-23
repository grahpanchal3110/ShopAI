// app/api/ai/pricing/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { generatePricingSuggestion } from "@/lib/ai/dynamic-pricing";

export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId)
    return NextResponse.json({ error: "productId required" }, { status: 400 });

  // Verify ownership
  const product = await prisma.product.findFirst({
    where: { id: productId, store: { user: { clerkId } } },
    select: { id: true },
  });

  if (!product)
    return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const suggestion = await generatePricingSuggestion(productId);
  return NextResponse.json(suggestion);
}
