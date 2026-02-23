// actions/review.actions.ts
"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/get-user";
import { analyzeSentiment } from "@/lib/ai/sentiment";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  body: z.string().min(10).max(2000),
});

export async function submitReview(data: z.infer<typeof reviewSchema>) {
  const user = await requireAuth();
  const validated = reviewSchema.parse(data);

  // Check verified purchase
  const purchase = await prisma.orderItem.findFirst({
    where: {
      productId: validated.productId,
      order: { userId: user.id, status: "DELIVERED" },
    },
  });

  // Run AI sentiment analysis (non-blocking)
  const sentiment = await analyzeSentiment(validated.body).catch(() => null);

  const review = await prisma.review.upsert({
    where: {
      productId_userId: {
        productId: validated.productId,
        userId: user.id,
      },
    },
    update: {
      rating: validated.rating,
      title: validated.title,
      body: validated.body,
      sentimentScore: sentiment?.score,
      sentimentLabel: sentiment?.label,
      isFlagged: sentiment?.isFlagged ?? false,
      isApproved: !sentiment?.isFlagged, // auto-approve if not flagged
    },
    create: {
      ...validated,
      userId: user.id,
      orderId: purchase?.orderId,
      sentimentScore: sentiment?.score,
      sentimentLabel: sentiment?.label,
      isFlagged: sentiment?.isFlagged ?? false,
      isApproved: !sentiment?.isFlagged,
    },
  });

  // Update product sentiment score
  const reviews = await prisma.review.findMany({
    where: { productId: validated.productId, isApproved: true },
    select: { sentimentScore: true },
  });

  const avgSentiment =
    reviews
      .filter((r) => r.sentimentScore !== null)
      .reduce((s, r) => s + r.sentimentScore!, 0) / (reviews.length || 1);

  await prisma.product.update({
    where: { id: validated.productId },
    data: { sentimentScore: avgSentiment },
  });

  revalidatePath(`/products/${validated.productId}`);
  return { success: true, review };
}
