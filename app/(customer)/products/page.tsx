// app/(customer)/products/page.tsx
import { Suspense } from "react";
import { getProducts, getCategories } from "@/lib/db/queries/products";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductFilters } from "@/components/product/product-filters";
import { ProductSort } from "@/components/product/product-sort";
import { Skeleton } from "@/components/ui/skeleton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse thousands of products with AI-powered recommendations",
};

interface PageProps {
  searchParams: Promise<{
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
    inStock?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const categories = await getCategories();

  const filters = {
    category: params.category,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    sortBy: (params.sort as any) ?? "newest",
    page: Number(params.page ?? 1),
    inStock: params.inStock === "true",
    limit: 20,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <ProductFilters categories={categories} currentFilters={filters} />
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">All Products</h1>
            <ProductSort currentSort={filters.sortBy} />
          </div>

          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGridServer filters={filters} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function ProductGridServer({ filters }: { filters: any }) {
  const { products, total, pages, page } = await getProducts(filters);

  return (
    <ProductGrid
      products={products}
      total={total}
      currentPage={page}
      totalPages={pages}
    />
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}
