// actions/product.actions.ts
"use server";

import { prisma } from "@/lib/db/prisma";
import { requireSeller } from "@/lib/auth/get-user";
import { invalidateCache } from "@/lib/cache/redis";
import { productSchema } from "@/lib/validations/product";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { generateEmbedding } from "@/lib/ai/embeddings";

export async function createProduct(formData: FormData) {
  const seller = await requireSeller();

  const raw = Object.fromEntries(formData);
  const validated = productSchema.parse(raw);

  // Generate embedding for AI search
  const embeddingText = `${validated.name} ${validated.description} ${validated.tags?.join(" ")}`;
  const embedding = await generateEmbedding(embeddingText);

  const product = await prisma.product.create({
    data: {
      ...validated,
      storeId: seller.store!.id,
      slug: validated.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
      isInStock: validated.stock > 0,
    },
  });

  // Store embedding in Supabase pgvector
  if (embedding) {
    await storeProductEmbedding(product.id, embedding);
  }

  await invalidateCache("featured-products");
  revalidatePath("/products");

  return { success: true, productId: product.id };
}

export async function updateProductStock(productId: string, quantity: number) {
  await prisma.product.update({
    where: { id: productId },
    data: {
      stock: { decrement: quantity },
      isInStock: { set: quantity > 0 },
    },
  });
  await invalidateCache(`product:*`);
}

async function storeProductEmbedding(productId: string, embedding: number[]) {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  await supabase.from("product_embeddings").upsert({
    product_id: productId,
    embedding: `[${embedding.join(",")}]`,
    updated_at: new Date().toISOString(),
  });
}
