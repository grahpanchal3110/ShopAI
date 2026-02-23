// app/api/ai/smart-search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCached } from "@/lib/cache/redis";
import { semanticSearch } from "@/lib/ai/vector-search";
import { rateLimiter } from "@/lib/cache/redis";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = await rateLimiter.limit(ip);
  if (!success)
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const q = req.nextUrl.searchParams.get("q") ?? "";
  const isSuggestions = req.nextUrl.searchParams.get("suggestions") === "true";

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [], products: [] });
  }

  if (isSuggestions) {
    const cacheKey = `search:suggest:${q.toLowerCase()}`;
    const suggestions = await getCached(
      cacheKey,
      async () => {
        const [products, searchHistory] = await Promise.all([
          // Exact/fuzzy match on product names
          prisma.product.findMany({
            where: {
              isActive: true,
              name: { contains: q, mode: "insensitive" },
            },
            select: {
              id: true,
              name: true,
              slug: true,
              price: true,
              images: {
                where: { isPrimary: true },
                take: 1,
                select: { url: true },
              },
            },
            take: 4,
          }),
          // Popular search queries matching the input
          prisma.searchLog.groupBy({
            by: ["query"],
            where: {
              query: { contains: q, mode: "insensitive" },
              results: { gt: 0 },
            },
            _count: true,
            orderBy: { _count: { query: "desc" } },
            take: 3,
          }),
        ]);

        return [
          ...products.map((p) => ({
            type: "product" as const,
            id: p.id,
            text: p.name,
            slug: p.slug,
            price: p.price,
            image: p.images[0]?.url,
          })),
          ...searchHistory.map((s) => ({
            type: "query" as const,
            text: s.query,
          })),
        ];
      },
      60,
    );

    return NextResponse.json({ suggestions });
  }

  // Full semantic search
  const [exactResults, semanticResults] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { tags: { hasSome: [q.toLowerCase()] } },
        ],
      },
      include: { images: { where: { isPrimary: true }, take: 1 } },
      take: 10,
    }),
    semanticSearch(q, 5).catch(() => []),
  ]);

  // Log search
  await prisma.searchLog
    .create({
      data: { query: q, results: exactResults.length + semanticResults.length },
    })
    .catch(() => {});

  // Deduplicate (exact results take priority)
  const exactIds = new Set(exactResults.map((p) => p.id));
  const combined = [
    ...exactResults,
    ...semanticResults.filter((p) => !exactIds.has(p.id)),
  ];

  return NextResponse.json({ products: combined, total: combined.length });
}
