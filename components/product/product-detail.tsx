// components/product/product-detail.tsx
"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { addToCart } from "@/actions/cart.actions";
import { toggleWishlist } from "@/actions/wishlist.actions";
import { ProductReviews } from "./product-reviews";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";

export function ProductDetail({ product }: { product: any }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const addItem = useCartStore((s) => s.addItem);
  const toggleCart = useCartStore((s) => s.toggleCart);

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s: number, r: any) => s + r.rating, 0) /
        product.reviews.length
      : 0;

  const discount = product.comparePrice
    ? Math.round(
        ((product.comparePrice - product.price) / product.comparePrice) * 100,
      )
    : 0;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.url,
      quantity,
      variantId: selectedVariant ?? undefined,
    });
    toggleCart();

    startTransition(async () => {
      const result = await addToCart(
        product.id,
        quantity,
        selectedVariant ?? undefined,
      );
      if (result.error) toast.error(result.error);
      else toast.success("Added to cart!");
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Image Gallery */}
      <div className="space-y-4">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted">
          <Image
            src={product.images[selectedImage]?.url ?? "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          {discount > 0 && (
            <Badge
              variant="destructive"
              className="absolute top-4 left-4 text-sm font-bold"
            >
              -{discount}% OFF
            </Badge>
          )}
        </div>

        {/* Thumbnail Strip */}
        {product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {product.images.map((img: any, i: number) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(i)}
                className={cn(
                  "relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors",
                  i === selectedImage ? "border-primary" : "border-transparent",
                )}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-5">
        <div>
          {product.store && (
            <p className="text-sm text-muted-foreground mb-1">
              by {product.store.name}
            </p>
          )}
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">
            {product.name}
          </h1>
        </div>

        {/* Rating */}
        {avgRating > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-5 w-5",
                    i < Math.round(avgRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground",
                  )}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">
              ({product._count.reviews} reviews)
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold">
            ₹{product.price.toLocaleString()}
          </span>
          {product.comparePrice && (
            <span className="text-lg text-muted-foreground line-through">
              ₹{product.comparePrice.toLocaleString()}
            </span>
          )}
          {discount > 0 && (
            <Badge
              variant="secondary"
              className="text-green-600 bg-green-100 dark:bg-green-900/30"
            >
              Save ₹{(product.comparePrice - product.price).toLocaleString()}
            </Badge>
          )}
        </div>

        <Separator />

        {/* Variants */}
        {product.variants.length > 0 && (
          <div className="space-y-3">
            <p className="font-medium text-sm">Select Option:</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v: any) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v.id)}
                  disabled={v.stock === 0}
                  className={cn(
                    "px-4 py-2 rounded-xl border text-sm font-medium transition-all",
                    selectedVariant === v.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-primary",
                    v.stock === 0 &&
                      "opacity-40 cursor-not-allowed line-through",
                  )}
                >
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="flex items-center gap-3">
          <p className="font-medium text-sm">Quantity:</p>
          <div className="flex items-center border rounded-xl">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-2 hover:bg-muted transition-colors"
            >
              –
            </button>
            <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-2 hover:bg-muted transition-colors"
            >
              +
            </button>
          </div>
          <span className="text-sm text-muted-foreground">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            size="lg"
            className="flex-1 rounded-xl"
            disabled={!product.isInStock || isPending}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Add to Cart
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-xl"
            onClick={() => {
              setWishlisted(!wishlisted);
              startTransition(() => toggleWishlist(product.id));
            }}
          >
            <Heart
              className={cn(
                "h-5 w-5",
                wishlisted && "fill-red-500 text-red-500",
              )}
            />
          </Button>
          <Button size="lg" variant="outline" className="rounded-xl">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          {[
            { icon: Truck, label: "Free Delivery", sub: "Orders ₹500+" },
            { icon: Shield, label: "Secure Payment", sub: "100% Protected" },
            { icon: RotateCcw, label: "Easy Returns", sub: "7-day policy" },
          ].map(({ icon: Icon, label, sub }) => (
            <div
              key={label}
              className="flex flex-col items-center text-center p-3 rounded-xl bg-muted/50"
            >
              <Icon className="h-5 w-5 mb-1.5 text-primary" />
              <p className="text-xs font-semibold">{label}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="description" className="flex-1">
              Description
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1">
              Reviews ({product._count.reviews})
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="description"
            className="prose dark:prose-invert max-w-none mt-4 text-sm leading-relaxed"
          >
            <p>{product.description}</p>
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 not-prose">
                {product.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="reviews" className="mt-4">
            <ProductReviews productId={product.id} reviews={product.reviews} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
