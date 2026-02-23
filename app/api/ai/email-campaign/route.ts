// app/api/ai/email-campaign/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { generateEmailCampaign } from "@/lib/ai/email-campaigns";

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { role: true },
  });
  if (user?.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { segment, topic, promotionDetails, save } = await req.json();

  const campaign = await generateEmailCampaign(
    segment,
    topic,
    promotionDetails,
  );

  if (save) {
    const saved = await prisma.emailCampaign.create({
      data: {
        name: topic,
        subject: campaign.subject,
        body: campaign.html,
        segment,
        status: "DRAFT",
      },
    });
    return NextResponse.json({ ...campaign, id: saved.id });
  }

  return NextResponse.json(campaign);
}
