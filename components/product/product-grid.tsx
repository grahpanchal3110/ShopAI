// components/product/product-grid.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "./product-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  products: any[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export function ProductGrid({
  products,
  total,
  currentPage,
  totalPages,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Showing {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, total)}{" "}
        of {total} products
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
            const page = i + 1;
            return (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="icon"
                onClick={() => goToPage(page)}
                className="w-9 h-9"
              >
                {page}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
