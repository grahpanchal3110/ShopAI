// app/(customer)/cart/page.tsx
"use client";

import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center space-y-4">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground">Add some products to get started!</p>
        <Button asChild className="rounded-xl mt-4">
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <Button variant="ghost" size="sm" onClick={clearCart} className="text-muted-foreground">
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="bg-card border rounded-2xl p-4 flex gap-4">
              {/* Image */}
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">
                    🛍️
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="font-medium line-clamp-1">{item.name}</p>
                {item.variantName && (
                  <p className="text-xs text-muted-foreground">{item.variantName}</p>
                )}
                <p className="text-primary font-bold mt-1">
                  ₹{item.price.toLocaleString()}
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-lg"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-sm font-medium w-6 text-center">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 rounded-lg"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Total + Remove */}
              <div className="flex flex-col items-end justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(item.productId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <p className="font-bold">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border rounded-2xl p-6 sticky top-24 space-y-4">
            <h2 className="font-bold text-lg">Order Summary</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Subtotal ({items.length} items)
                </span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className={total >= 500 ? "text-green-600 font-medium" : ""}>
                  {total >= 500 ? "FREE" : "₹49"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST (18%)</span>
                <span>₹{Math.round(total * 0.18).toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t pt-3 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>
                ₹{(total + (total >= 500 ? 0 : 49) + Math.round(total * 0.18)).toLocaleString()}
              </span>
            </div>

            <Button className="w-full rounded-xl" size="lg" asChild>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>

            <Button variant="outline" className="w-full rounded-xl" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}