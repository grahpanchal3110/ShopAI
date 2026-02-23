"use client";

import { useTransition } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/actions/cart.actions";
import { useCartStore } from "@/store/cart-store";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  price: number;
  isInStock: boolean;
  images: { url: string }[];
};

export function AddToCartButton({ product }: { product: Product }) {
  const [isPending, startTransition] = useTransition();
  const addItem = useCartStore((s) => s.addItem);
  const toggleCart = useCartStore((s) => s.toggleCart);

  const handleAddToCart = () => {
    // Optimistic local update
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
      else toast.success(`${product.name} added to cart!`);
    });
  };

  return (
    <Button
      size="sm"
      className="w-full rounded-xl gap-2"
      disabled={!product.isInStock || isPending}
      onClick={handleAddToCart}
    >
      <ShoppingCart className="h-4 w-4" />
      {product.isInStock ? "Add to Cart" : "Out of Stock"}
    </Button>
  );
}
