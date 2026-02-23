// app/(customer)/orders/page.tsx
import { getUserOrders } from "@/actions/order.actions";
import { OrderCard } from "@/components/orders/order-card";
import { Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const orders = await getUserOrders();

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-24 space-y-4">
          <Package className="h-16 w-16 mx-auto text-muted-foreground" />
          <h2 className="text-xl font-semibold">No orders yet</h2>
          <p className="text-muted-foreground">
            Start shopping to see your orders here
          </p>
          <Button asChild>
            <Link href="/products">Browse Products</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
