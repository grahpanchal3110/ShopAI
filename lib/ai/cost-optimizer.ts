// lib/ai/cost-optimizer.ts

/**
 * COST OPTIMIZATION STRATEGIES IMPLEMENTED
 *
 * 1. Model Selection
 *    - gpt-4o-mini everywhere (10x cheaper than gpt-4o)
 *    - text-embedding-3-small (6x cheaper than ada-002)
 *    - HuggingFace free CLIP for visual search
 *
 * 2. Aggressive Caching (Upstash Redis)
 *    - Product descriptions: 24h cache
 *    - Embeddings: 24h cache
 *    - Recommendations: 5min cache
 *    - Sentiment analysis: 24h cache (same text = same result)
 *    - Pricing suggestions: 1h cache
 *    - Search suggestions: 60s cache
 *
 * 3. Rule-Based Pre-Filters
 *    - Fraud detection: rule checks first, AI only if flags > 0
 *    - Review moderation: auto-approve positive reviews
 *    - Recommendations: collaborative filtering first, AI for re-ranking only
 *
 * 4. Batch Operations
 *    - Email campaigns: single AI call generates template, personalization via {{name}}
 *    - Embeddings: batch index on product creation, not per-query
 *
 * 5. Request Limits
 *    - aiRateLimiter: 5 AI calls/minute per user
 *    - rateLimiter: 10 requests/10s per IP
 *    - Chat: last 10 messages only (not full history)
 *    - Search: max 8000 chars for embedding input
 *
 * ESTIMATED MONTHLY COST AT $0 BUDGET (FREE TIER):
 *    OpenAI:         ~$2-5/mo for 1000 DAU (well within free $5 credit)
 *    HuggingFace:    $0 (free inference API)
 *    Upstash Redis:  $0 (10k req/day free)
 *    Supabase:       $0 (500MB free, pgvector included)
 *    Neon DB:        $0 (0.5GB free)
 *    Cloudinary:     $0 (25GB free)
 *    Clerk:          $0 (10k MAU free)
 *    Resend:         $0 (3k emails/mo free)
 *    Vercel:         $0 (hobby tier)
 *                    ─────────────
 *    TOTAL:          ~$2-5/mo (only OpenAI API)
 */

export const AI_CONFIG = {
  models: {
    chat: "gpt-4o-mini",
    embedding: "text-embedding-3-small",
    vision: "openai/clip-vit-base-patch32", // HuggingFace
  },
  cache: {
    recommendations: 300, // 5 min
    descriptions: 86400, // 24 hours
    sentiment: 86400, // 24 hours
    embeddings: 86400, // 24 hours
    pricing: 3600, // 1 hour
    searchSuggestions: 60, // 1 min
  },
  limits: {
    chatMessages: 10, // history window
    embeddingChars: 8000, // max chars for embedding
    searchResults: 10,
    recommendations: 8,
    campaignBatchSize: 50,
  },
  fallbacks: {
    recommendations: "trending",
    search: "exact_match",
    pricing: "current_price",
    description: "manual_entry",
  },
};
