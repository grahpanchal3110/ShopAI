// components/orders/order-card.tsx
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: {
    label: "Pending",
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  PROCESSING: {
    label: "Processing",
    color:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  SHIPPED: {
    label: "Shipped",
    color:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    color:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  },
  DELIVERED: {
    label: "Delivered",
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  RETURN_REQUESTED: {
    label: "Return Requested",
    color: "bg-gray-100 text-gray-700",
  },
  REFUNDED: {
    label: "Refunded",
    color: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  },
};

export function OrderCard({ order }: { order: any }) {
  const config = STATUS_CONFIG[order.status] ?? {
    label: order.status,
    color: "bg-gray-100",
  };

  return (
    <Link href={`/orders/${order.id}`}>
      <div className="bg-card border rounded-2xl p-5 hover:shadow-md transition-all group">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold">
                #{order.orderNumber.slice(-8).toUpperCase()}
              </p>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium",
                  config.color,
                )}
              >
                {config.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {format(new Date(order.createdAt), "MMM d, yyyy · h:mm a")}
            </p>
            <p className="text-sm font-medium">
              ₹{order.total.toLocaleString()}
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0 mt-1" />
        </div>

        {/* Product Thumbnails */}
        <div className="flex gap-2 mt-4">
          {order.items.slice(0, 4).map((item: any, i: number) => (
            <div
              key={item.id}
              className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted border"
            >
              <Image
                src={item.product.images?.[0]?.url ?? "/placeholder.png"}
                alt={item.product.name}
                fill
                className="object-cover"
                sizes="48px"
              />
              {i === 3 && order.items.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold">
                  +{order.items.length - 3}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
