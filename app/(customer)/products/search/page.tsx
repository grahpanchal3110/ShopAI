import { prisma } from "@/lib/db/prisma";
import { ProductCard } from "@/components/product/product-card";
import { Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth/get-user";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  // Get current user to check wishlist status
  const dbUser = await getCurrentUser();

  let products: any[] = [];
  let wishlistedIds = new Set<string>();

  if (query) {
    [products] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { category: { name: { contains: query, mode: "insensitive" } } },
          ],
        },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          store: { select: { name: true } },
          category: { select: { name: true } },
        },
        orderBy: { isFeatured: "desc" },
        take: 48,
      }),
    ]);

    if (dbUser) {
      const wishlist = await prisma.wishlistItem.findMany({
        where: {
          userId: dbUser.id,
          productId: { in: products.map((p) => p.id) },
        },
        select: { productId: true },
      });
      wishlistedIds = new Set(wishlist.map((w) => w.productId));
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Search className="h-6 w-6 text-muted-foreground" />
            {query ? (
              <>
                Results for{" "}
                <span className="text-primary">&ldquo;{query}&rdquo;</span>
              </>
            ) : (
              "Search Products"
            )}
          </h1>
          {query && (
            <p className="text-muted-foreground text-sm">
              {products.length === 0
                ? "No products found"
                : `${products.length} product${products.length !== 1 ? "s" : ""} found`}
            </p>
          )}
        </div>

        {/* No query state */}
        {!query && (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">What are you looking for?</h2>
            <p className="text-muted-foreground max-w-sm">
              Use the search bar above to find products, categories, and more.
            </p>
            <Button asChild className="rounded-xl">
              <Link href="/products">Browse All Products</Link>
            </Button>
          </div>
        )}

        {/* No results */}
        {query && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">No results found</h2>
            <p className="text-muted-foreground max-w-sm">
              We couldn&apos;t find anything for &ldquo;{query}&rdquo;. Try a
              different search term.
            </p>
            <Button asChild className="rounded-xl">
              <Link href="/products">Browse All Products</Link>
            </Button>
          </div>
        )}

        {/* Results Grid */}
        {products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.price,
                  comparePrice: product.comparePrice,
                  images: product.images,
                  isInStock: product.isInStock,
                  isFeatured: product.isFeatured,
                  store: product.store,
                }}
                isWishlisted={wishlistedIds.has(product.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
