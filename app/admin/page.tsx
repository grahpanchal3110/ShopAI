import { prisma } from "@/lib/db/prisma";
import { Package, ShoppingCart, Users, Star } from "lucide-react";

async function getStats() {
  const [products, orders, users, reviews, revenue] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "PAID" },
    }),
  ]);

  return { products, orders, users, reviews, revenue: revenue._sum.total ?? 0 };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  const STATS = [
    {
      label: "Total Products",
      value: stats.products,
      icon: Package,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Total Orders",
      value: stats.orders,
      icon: ShoppingCart,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Total Users",
      value: stats.users,
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      label: "Pending Reviews",
      value: stats.reviews,
      icon: Star,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, Admin! 👋</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border rounded-2xl p-5 space-y-3">
            <div
              className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}
            >
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{value.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 border rounded-2xl p-6">
        <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
        <p className="text-4xl font-bold">₹{stats.revenue.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground mt-2">From paid orders</p>
      </div>

      {/* Recent Orders */}
      <RecentOrders />
    </div>
  );
}

async function RecentOrders() {
  const orders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="bg-card border rounded-2xl p-6">
      <h2 className="font-bold text-lg mb-4">Recent Orders</h2>
      {orders.length === 0 ? (
        <p className="text-muted-foreground text-sm">No orders yet</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div>
                <p className="text-sm font-medium">
                  {order.user.name ?? order.user.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  #{order.orderNumber.slice(-8).toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">
                  ₹{order.total.toLocaleString()}
                </p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === "DELIVERED"
                      ? "bg-green-100 text-green-700"
                      : order.status === "CANCELLED"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
