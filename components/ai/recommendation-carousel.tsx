// components/ai/recommendation-carousel.tsx
"use client";

import { useEffect, useState } from "react";
import { ProductCarousel } from "@/components/product/product-carousel";
import { Skeleton } from "@/components/ui/skeleton";

export function RecommendationCarousel({ userId }: { userId: string }) {
  const [products, setProducts] = useState<any[]>([]);
  const [type, setType] = useState<"personalized" | "trending" | "none">(
    "none",
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ai/recommendations?limit=8")
      .then((r) => r.json())
      .then((d) => {
        setProducts(d.products ?? []);
        setType(d.type);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="w-64 h-80 rounded-2xl shrink-0" />
        ))}
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="space-y-2">
      {type === "personalized" && (
        <p className="text-sm text-muted-foreground">
          Based on your browsing and purchase history
        </p>
      )}
      <ProductCarousel products={products} />
    </div>
  );
}
