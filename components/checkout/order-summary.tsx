// components/checkout/order-summary.tsx
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export function OrderSummary({ cart }: { cart: any }) {
  const subtotal = cart.items.reduce(
    (s: number, i: any) =>
      s + (i.variant?.price ?? i.product.price) * i.quantity,
    0,
  );
  const shipping = subtotal >= 500 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18);
  const discount = cart.coupon
    ? cart.coupon.type === "PERCENTAGE"
      ? Math.min(
          (subtotal * cart.coupon.value) / 100,
          cart.coupon.maxDiscount ?? Infinity,
        )
      : cart.coupon.value
    : 0;
  const total = subtotal - discount + shipping + tax;

  return (
    <div className="bg-card border rounded-2xl p-6 sticky top-24 space-y-4">
      <h2 className="text-lg font-bold">Order Summary</h2>

      {/* Items */}
      <div className="space-y-3">
        {cart.items.map((item: any) => {
          const product = item.product;
          const price = item.variant?.price ?? product.price;
          return (
            <div key={item.id} className="flex gap-3">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                <Image
                  src={product.images?.[0]?.url ?? "/placeholder.png"}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
                  {item.quantity}
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-1">
                  {product.name}
                </p>
                {item.variant && (
                  <p className="text-xs text-muted-foreground">
                    {item.variant.name}
                  </p>
                )}
              </div>
              <p className="text-sm font-medium shrink-0">
                ₹{(price * item.quantity).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      <Separator />

      {/* Pricing Breakdown */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>₹{subtotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
            {shipping === 0 ? "FREE" : `₹${shipping}`}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">GST (18%)</span>
          <span>₹{tax.toLocaleString()}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Coupon Discount</span>
            <span>-₹{discount.toLocaleString()}</span>
          </div>
        )}
      </div>

      <Separator />

      <div className="flex justify-between font-bold text-lg">
        <span>Total</span>
        <span>₹{total.toLocaleString()}</span>
      </div>

      {cart.coupon && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs rounded-xl p-3 text-center">
          🎉 Coupon <strong>{cart.coupon.code}</strong> applied! You saved ₹
          {discount.toLocaleString()}
        </div>
      )}
    </div>
  );
}
