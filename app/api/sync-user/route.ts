import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const clerkUser = await currentUser();
  if (!clerkUser)
    return NextResponse.json({ error: "No clerk user" }, { status: 404 });

  // User already exists?
  const existing = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (existing) {
    return NextResponse.json({
      message: "User already exists",
      user: existing,
    });
  }

  // Create user in DB
  const user = await prisma.user.create({
    data: {
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
      avatar: clerkUser.imageUrl,
      role: "ADMIN", // pehla user admin
    },
  });

  return NextResponse.json({ message: "User created!", user });
}
