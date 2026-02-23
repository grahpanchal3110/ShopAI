// lib/cache/cache-manager.ts
import { redis } from "@/lib/cache/redis";

export const CACHE_KEYS = {
  // Products
  product: (slug: string) => `product:${slug}`,
  products: (hash: string) => `products:${hash}`,
  featured: () => "products:featured",
  categories: () => "categories:all",
  relatedProducts: (id: string) => `related:${id}`,

  // AI
  recommendations: (userId: string) => `recs:${userId}`,
  embeddings: (hash: string) => `embed:${hash}`,
  sentiment: (hash: string) => `sentiment:${hash}`,
  pricing: (productId: string) => `pricing:${productId}`,

  // Search
  searchSuggest: (q: string) => `search:suggest:${q.toLowerCase()}`,

  // User
  cart: (userId: string) => `cart:${userId}`,
  wishlist: (userId: string) => `wishlist:${userId}`,
} as const;

export const TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
  WEEK: 604800, // 7 days
} as const;

export class CacheManager {
  static async get<T>(key: string): Promise<T | null> {
    try {
      return await redis.get<T>(key);
    } catch {
      return null; // fail open — don't break app if Redis is down
    }
  }

  static async set(key: string, value: unknown, ttl: number): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
    } catch {
      // fail silently
    }
  }

  static async del(key: string | string[]): Promise<void> {
    try {
      const keys = Array.isArray(key) ? key : [key];
      if (keys.length > 0) await redis.del(...keys);
    } catch {}
  }

  static async invalidateProduct(slug: string): Promise<void> {
    await this.del([CACHE_KEYS.product(slug), CACHE_KEYS.featured()]);
  }

  static async wrap<T>(
    key: string,
    ttl: number,
    fetcher: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;

    const fresh = await fetcher();
    await this.set(key, fresh, ttl);
    return fresh;
  }
}
