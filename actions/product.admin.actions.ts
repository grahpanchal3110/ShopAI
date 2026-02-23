"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/get-user";

export async function createProduct(data: {
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  stock: number;
  categorySlug: string;
  imageUrl: string;
  isFeatured: boolean;
}) {
  try {
    await requireAdmin();

    const category = await prisma.category.findUnique({
      where: { slug: data.categorySlug },
    });
    if (!category) return { error: "Category not found" };

    // Get or create store for admin
    let store = await prisma.store.findFirst();
    if (!store) return { error: "No store found. Please seed database first." };

    // Create slug from name
    const slug =
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") +
      "-" +
      Date.now();

    await prisma.product.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        comparePrice: data.comparePrice,
        stock: data.stock,
        isInStock: data.stock > 0,
        isActive: true,
        isFeatured: data.isFeatured,
        categoryId: category.id,
        storeId: store.id,
        sku: `SKU-${Date.now()}`,
        images: {
          create: [{ url: data.imageUrl, isPrimary: true, sortOrder: 0 }],
        },
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteProduct(productId: string) {
  try {
    await requireAdmin();
    await prisma.productImage.deleteMany({ where: { productId } });
    await prisma.product.delete({ where: { id: productId } });
    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function toggleProductStatus(
  productId: string,
  isActive: boolean,
) {
  try {
    await requireAdmin();
    await prisma.product.update({
      where: { id: productId },
      data: { isActive: !isActive },
    });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
