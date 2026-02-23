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
          create: [{ url: data.imageUrl, isPrimary: true, order: 0 }],
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

type UpdateProductPayload = {
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  stock: number;
  categorySlug: string;
  imageUrl: string;
  isFeatured: boolean;
};

function normalizeImageUrl(u: string) {
  const url = (u ?? "").trim();
  if (!url) return "";

  const m = url.match(/^https?:\/\/unsplash\.com\/photos\/([a-zA-Z0-9_-]+)/);
  if (m?.[1]) return `https://source.unsplash.com/${m[1]}/1080x1080`;

  return url;
}

export async function updateProduct(
  productId: string,
  data: UpdateProductPayload,
) {
  try {
    if (!productId) return { error: "Missing productId" };

    const name = (data.name ?? "").trim();
    const description = (data.description ?? "").trim();
    const categorySlug = (data.categorySlug ?? "").trim();
    const imageUrl = normalizeImageUrl(data.imageUrl);

    if (!name) return { error: "Name is required" };
    if (!description) return { error: "Description is required" };
    if (!categorySlug) return { error: "Category is required" };
    if (!imageUrl) return { error: "Image URL is required" };
    if (!Number.isFinite(data.price) || data.price < 0)
      return { error: "Invalid price" };
    if (!Number.isFinite(data.stock) || data.stock < 0)
      return { error: "Invalid stock" };

    // Find category by slug
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      select: { id: true },
    });
    if (!category) return { error: "Category not found" };

    // Ensure product exists
    const existing = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!existing) return { error: "Product not found" };

    // Update product + replace primary image (simple and reliable)
    await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price: Math.round(Number(data.price)),
        comparePrice:
          typeof data.comparePrice === "number" &&
          Number.isFinite(data.comparePrice)
            ? Math.round(Number(data.comparePrice))
            : null,
        stock: Math.floor(Number(data.stock)),
        isInStock: Number(data.stock) > 0,
        isFeatured: Boolean(data.isFeatured),
        categoryId: category.id,

        images: {
          // Replace all images with one primary image (easy)
          deleteMany: {},
          create: [
            {
              url: imageUrl,
              altText: name,
              isPrimary: true,
              order: 0,
            },
          ],
        },
      },
    });

    // Refresh admin list + edit page
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${productId}/edit`);

    return { success: true };
  } catch (e: any) {
    return { error: e?.message ?? "Failed to update product" };
  }
}
