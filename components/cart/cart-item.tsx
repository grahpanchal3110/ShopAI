// components/cart/cart-item.tsx
"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import type { CartItem as CartItemType } from "@/store/cart-store";

export function CartItem({ item }: { item: CartItemType }) {
  const { updateQuantity, removeItem } = useCartStore();
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-3">
      {/* Image */}
      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
        <Image
          src={item.image ?? "/placeholder.png"}
          alt={item.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-medium leading-tight line-clamp-2">
          {item.name}
        </p>
        {item.variant && (
          <p className="text-xs text-muted-foreground">{item.variant}</p>
        )}
        <p className="text-sm font-bold">
          ₹{(item.price * item.quantity).toLocaleString()}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={() =>
              updateQuantity(item.productId, item.quantity - 1, item.variantId)
            }
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-sm font-medium w-8 text-center">
            {item.quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-6 w-6"
            onClick={() =>
              updateQuantity(item.productId, item.quantity + 1, item.variantId)
            }
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 ml-2 text-destructive hover:text-destructive"
            onClick={() => removeItem(item.productId, item.variantId)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
