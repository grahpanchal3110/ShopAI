// components/cart/cart-sheet.tsx
"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { useCartStore } from "@/store/cart-store";
import { CartItem } from "./cart-item";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function CartSheet() {
  const { items, isOpen, toggleCart, total, itemCount } = useCartStore();

  return (
    <>
      {/* Trigger */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={toggleCart}
      >
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
            {itemCount > 99 ? "99+" : itemCount}
          </Badge>
        )}
      </Button>

      {/* Sheet */}
      <Sheet open={isOpen} onOpenChange={toggleCart}>
        <SheetContent className="flex flex-col w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Cart
              <Badge variant="secondary">{itemCount} items</Badge>
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
              <div className="text-7xl">🛒</div>
              <div>
                <p className="font-semibold text-lg">Your cart is empty</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Add some products to get started!
                </p>
              </div>
              <Button onClick={toggleCart} asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-4 py-4">
                  {items.map((item) => (
                    <CartItem
                      key={`${item.productId}-${item.variantId}`}
                      item={item}
                    />
                  ))}
                </div>
              </ScrollArea>

              <SheetFooter className="flex-col gap-3 border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-lg">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Taxes and shipping calculated at checkout
                </p>
                <Button
                  size="lg"
                  className="w-full rounded-xl"
                  asChild
                  onClick={toggleCart}
                >
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full rounded-xl"
                  asChild
                  onClick={toggleCart}
                >
                  <Link href="/cart">View Cart</Link>
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
