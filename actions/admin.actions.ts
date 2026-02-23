// // actions/admin.actions.ts
// "use server";

// import { prisma } from "@/lib/db/prisma";
// import { requireAdmin } from "@/lib/auth/get-user";
// import { revalidatePath } from "next/cache";

// export async function approveReview(reviewId: string) {
//   await requireAdmin();
//   await prisma.review.update({
//     where: { id: reviewId },
//     data: { isApproved: true, isFlagged: false },
//   });
//   revalidatePath("/admin/reviews");
// }

// export async function deleteReview(reviewId: string) {
//   await requireAdmin();
//   await prisma.review.delete({ where: { id: reviewId } });
//   revalidatePath("/admin/reviews");
// }

// export async function updateOrderStatus(
//   orderId: string,
//   status: string,
//   trackingNumber?: string,
// ) {
//   await requireAdmin();

//   const order = await prisma.order.update({
//     where: { id: orderId },
//     data: {
//       status: status as any,
//       ...(trackingNumber ? { trackingNumber } : {}),
//     },
//     include: { user: true },
//   });

//   // Send email notification
//   const { sendShippingUpdateEmail } = await import("@/lib/email/resend");
//   if (["SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(status)) {
//     await sendShippingUpdateEmail({
//       email: order.user.email,
//       name: order.user.name ?? "Customer",
//       orderNumber: order.orderNumber,
//       orderId: order.id,
//       status,
//       trackingNumber,
//     }).catch(console.error);
//   }

//   revalidatePath("/admin/orders");
//   return { success: true };
// }

"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/get-user";

export async function approveReview(reviewId: string) {
  await requireAdmin();
  await prisma.review.update({
    where: { id: reviewId },
    data: { isApproved: true, isFlagged: false },
  });
  revalidatePath("/admin/reviews");
  return { success: true };
}

export async function deleteReview(reviewId: string) {
  await requireAdmin();
  await prisma.review.delete({ where: { id: reviewId } });
  revalidatePath("/admin/reviews");
  return { success: true };
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  trackingNumber?: string,
) {
  await requireAdmin();
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: status as any,
      ...(trackingNumber ? { trackingNumber } : {}),
    },
  });
  revalidatePath("/admin/orders");
  return { success: true };
}

export async function createCoupon(data: {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  usageLimit?: number;
  minOrderAmount?: number;
  expiresAt?: Date;
}) {
  try {
    await requireAdmin();

    const existing = await prisma.coupon.findUnique({
      where: { code: data.code },
    });
    if (existing) return { error: "Coupon code already exists" };

    await prisma.coupon.create({
      data: { ...data, isActive: true },
    });

    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function banUser(userId: string, isBanned: boolean) {
  await requireAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { isBanned },
  });
  revalidatePath("/admin/users");
  return { success: true };
}

export async function changeUserRole(
  userId: string,
  role: "ADMIN" | "SELLER" | "CUSTOMER",
) {
  await requireAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { role },
  });
  revalidatePath("/admin/users");
  return { success: true };
}
