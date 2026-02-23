// actions/order.actions.ts
"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/get-user";
import { stripe, formatAmountForStripe } from "@/lib/payments/stripe";
import { razorpay, formatAmountForRazorpay } from "@/lib/payments/razorpay";
import { sendOrderConfirmationEmail } from "@/lib/email/resend";
import { analyzeFraud } from "@/lib/ai/fraud-detection";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const checkoutSchema = z.object({
  addressId: z.string(),
  paymentMethod: z.enum(["STRIPE", "RAZORPAY", "CASH_ON_DELIVERY"]),
  couponCode: z.string().optional(),
});

// ─── Create Order (COD or pre-payment validation) ────────────────────────────
export async function createOrder(input: z.infer<typeof checkoutSchema>) {
  const user = await requireAuth();
  const { addressId, paymentMethod, couponCode } = checkoutSchema.parse(input);

  // 1. Fetch cart
  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: true,
          variant: true,
        },
      },
      coupon: true,
    },
  });

  if (!cart || cart.items.length === 0) {
    return { error: "Your cart is empty" };
  }

  // 2. Validate stock & compute totals
  let subtotal = 0;
  const orderItems = [];

  for (const item of cart.items) {
    const price = item.variant?.price ?? item.product.price;
    const available = item.variant?.stock ?? item.product.stock;

    if (available < item.quantity) {
      return { error: `${item.product.name} only has ${available} units left` };
    }

    subtotal += price * item.quantity;
    orderItems.push({
      productId: item.productId,
      variantId: item.variantId,
      storeId: item.product.storeId,
      name: item.product.name,
      image: item.product.images?.[0] as any,
      price,
      quantity: item.quantity,
      total: price * item.quantity,
    });
  }

  // 3. Apply coupon
  let discount = 0;
  let coupon = cart.coupon;

  if (couponCode && !coupon) {
    coupon = await prisma.coupon.findFirst({
      where: { code: couponCode.toUpperCase(), isActive: true },
    });
  }

  if (coupon) {
    if (coupon.type === "PERCENTAGE") {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else if (coupon.type === "FIXED") {
      discount = Math.min(coupon.value, subtotal);
    }
  }

  const shipping = subtotal >= 500 ? 0 : 49; // free shipping above ₹500
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal - discount + shipping + tax;

  // 4. Fetch address
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId: user.id },
  });
  if (!address) return { error: "Invalid address" };

  // 5. AI Fraud Detection
  const { score: fraudScore, flags: fraudFlags } = await analyzeFraud({
    userId: user.id,
    total,
    paymentMethod,
    ipAddress: "0.0.0.0", // pass from request headers in real usage
    itemCount: cart.items.length,
  });

  if (fraudScore > 0.9) {
    return {
      error: "This transaction was flagged for review. Please contact support.",
    };
  }

  // 6. Create order record
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      addressId,
      subtotal,
      discount,
      shipping,
      tax,
      total,
      paymentMethod,
      paymentStatus:
        paymentMethod === "CASH_ON_DELIVERY" ? "PENDING" : "PENDING",
      status: paymentMethod === "CASH_ON_DELIVERY" ? "CONFIRMED" : "PENDING",
      couponId: coupon?.id,
      couponDiscount: discount,
      fraudScore,
      fraudFlags,
      items: { create: orderItems },
    },
    include: { items: true, address: true },
  });

  // 7. Reserve stock (decrement)
  for (const item of cart.items) {
    if (item.variantId) {
      await prisma.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    } else {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }
  }

  // 8. Update coupon usage
  if (coupon) {
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } },
    });
  }

  // 9. COD: clear cart + send email immediately
  if (paymentMethod === "CASH_ON_DELIVERY") {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cart.update({
      where: { id: cart.id },
      data: { couponId: null },
    });

    await sendOrderConfirmationEmail({
      id: order.id,
      orderNumber: order.orderNumber,
      email: user.email,
      name: user.name ?? "Customer",
      items: order.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      total: order.total,
      address: {
        line1: address.line1,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
      },
    }).catch(console.error);

    revalidatePath("/orders");
    return { success: true, orderId: order.id };
  }

  return { success: true, orderId: order.id, total, cartId: cart.id };
}

// ─── Create Stripe Payment Intent ────────────────────────────────────────────
export async function createStripePaymentIntent(orderId: string) {
  const user = await requireAuth();

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
  });

  if (!order) return { error: "Order not found" };

  const paymentIntent = await stripe.paymentIntents.create({
    amount: formatAmountForStripe(order.total),
    currency: "inr",
    metadata: { orderId: order.id, userId: user.id },
    description: `ShopAI Order #${order.orderNumber}`,
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { stripePaymentId: paymentIntent.id },
  });

  return { clientSecret: paymentIntent.client_secret };
}

// ─── Create Razorpay Order ────────────────────────────────────────────────────
export async function createRazorpayOrder(orderId: string) {
  const user = await requireAuth();

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
  });

  if (!order) return { error: "Order not found" };

  const rzpOrder = await razorpay.orders.create({
    amount: formatAmountForRazorpay(order.total),
    currency: "INR",
    receipt: order.orderNumber,
    notes: { orderId: order.id },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { razorpayOrderId: rzpOrder.id },
  });

  return { razorpayOrderId: rzpOrder.id, amount: rzpOrder.amount };
}

// ─── Request Return ───────────────────────────────────────────────────────────
export async function requestReturn(
  orderId: string,
  reason: string,
  description?: string,
) {
  const user = await requireAuth();

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id, status: "DELIVERED" },
  });

  if (!order) return { error: "Order not eligible for return" };

  // Check 7-day return window
  const deliveredAt = order.updatedAt;
  const daysSinceDelivery =
    (Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceDelivery > 7)
    return { error: "Return window has expired (7 days)" };

  const returnReq = await prisma.returnRequest.create({
    data: { orderId, reason, description, status: "PENDING" },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "RETURN_REQUESTED" },
  });

  revalidatePath(`/orders/${orderId}`);
  return { success: true, returnId: returnReq.id };
}

// ─── Get Orders (for listing) ─────────────────────────────────────────────────
export async function getUserOrders() {
  const user = await requireAuth();

  return prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: {
        take: 2,
        include: {
          product: {
            include: { images: { where: { isPrimary: true }, take: 1 } },
          },
        },
      },
      address: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(orderId: string) {
  const user = await requireAuth();

  return prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: {
      items: {
        include: {
          product: {
            include: { images: { where: { isPrimary: true }, take: 1 } },
          },
          variant: true,
        },
      },
      address: true,
      returnRequests: true,
    },
  });
}
