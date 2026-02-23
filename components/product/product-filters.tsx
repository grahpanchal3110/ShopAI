// components/product/product-filters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Props {
  categories: {
    id: string;
    name: string;
    slug: string;
    _count: { products: number };
  }[];
  currentFilters: any;
}

export function ProductFilters({ categories, currentFilters }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [priceRange, setPriceRange] = useState([
    currentFilters.minPrice ?? 0,
    currentFilters.maxPrice ?? 100000,
  ]);

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete("page");
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const clearAll = () => {
    router.push("/products");
    setPriceRange([0, 100000]);
  };

  const activeFilterCount = [
    currentFilters.category,
    currentFilters.minPrice,
    currentFilters.inStock,
  ].filter(Boolean).length;

  const FilterContent = () => (
    <div className="space-y-6">
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive w-full"
          onClick={clearAll}
        >
          <X className="h-4 w-4 mr-1" /> Clear all filters
        </Button>
      )}

      {/* Categories */}
      <div>
        <h3 className="font-semibold mb-3 text-sm">Category</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                updateFilter(
                  "category",
                  currentFilters.category === cat.slug ? null : cat.slug,
                )
              }
              className={`flex items-center justify-between w-full text-sm py-1 px-2 rounded-lg transition-colors ${
                currentFilters.category === cat.slug
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <span>{cat.name}</span>
              <Badge variant="secondary" className="text-xs">
                {cat._count.products}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h3 className="font-semibold mb-3 text-sm">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          onValueCommit={(v) => {
            updateFilter("minPrice", String(v[0]));
            updateFilter("maxPrice", String(v[1]));
          }}
          min={0}
          max={100000}
          step={500}
          className="mb-3"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>₹{priceRange[0].toLocaleString()}</span>
          <span>₹{priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      <Separator />

      {/* In Stock */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="inStock"
          checked={currentFilters.inStock}
          onCheckedChange={(c) => updateFilter("inStock", c ? "true" : null)}
        />
        <Label htmlFor="inStock" className="text-sm cursor-pointer">
          In Stock Only
        </Label>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block sticky top-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Filters</h2>
          {activeFilterCount > 0 && <Badge>{activeFilterCount} active</Badge>}
        </div>
        <FilterContent />
      </div>

      {/* Mobile sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-1 h-5 w-5 p-0 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
