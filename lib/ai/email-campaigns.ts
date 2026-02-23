// lib/ai/email-campaigns.ts
import { openai } from "./openai";
import { prisma } from "@/lib/db/prisma";
import { resend } from "@/lib/email/resend";

type CampaignSegment =
  | "all"
  | "inactive_30d"
  | "cart_abandoned"
  | "high_spenders"
  | "new_users";

export async function generateEmailCampaign(
  segment: CampaignSegment,
  topic: string,
  promotionDetails?: string,
): Promise<{ subject: string; html: string; preview: string }> {
  const segmentDescriptions: Record<CampaignSegment, string> = {
    all: "all customers",
    inactive_30d: "customers who haven't purchased in 30 days",
    cart_abandoned: "customers who left items in their cart",
    high_spenders: "premium customers who spend ₹10,000+ per month",
    new_users: "customers who signed up in the last 7 days",
  };

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an expert email marketer for ShopAI, an Indian e-commerce platform.
Write high-converting HTML emails that feel personal, not spammy.
Use Indian cultural context, mention rupees (₹), and reference local relevance.
Return JSON: { "subject": "...", "preview": "50 char preview text", "html": "complete HTML email" }`,
      },
      {
        role: "user",
        content: `Write an email campaign for: ${segmentDescriptions[segment]}
Topic: ${topic}
${promotionDetails ? `Promotion: ${promotionDetails}` : ""}
Brand: ShopAI
CTA URL: ${process.env.NEXT_PUBLIC_APP_URL}/products`,
      },
    ],
    temperature: 0.8,
    max_tokens: 1500,
    response_format: { type: "json_object" },
  });

  const parsed = JSON.parse(res.choices[0].message.content ?? "{}");
  return {
    subject: parsed.subject ?? topic,
    preview: parsed.preview ?? "",
    html: parsed.html ?? "<p>Email content</p>",
  };
}

export async function getUsersForSegment(
  segment: CampaignSegment,
): Promise<{ id: string; email: string; name: string | null }[]> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  switch (segment) {
    case "all":
      return prisma.user.findMany({
        where: { isBanned: false },
        select: { id: true, email: true, name: true },
        take: 500,
      });

    case "inactive_30d":
      return prisma.user.findMany({
        where: {
          isBanned: false,
          orders: { none: { createdAt: { gte: thirtyDaysAgo } } },
        },
        select: { id: true, email: true, name: true },
        take: 500,
      });

    case "cart_abandoned":
      return prisma.user.findMany({
        where: {
          isBanned: false,
          cart: { items: { some: {} } },
          orders: {
            none: {
              createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
            },
          },
        },
        select: { id: true, email: true, name: true },
        take: 500,
      });

    case "high_spenders":
      const highSpenderIds = await prisma.order.groupBy({
        by: ["userId"],
        where: {
          paymentStatus: "PAID",
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { total: true },
        having: { total: { _sum: { gte: 10000 } } },
      });
      return prisma.user.findMany({
        where: { id: { in: highSpenderIds.map((h) => h.userId) } },
        select: { id: true, email: true, name: true },
      });

    case "new_users":
      return prisma.user.findMany({
        where: { createdAt: { gte: sevenDaysAgo }, isBanned: false },
        select: { id: true, email: true, name: true },
        take: 500,
      });

    default:
      return [];
  }
}

export async function sendEmailCampaign(campaignId: string) {
  const campaign = await prisma.emailCampaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign || campaign.status === "SENT") return;

  const users = await getUsersForSegment(campaign.segment as CampaignSegment);

  // Send in batches of 50 (Resend batch limit)
  const BATCH_SIZE = 50;
  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users.slice(i, i + BATCH_SIZE);

    await resend.batch.send(
      batch.map((user) => ({
        from: process.env.EMAIL_FROM!,
        to: user.email,
        subject: campaign.subject,
        html: campaign.body.replace("{{name}}", user.name ?? "Valued Customer"),
      })),
    );

    // Log sends
    await prisma.emailCampaignLog.createMany({
      data: batch.map((user) => ({
        campaignId: campaign.id,
        userId: user.id,
        sentAt: new Date(),
      })),
    });

    // Small delay between batches
    if (i + BATCH_SIZE < users.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: { status: "SENT", sentAt: new Date() },
  });
}
