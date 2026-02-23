// lib/ai/dynamic-pricing.ts
import { openai } from "./openai";
import { prisma } from "@/lib/db/prisma";
import { getCached } from "@/lib/cache/redis";

interface PricingSuggestion {
  suggestedPrice: number;
  minPrice: number;
  maxPrice: number;
  confidence: "high" | "medium" | "low";
  reasoning: string;
  factors: string[];
}

export async function generatePricingSuggestion(
  productId: string,
): Promise<PricingSuggestion | null> {
  const cacheKey = `pricing:${productId}`;

  return getCached(
    cacheKey,
    async () => {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: true,
          reviews: { select: { rating: true } },
          _count: { select: { orderItems: true, wishlistItems: true } },
        },
      });

      if (!product) return null;

      // Get market data: similar products in same category
      const similarProducts = await prisma.product.findMany({
        where: {
          categoryId: product.categoryId,
          id: { not: product.id },
          isActive: true,
        },
        select: { price: true, name: true },
        take: 10,
        orderBy: { orderItems: { _count: "desc" } },
      });

      const avgRating =
        product.reviews.length > 0
          ? product.reviews.reduce((s, r) => s + r.rating, 0) /
            product.reviews.length
          : 0;

      const marketPrices = similarProducts.map((p) => p.price);
      const avgMarketPrice =
        marketPrices.length > 0
          ? marketPrices.reduce((a, b) => a + b, 0) / marketPrices.length
          : product.price;
      const minMarket = Math.min(
        ...(marketPrices.length ? marketPrices : [product.price]),
      );
      const maxMarket = Math.max(
        ...(marketPrices.length ? marketPrices : [product.price]),
      );

      const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a pricing strategist for an Indian e-commerce marketplace.
Analyze product data and suggest optimal pricing to maximize revenue.
Consider Indian market sensitivity to price points.
Return ONLY JSON: {
  "suggestedPrice": <number>,
  "minPrice": <number>,
  "maxPrice": <number>,
  "confidence": "<high|medium|low>",
  "reasoning": "<2-3 sentences>",
  "factors": ["factor1", "factor2", ...]
}`,
          },
          {
            role: "user",
            content: JSON.stringify({
              product: {
                name: product.name,
                currentPrice: product.price,
                cost: product.cost,
                stock: product.stock,
                avgRating,
                reviewCount: product.reviews.length,
                orderCount: product._count.orderItems,
                wishlistCount: product._count.wishlistItems,
              },
              market: {
                avgPrice: avgMarketPrice,
                minPrice: minMarket,
                maxPrice: maxMarket,
                competitorCount: similarProducts.length,
              },
            }),
          },
        ],
        temperature: 0.3,
        max_tokens: 400,
        response_format: { type: "json_object" },
      });

      const parsed = JSON.parse(res.choices[0].message.content ?? "{}");

      // Save suggestion to DB
      await prisma.product.update({
        where: { id: productId },
        data: {
          suggestedPrice: parsed.suggestedPrice,
          priceUpdatedAt: new Date(),
        },
      });

      return {
        suggestedPrice: parsed.suggestedPrice ?? product.price,
        minPrice: parsed.minPrice ?? minMarket,
        maxPrice: parsed.maxPrice ?? maxMarket,
        confidence: parsed.confidence ?? "medium",
        reasoning: parsed.reasoning ?? "",
        factors: Array.isArray(parsed.factors) ? parsed.factors : [],
      };
    },
    3600,
  ); // cache 1 hour
}
