// lib/ai/sentiment.ts
import OpenAI from "openai";
import { getCached } from "@/lib/cache/redis";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface SentimentResult {
  score: number; // -1 (negative) to 1 (positive)
  label: "positive" | "negative" | "neutral";
  isFlagged: boolean; // spam, hate speech, etc.
  reason?: string;
}

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  const cacheKey = `sentiment:${Buffer.from(text.slice(0, 100)).toString("base64")}`;

  return getCached(
    cacheKey,
    async () => {
      const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a review moderation AI. Analyze the sentiment and safety of product reviews.
Return ONLY valid JSON with this shape:
{
  "score": <number between -1 and 1>,
  "label": "<positive|negative|neutral>",
  "isFlagged": <true if spam/hate/inappropriate>,
  "reason": "<brief reason if flagged, else null>"
}`,
          },
          { role: "user", content: `Review: "${text.slice(0, 1000)}"` },
        ],
        temperature: 0,
        max_tokens: 100,
        response_format: { type: "json_object" },
      });

      const parsed = JSON.parse(res.choices[0].message.content ?? "{}");
      return {
        score: Math.max(-1, Math.min(1, parsed.score ?? 0)),
        label: parsed.label ?? "neutral",
        isFlagged: parsed.isFlagged ?? false,
        reason: parsed.reason,
      };
    },
    86400,
  ); // cache 24h — same text = same result
}
