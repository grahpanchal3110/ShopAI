// lib/ai/vector-search.ts
import { createClient } from "@supabase/supabase-js";
import { generateEmbedding } from "./embeddings";
import { prisma } from "@/lib/db/prisma";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// SQL to run in Supabase dashboard to enable pgvector:
// CREATE EXTENSION IF NOT EXISTS vector;
// CREATE TABLE product_embeddings (
//   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
//   product_id text UNIQUE NOT NULL,
//   embedding vector(1536),
//   updated_at timestamptz DEFAULT now()
// );
// CREATE INDEX ON product_embeddings USING ivfflat (embedding vector_cosine_ops);

export async function semanticSearch(query: string, limit = 10) {
  const embedding = await generateEmbedding(query);

  const { data, error } = await supabase.rpc("match_products", {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: limit,
  });

  if (error || !data?.length) return [];

  // Hydrate with full product data from Postgres
  const productIds = data.map((d: any) => d.product_id);
  return prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    include: { images: { where: { isPrimary: true }, take: 1 } },
  });
}

// Run this SQL function in Supabase:
// CREATE OR REPLACE FUNCTION match_products(
//   query_embedding vector(1536),
//   match_threshold float,
//   match_count int
// ) RETURNS TABLE (product_id text, similarity float)
// LANGUAGE sql STABLE AS $$
//   SELECT product_id, 1 - (embedding <=> query_embedding) AS similarity
//   FROM product_embeddings
//   WHERE 1 - (embedding <=> query_embedding) > match_threshold
//   ORDER BY similarity DESC
//   LIMIT match_count;
// $$;
