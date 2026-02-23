// components/product/product-card.tsx
"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { addToCart } from "@/actions/cart.actions";
import { toggleWishlist } from "@/actions/wishlist.actions";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    images: { url: string }[];
    avgRating?: number;
    reviewCount?: number;
    isInStock: boolean;
    isFeatured?: boolean;
    store?: { name: string };
  };
  isWishlisted?: boolean;
  className?: string;
}

export function ProductCard({
  product,
  isWishlisted = false,
  className,
}: ProductCardProps) {
  const { isSignedIn } = useAuth();
  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [isPending, startTransition] = useTransition();
  const addItem = useCartStore((s) => s.addItem);
  const toggleCart = useCartStore((s) => s.toggleCart);

  const discount = product.comparePrice
    ? Math.round(
        ((product.comparePrice - product.price) / product.comparePrice) * 100,
      )
    : 0;

  const handleAddToCart = () => {
    // Optimistic local update first
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url,
      quantity: 1,
    });
    toggleCart();

    // Sync with DB
    startTransition(async () => {
      const result = await addToCart(product.id, 1);
      if (result.error) toast.error(result.error);
    });
  };

  const handleWishlist = () => {
    if (!isSignedIn) {
      toast.error("Please sign in to save items");
      return;
    }
    setWishlisted(!wishlisted); // optimistic
    startTransition(async () => {
      const result = await toggleWishlist(product.id);
      if (!result)
        setWishlisted(wishlisted); // revert
      else
        toast.success(
          result.added ? "Added to wishlist" : "Removed from wishlist",
        );
    });
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-card overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1",
        className,
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Link href={`/products/${product.slug}`}>
          <Image
            src={product.images[0]?.url ?? "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            <Badge variant="destructive" className="text-xs font-bold">
              -{discount}%
            </Badge>
          )}
          {product.isFeatured && (
            <Badge className="text-xs bg-amber-500 text-white">Featured</Badge>
          )}
          {!product.isInStock && (
            <Badge variant="secondary" className="text-xs">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full shadow-md"
            onClick={handleWishlist}
          >
            <Heart
              className={cn(
                "h-4 w-4",
                wishlisted && "fill-red-500 text-red-500",
              )}
            />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full shadow-md"
            asChild
          >
            <Link href={`/products/${product.slug}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-1.5">
        {product.store && (
          <p className="text-xs text-muted-foreground truncate">
            {product.store.name}
          </p>
        )}

        <Link
          href={`/products/${product.slug}`}
          className="text-sm font-medium line-clamp-2 hover:text-primary transition-colors leading-snug"
        >
          {product.name}
        </Link>

        {/* Rating */}
        {(product.avgRating ?? 0) > 0 && (
          <div className="flex items-center gap-1">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3 w-3",
                    i < Math.round(product.avgRating!)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground",
                  )}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto pt-1">
          <span className="text-base font-bold">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          {product.comparePrice && (
            <span className="text-base font-bold" suppressHydrationWarning>
              ₹{product.price.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        {/* <Button
          size="sm"
          className="w-full mt-2 rounded-xl"
          disabled={!product.isInStock || isPending}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4 mr-1.5" />
          {product.isInStock ? "Add to Cart" : "Out of Stock"}
        </Button> */}
        <Button
          aria-label={`Add ${product.name} to cart`}
          aria-describedby={`price-${product.id}`}
          disabled={!product.isInStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4 mr-1.5" aria-hidden="true" />
          {product.isInStock ? "Add to Cart" : "Out of Stock"}
        </Button>

        <span id={`price-${product.id}`} className="text-base font-bold">
          ₹{product.price.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  );
}
