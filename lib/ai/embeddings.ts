// lib/ai/embeddings.ts
import OpenAI from "openai";
import { getCached } from "@/lib/cache/redis";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateEmbedding(text: string): Promise<number[]> {
  // Cache embeddings to avoid redundant API calls
  const cacheKey = `embed:${Buffer.from(text.slice(0, 100)).toString("base64")}`;
  const cached = await getCached<number[]>(
    cacheKey,
    async () => {
      const res = await openai.embeddings.create({
        model: "text-embedding-3-small", // cheapest: $0.02 per 1M tokens
        input: text.slice(0, 8000),
      });
      return res.data[0].embedding;
    },
    86400,
  ); // cache 24 hours

  return cached;
}
