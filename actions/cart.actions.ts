// actions/cart.actions.ts
"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/get-user";
import { revalidatePath } from "next/cache";

export async function addToCart(
  productId: string,
  quantity = 1,
  variantId?: string,
) {
  const user = await requireAuth();

  // Ensure cart exists
  let cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: user.id } });
  }

  // Check stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { stock: true, isInStock: true, price: true },
  });

  if (!product || !product.isInStock || product.stock < quantity) {
    return { error: "Product not available in requested quantity" };
  }

  // Upsert cart item
  // await prisma.cartItem.upsert({
  //   where: {
  //     cartId_productId_variantId: {
  //       cartId: cart.id,
  //       productId,
  //       variantId: variantId ?? null,
  //     },
  //   },
  //   update: { quantity: { increment: quantity } },
  //   create: { cartId: cart.id, productId, variantId, quantity },
  // });
  // Upsert cart item
  if (variantId) {
    // Variant ke saath
    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, variantId },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: quantity } },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, variantId, quantity },
      });
    }
  } else {
    // Bina variant ke
    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, variantId: null },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: quantity } },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }
  }

  // Log behavior for recommendations
  await prisma.userBehavior.create({
    data: { userId: user.id, action: "add_to_cart", productId },
  });

  revalidatePath("/cart");
  return { success: true };
}

export async function removeFromCart(cartItemId: string) {
  const user = await requireAuth();

  await prisma.cartItem.deleteMany({
    where: { id: cartItemId, cart: { userId: user.id } },
  });

  revalidatePath("/cart");
  return { success: true };
}

export async function updateCartQuantity(cartItemId: string, quantity: number) {
  const user = await requireAuth();

  if (quantity <= 0) {
    await removeFromCart(cartItemId);
    return { success: true };
  }

  await prisma.cartItem.updateMany({
    where: { id: cartItemId, cart: { userId: user.id } },
    data: { quantity },
  });

  revalidatePath("/cart");
  return { success: true };
}

export async function getCartWithItems() {
  const user = await requireAuth();

  return prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: {
            include: { images: { where: { isPrimary: true }, take: 1 } },
          },
          variant: true,
        },
      },
      coupon: true,
    },
  });
}

export async function applyCoupon(code: string) {
  const user = await requireAuth();

  const coupon = await prisma.coupon.findFirst({
    where: {
      code: { equals: code, mode: "insensitive" },
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      OR: [
        { usageLimit: null },
        { usedCount: { lt: prisma.coupon.fields.usageLimit } },
      ],
    },
  });

  if (!coupon) return { error: "Invalid or expired coupon" };

  const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
  if (!cart) return { error: "Cart not found" };

  await prisma.cart.update({
    where: { id: cart.id },
    data: { couponId: coupon.id },
  });

  revalidatePath("/cart");
  return { success: true, coupon };
}
