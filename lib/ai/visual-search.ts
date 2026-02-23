// lib/ai/visual-search.ts
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/db/prisma";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// HuggingFace free inference API
const HF_API_URL =
  "https://api-inference.huggingface.co/models/openai/clip-vit-base-patch32";

export async function getImageEmbedding(imageUrl: string): Promise<number[]> {
  // Fetch image and convert to base64
  const imageRes = await fetch(imageUrl);
  const buffer = await imageRes.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mimeType = imageRes.headers.get("content-type") ?? "image/jpeg";

  // Call HuggingFace CLIP — free, no API key needed for public models
  const res = await fetch(HF_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      inputs: {
        image: `data:${mimeType};base64,${base64}`,
      },
    }),
  });

  if (!res.ok) throw new Error(`HuggingFace error: ${res.statusText}`);
  const embedding: number[] = await res.json();
  return embedding;
}

// SQL to add image embeddings table in Supabase:
// CREATE TABLE image_embeddings (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   product_id text NOT NULL,
//   image_url text NOT NULL,
//   embedding vector(512),
//   created_at timestamptz DEFAULT now()
// );
// CREATE INDEX ON image_embeddings USING ivfflat (embedding vector_cosine_ops);
//
// CREATE OR REPLACE FUNCTION match_images(
//   query_embedding vector(512),
//   match_threshold float,
//   match_count int
// ) RETURNS TABLE (product_id text, similarity float)
// LANGUAGE sql STABLE AS $$
//   SELECT product_id, 1 - (embedding <=> query_embedding) AS similarity
//   FROM image_embeddings
//   WHERE 1 - (embedding <=> query_embedding) > match_threshold
//   ORDER BY similarity DESC
//   LIMIT match_count;
// $$;

export async function visualSearch(imageUrl: string, limit = 8) {
  const embedding = await getImageEmbedding(imageUrl);

  const { data, error } = await supabase.rpc("match_images", {
    query_embedding: embedding,
    match_threshold: 0.6,
    match_count: limit,
  });

  if (error || !data?.length) return [];

  const productIds = [...new Set(data.map((d: any) => d.product_id as string))];

  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    include: { images: { where: { isPrimary: true }, take: 1 } },
  });

  // Sort by similarity score
  const scoreMap = new Map(data.map((d: any) => [d.product_id, d.similarity]));
  return products.sort(
    (a, b) => (scoreMap.get(b.id) ?? 0) - (scoreMap.get(a.id) ?? 0),
  );
}

export async function indexProductImage(productId: string, imageUrl: string) {
  try {
    const embedding = await getImageEmbedding(imageUrl);

    await supabase.from("image_embeddings").upsert({
      product_id: productId,
      image_url: imageUrl,
      embedding: `[${embedding.join(",")}]`,
    });
  } catch (err) {
    console.error("Failed to index product image:", err);
  }
}
