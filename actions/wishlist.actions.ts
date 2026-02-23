// actions/wishlist.actions.ts
"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/get-user";
import { revalidatePath } from "next/cache";

export async function toggleWishlist(productId: string) {
  const user = await requireAuth();

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/wishlist");
    return { added: false };
  } else {
    await prisma.wishlistItem.create({ data: { userId: user.id, productId } });
    await prisma.userBehavior.create({
      data: { userId: user.id, action: "wishlist", productId },
    });
    revalidatePath("/wishlist");
    return { added: true };
  }
}

export async function getWishlist() {
  const user = await requireAuth();

  return prisma.wishlistItem.findMany({
    where: { userId: user.id },
    include: {
      product: {
        include: { images: { where: { isPrimary: true }, take: 1 } },
      },
    },
    orderBy: { addedAt: "desc" },
  });
}
