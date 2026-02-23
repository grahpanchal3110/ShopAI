// lib/ai/openai.ts
import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  maxRetries: 2,
  timeout: 30000,
});

// Cost tracking utility
export async function trackAICost(
  model: string,
  inputTokens: number,
  outputTokens: number,
  feature: string,
) {
  const costs: Record<string, { input: number; output: number }> = {
    "gpt-4o-mini": { input: 0.15, output: 0.6 }, // per 1M tokens
    "text-embedding-3-small": { input: 0.02, output: 0 },
  };

  const modelCost = costs[model];
  if (!modelCost) return;

  const cost =
    (inputTokens / 1_000_000) * modelCost.input +
    (outputTokens / 1_000_000) * modelCost.output;

  // Log to console in dev, to DB in prod
  if (process.env.NODE_ENV === "development") {
    console.log(
      `[AI Cost] ${feature}: $${cost.toFixed(6)} (${inputTokens}in/${outputTokens}out)`,
    );
  }
}
