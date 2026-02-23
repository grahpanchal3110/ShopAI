// app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const { type, data } = evt;

  switch (type) {
    case "user.created": {
      await prisma.user.create({
        data: {
          clerkId: data.id,
          email: data.email_addresses[0]?.email_address ?? "",
          name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
          avatar: data.image_url,
          role: "CUSTOMER",
        },
      });

      // Create empty cart for new user
      const user = await prisma.user.findUnique({
        where: { clerkId: data.id },
      });
      if (user) {
        await prisma.cart.create({ data: { userId: user.id } });
      }
      break;
    }

    case "user.updated": {
      await prisma.user.update({
        where: { clerkId: data.id },
        data: {
          email: data.email_addresses[0]?.email_address ?? undefined,
          name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
          avatar: data.image_url,
        },
      });
      break;
    }

    case "user.deleted": {
      if (data.id) {
        await prisma.user.update({
          where: { clerkId: data.id },
          data: { isBanned: true },
        });
      }
      break;
    }
  }

  return NextResponse.json({ success: true });
}
