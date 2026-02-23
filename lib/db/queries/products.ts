// lib/db/queries/products.ts
import { prisma } from "@/lib/db/prisma";
import { getCached } from "@/lib/cache/redis";
import type { Prisma } from "@prisma/client";

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  tags?: string[];
  sortBy?: "price_asc" | "price_desc" | "newest" | "rating" | "popular";
  search?: string;
  page?: number;
  limit?: number;
}

export async function getProducts(filters: ProductFilters = {}) {
  const {
    category,
    minPrice,
    maxPrice,
    rating,
    inStock,
    tags,
    sortBy = "newest",
    search,
    page = 1,
    limit = 20,
  } = filters;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(category && {
      category: { slug: category },
    }),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? { price: { gte: minPrice, lte: maxPrice } }
      : {}),
    ...(inStock && { isInStock: true, stock: { gt: 0 } }),
    ...(rating && { reviews: { some: {} } }),
    ...(tags?.length && { tags: { hasSome: tags } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { hasSome: [search] } },
      ],
    }),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput = {
    price_asc: { price: "asc" },
    price_desc: { price: "desc" },
    newest: { createdAt: "desc" },
    rating: { sentimentScore: "desc" },
    popular: { orderItems: { _count: "desc" } },
  }[sortBy] ?? { createdAt: "desc" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        category: { select: { name: true, slug: true } },
        store: { select: { name: true, slug: true } },
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true, orderItems: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: products.map((p) => ({
      ...p,
      avgRating:
        p.reviews.length > 0
          ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length
          : 0,
      reviewCount: p._count.reviews,
    })),
    total,
    pages: Math.ceil(total / limit),
    page,
  };
}

export async function getProductBySlug(slug: string) {
  const cacheKey = `product:${slug}`;

  return getCached(
    cacheKey,
    () =>
      prisma.product.findUnique({
        where: { slug, isActive: true },
        include: {
          images: { orderBy: { order: "asc" } },
          variants: true,
          category: true,
          store: { select: { name: true, slug: true, rating: true } },
          reviews: {
            where: { isApproved: true },
            include: { user: { select: { name: true, avatar: true } } },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          _count: { select: { reviews: true, wishlistItems: true } },
        },
      }),
    600, // cache 10 minutes
  );
}

export async function getFeaturedProducts() {
  return getCached(
    "featured-products",
    () =>
      prisma.product.findMany({
        where: { isActive: true, isFeatured: true },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          reviews: { select: { rating: true } },
        },
        take: 8,
        orderBy: { createdAt: "desc" },
      }),
    300,
  );
}

export async function getCategories() {
  return getCached(
    "categories",
    () =>
      prisma.category.findMany({
        include: { _count: { select: { products: true } } },
        orderBy: { name: "asc" },
      }),
    3600, // cache 1 hour
  );
}

export async function getRelatedProducts(
  productId: string,
  categoryId?: string | null,
  limit = 4,
) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: productId },
      ...(categoryId ? { categoryId } : {}),
    },
    include: {
      images: { where: { isPrimary: true }, take: 1 },
      reviews: { select: { rating: true } },
    },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
}
