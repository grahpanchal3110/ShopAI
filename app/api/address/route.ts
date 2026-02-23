// app/api/address/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { addressSchema } from "@/lib/validations";
import { checkRateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rl = await checkRateLimit(req, "api");
  if (!rl.success) return rateLimitResponse(rl.reset);

  const body = await req.json();
  const result = addressSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues.map((i) => i.message).join(", ") },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Max 10 addresses per user
  const count = await prisma.address.count({ where: { userId: user.id } });
  if (count >= 10) {
    return NextResponse.json(
      { error: "Maximum 10 addresses allowed" },
      { status: 400 },
    );
  }

  // If setting as default, unset others
  if (result.data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: { ...result.data, userId: user.id },
  });

  return NextResponse.json(address);
}
