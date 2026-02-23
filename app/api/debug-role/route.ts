import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();

    return NextResponse.json({
      userId: userId,
      role: (sessionClaims?.metadata as any)?.role ?? "NO ROLE FOUND",
      allClaims: sessionClaims,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
