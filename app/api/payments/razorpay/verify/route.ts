// app/api/payments/razorpay/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/payments/razorpay";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = await req.json();

  const isValid = verifyRazorpaySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  );

  if (!isValid) {
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 400 },
    );
  }

  // Payment is valid — webhook will handle DB update
  // But do an optimistic update here too for UX
  await prisma.order.update({
    where: { id: orderId },
    data: {
      razorpayPaymentId: razorpay_payment_id,
      paymentStatus: "PAID",
      status: "CONFIRMED",
    },
  });

  return NextResponse.json({ success: true });
}
