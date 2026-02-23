// lib/ai/fraud-detection.ts
import OpenAI from "openai";
import { prisma } from "@/lib/db/prisma";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface FraudInput {
  userId: string;
  total: number;
  paymentMethod: string;
  ipAddress: string;
  itemCount: number;
}

interface FraudResult {
  score: number; // 0-1 (1 = definitely fraud)
  flags: string[];
  recommendation: "ALLOW" | "REVIEW" | "BLOCK";
}

export async function analyzeFraud(input: FraudInput): Promise<FraudResult> {
  const flags: string[] = [];

  // Rule-based checks (free, instant)
  const recentOrders = await prisma.order.count({
    where: {
      userId: input.userId,
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }, // last hour
    },
  });

  if (recentOrders > 5) flags.push("HIGH_ORDER_VELOCITY");
  if (input.total > 50000) flags.push("HIGH_VALUE_ORDER");
  if (input.itemCount > 20) flags.push("HIGH_ITEM_COUNT");

  // Check for previously failed payments
  const failedPayments = await prisma.order.count({
    where: {
      userId: input.userId,
      paymentStatus: "FAILED",
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });

  if (failedPayments > 2) flags.push("REPEATED_PAYMENT_FAILURES");

  // Only call AI if there are flags (save API costs)
  if (flags.length === 0) {
    return { score: 0.05, flags: [], recommendation: "ALLOW" };
  }

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a fraud detection AI. Given transaction signals, return a JSON fraud risk assessment.
Return ONLY JSON: { "score": <0-1>, "recommendation": "<ALLOW|REVIEW|BLOCK>", "reasoning": "<brief>" }`,
        },
        {
          role: "user",
          content: JSON.stringify({
            flags,
            orderTotal: input.total,
            paymentMethod: input.paymentMethod,
            recentOrders,
            failedPayments,
          }),
        },
      ],
      temperature: 0,
      max_tokens: 150,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(res.choices[0].message.content ?? "{}");
    return {
      score: Math.min(1, Math.max(0, result.score ?? 0.5)),
      flags,
      recommendation: result.recommendation ?? "REVIEW",
    };
  } catch {
    // Fallback: use flag count as proxy
    const score = Math.min(0.9, flags.length * 0.2);
    return {
      score,
      flags,
      recommendation: score > 0.6 ? "BLOCK" : score > 0.3 ? "REVIEW" : "ALLOW",
    };
  }
}
