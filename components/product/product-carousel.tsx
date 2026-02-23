// components/product/product-carousel.tsx
"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./product-card";

export function ProductCarousel({ products }: { products: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  if (!products.length) return null;

  return (
    <div className="relative group">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-56 md:w-64">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <Button
        variant="secondary"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
        onClick={() => scroll("left")}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <Button
        variant="secondary"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
        onClick={() => scroll("right")}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
