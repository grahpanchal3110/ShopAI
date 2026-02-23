// lib/ai/recommendations.ts
import { prisma } from "@/lib/db/prisma";
import { openai } from "./openai";
import { getCached } from "@/lib/cache/redis";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function getPersonalizedRecommendations(
  userId: string,
  limit = 8,
): Promise<any[]> {
  const cacheKey = `recs:${userId}:${limit}`;

  return getCached(
    cacheKey,
    async () => {
      // Step 1: Get user's behavior signals
      const behaviors = await prisma.userBehavior.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          product: { select: { categoryId: true, tags: true, price: true } },
        },
      });

      if (behaviors.length === 0) {
        // Cold start: return trending products
        return getTrendingProducts(limit);
      }

      // Step 2: Collaborative filtering — find similar users
      const viewedProductIds = behaviors
        .filter((b) => b.productId)
        .map((b) => b.productId!);

      const similarUserIds = await prisma.userBehavior.findMany({
        where: {
          productId: { in: viewedProductIds },
          userId: { not: userId },
          action: { in: ["purchase", "add_to_cart", "wishlist"] },
        },
        select: { userId: true },
        distinct: ["userId"],
        take: 20,
      });

      const collaborativeProductIds = await prisma.userBehavior.findMany({
        where: {
          userId: { in: similarUserIds.map((u) => u.userId) },
          action: { in: ["purchase", "add_to_cart"] },
          productId: { notIn: viewedProductIds },
        },
        select: { productId: true, _count: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      // Step 3: Content-based — embed user's preference profile
      const preferenceText = behaviors
        .slice(0, 10)
        .filter((b) => b.product)
        .map((b) => `${b.action}: ${b.product?.tags?.join(", ")}`)
        .join(". ");

      let vectorCandidates: string[] = [];
      if (preferenceText) {
        const { generateEmbedding } = await import("./embeddings");
        const preferenceEmbedding = await generateEmbedding(preferenceText);

        const { data } = await supabase.rpc("match_products", {
          query_embedding: preferenceEmbedding,
          match_threshold: 0.65,
          match_count: 15,
        });

        vectorCandidates = (data ?? [])
          .map((d: any) => d.product_id)
          .filter((id: string) => !viewedProductIds.includes(id));
      }

      // Step 4: Combine candidates
      const allCandidateIds = [
        ...new Set([
          ...(collaborativeProductIds
            .map((p) => p.productId)
            .filter(Boolean) as string[]),
          ...vectorCandidates,
        ]),
      ].slice(0, 30);

      if (allCandidateIds.length === 0) return getTrendingProducts(limit);

      const candidates = await prisma.product.findMany({
        where: { id: { in: allCandidateIds }, isActive: true },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          reviews: { select: { rating: true } },
          category: { select: { name: true } },
        },
      });

      // Step 5: AI re-ranking (only if we have candidates worth ranking)
      if (candidates.length <= limit) {
        return candidates.slice(0, limit);
      }

      const rankedIds = await aiRankProducts(
        candidates,
        behaviors.slice(0, 5).map((b) => ({
          action: b.action,
          category: b.product?.categoryId ?? "",
          tags: b.product?.tags ?? [],
        })),
      );

      const rankedMap = new Map(rankedIds.map((id, i) => [id, i]));
      return candidates
        .sort(
          (a, b) => (rankedMap.get(a.id) ?? 99) - (rankedMap.get(b.id) ?? 99),
        )
        .slice(0, limit);
    },
    300,
  ); // 5-minute cache
}

async function aiRankProducts(
  products: any[],
  recentBehaviors: { action: string; category: string; tags: string[] }[],
): Promise<string[]> {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a product recommendation ranker. Given a user's recent behavior and candidate products, return the product IDs ranked by relevance.
Return ONLY a JSON array of product IDs in order of relevance: ["id1", "id2", ...]`,
        },
        {
          role: "user",
          content: JSON.stringify({
            recentBehavior: recentBehaviors,
            candidates: products.map((p) => ({
              id: p.id,
              name: p.name,
              category: p.category?.name,
              price: p.price,
              rating:
                p.reviews.length > 0
                  ? p.reviews.reduce((s: number, r: any) => s + r.rating, 0) /
                    p.reviews.length
                  : 0,
            })),
          }),
        },
      ],
      temperature: 0.3,
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(res.choices[0].message.content ?? "{}");
    return Array.isArray(parsed) ? parsed : (parsed.ids ?? []);
  } catch {
    return products.map((p) => p.id); // fallback: original order
  }
}

async function getTrendingProducts(limit: number) {
  return prisma.product.findMany({
    where: { isActive: true },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      reviews: { select: { rating: true } },
    },
    orderBy: { orderItems: { _count: "desc" } },
    take: limit,
  });
}
