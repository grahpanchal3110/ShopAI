// app/api/webhooks/razorpay/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email/resend";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("x-razorpay-signature")!;

  // Verify webhook signature
  const expectedSig = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSig !== sig) {
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(body);

  switch (event.event) {
    case "payment.captured": {
      const payment = event.payload.payment.entity;
      const rzpOrderId = payment.order_id;

      const order = await prisma.order.update({
        where: { razorpayOrderId: rzpOrderId },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
          razorpayPaymentId: payment.id,
        },
        include: { user: true, items: true, address: true },
      });

      // Clear cart
      const cart = await prisma.cart.findUnique({
        where: { userId: order.userId },
      });
      if (cart) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        await prisma.cart.update({
          where: { id: cart.id },
          data: { couponId: null },
        });
      }

      await sendOrderConfirmationEmail({
        id: order.id,
        orderNumber: order.orderNumber,
        email: order.user.email,
        name: order.user.name ?? "Customer",
        items: order.items.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        total: order.total,
        address: {
          line1: order.address.line1,
          city: order.address.city,
          state: order.address.state,
          pincode: order.address.pincode,
        },
      }).catch(console.error);

      break;
    }

    case "payment.failed": {
      const payment = event.payload.payment.entity;
      const order = await prisma.order.findFirst({
        where: { razorpayOrderId: payment.order_id },
      });
      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: "FAILED", status: "CANCELLED" },
        });
      }
      break;
    }

    case "refund.processed": {
      const refund = event.payload.refund.entity;
      const order = await prisma.order.findFirst({
        where: { razorpayPaymentId: refund.payment_id },
      });
      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: "REFUNDED", status: "REFUNDED" },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
