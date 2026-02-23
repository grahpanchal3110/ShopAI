// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/payments/stripe";
import { prisma } from "@/lib/db/prisma";
import {
  sendOrderConfirmationEmail,
  sendShippingUpdateEmail,
} from "@/lib/email/resend";
import type Stripe from "stripe";

export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    console.error("Stripe webhook error:", err.message);
    return new NextResponse(`Webhook error: ${err.message}`, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata.orderId;

      const order = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
          stripePaymentId: pi.id,
        },
        include: {
          user: true,
          items: true,
          address: true,
        },
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

      // Send email
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

    case "payment_intent.payment_failed": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const orderId = pi.metadata?.orderId;
      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: "FAILED", status: "CANCELLED" },
        });

        // Restore stock
        await restoreStock(orderId);
      }
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const pi = await stripe.paymentIntents.retrieve(
        charge.payment_intent as string,
      );
      const orderId = pi.metadata?.orderId;

      if (orderId) {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "REFUNDED",
            status: "REFUNDED",
          },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

async function restoreStock(orderId: string) {
  const items = await prisma.orderItem.findMany({ where: { orderId } });
  for (const item of items) {
    if (item.variantId) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      });
    } else {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
  }
}
