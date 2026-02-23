// app/(customer)/products/[slug]/page.tsx
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/db/queries/products";
import { ProductDetail } from "@/components/product/product-detail";
import { ProductCarousel } from "@/components/product/product-carousel";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.metaTitle ?? product.name,
    description:
      product.metaDescription ??
      product.shortDescription ??
      product.description.slice(0, 160),
    openGraph: {
      images: product.images[0]?.url ? [product.images[0].url] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(product.id, product.categoryId, 4);

  // Log view (fire-and-forget)
  prisma.productView
    .create({
      data: { productId: product.id, source: "direct" },
    })
    .catch(() => {});

  return (
    <div className="container mx-auto px-4 py-8 space-y-16">
      <ProductDetail product={product} />

      {related.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <ProductCarousel products={related} />
        </section>
      )}
    </div>
  );
}
