// app/(customer)/orders/[orderId]/page.tsx
import { notFound } from "next/navigation";
import { getOrderById } from "@/actions/order.actions";
import { OrderTimeline } from "@/components/orders/order-timeline";
import { ReturnRequestForm } from "@/components/orders/return-request-form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { format } from "date-fns";
import Link from "next/link";
import { ExternalLink, Package } from "lucide-react";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);
  if (!order) notFound();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Order #{order.orderNumber.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Placed on {format(new Date(order.createdAt), "MMMM d, yyyy")}
          </p>
        </div>
        {order.trackingNumber && (
          <Button variant="outline" size="sm" asChild>
            <a
              href={order.trackingUrl ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Track Shipment
            </a>
          </Button>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-card border rounded-2xl p-6">
        <h2 className="font-bold mb-6">Order Status</h2>
        <OrderTimeline status={order.status} createdAt={order.createdAt} />
      </div>

      {/* Items */}
      <div className="bg-card border rounded-2xl p-6 space-y-4">
        <h2 className="font-bold">Items Ordered</h2>
        {order.items.map((item: any) => (
          <div key={item.id} className="flex gap-4">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
              <Image
                src={item.product.images?.[0]?.url ?? "/placeholder.png"}
                alt={item.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/products/${item.product.slug}`}
                className="font-medium text-sm hover:text-primary line-clamp-2"
              >
                {item.name}
              </Link>
              {item.variant && (
                <p className="text-xs text-muted-foreground">
                  {item.variant.name}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                ₹{item.price.toLocaleString()} × {item.quantity}
              </p>
            </div>
            <p className="font-medium text-sm shrink-0">
              ₹{item.total.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div className="bg-card border rounded-2xl p-6 space-y-3">
        <h2 className="font-bold">Payment Summary</h2>
        <div className="space-y-2 text-sm">
          {[
            { label: "Subtotal", value: `₹${order.subtotal.toLocaleString()}` },
            {
              label: "Shipping",
              value: order.shipping === 0 ? "FREE" : `₹${order.shipping}`,
            },
            { label: "GST (18%)", value: `₹${order.tax.toLocaleString()}` },
            ...(order.discount > 0
              ? [
                  {
                    label: "Discount",
                    value: `-₹${order.discount.toLocaleString()}`,
                  },
                ]
              : []),
            {
              label: "Payment Method",
              value: order.paymentMethod.replace(/_/g, " "),
            },
            { label: "Payment Status", value: order.paymentStatus },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <span className="text-muted-foreground">{label}</span>
              <span>{value}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between font-bold text-base">
            <span>Total Paid</span>
            <span>₹{order.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-card border rounded-2xl p-6">
        <h2 className="font-bold mb-3">Delivery Address</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong>{order.address.name}</strong>
          <br />
          {order.address.line1}
          {order.address.line2 ? `, ${order.address.line2}` : ""}
          <br />
          {order.address.city}, {order.address.state} – {order.address.pincode}
          <br />
          📞 {order.address.phone}
        </p>
      </div>

      {/* Return Request */}
      {order.status === "DELIVERED" && order.returnRequests.length === 0 && (
        <ReturnRequestForm orderId={order.id} />
      )}

      {order.returnRequests.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-6">
          <h2 className="font-bold text-orange-800 dark:text-orange-400 mb-2">
            Return Request
          </h2>
          <p className="text-sm text-orange-700 dark:text-orange-300">
            Status: <strong>{order.returnRequests[0].status}</strong>
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {order.returnRequests[0].reason}
          </p>
        </div>
      )}
    </div>
  );
}
