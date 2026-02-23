// app/(admin)/admin/dashboard/page.tsx
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/get-user";
import { StatsCard } from "@/components/dashboard/stats-card";
import { FraudOrdersTable } from "@/components/dashboard/fraud-orders-table";
import { RevenueChart } from "@/components/dashboard/revenue-chart";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [
    totalRevenue,
    totalOrders,
    totalUsers,
    pendingReviews,
    highFraudOrders,
    recentRevenue,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: "PAID" },
    }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.order.findMany({
      where: { fraudScore: { gte: 0.5 }, isReviewed: false },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { fraudScore: "desc" },
      take: 10,
    }),
    prisma.order.groupBy({
      by: ["createdAt"],
      _sum: { total: true },
      where: {
        paymentStatus: "PAID",
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={`₹${(totalRevenue._sum.total ?? 0).toLocaleString()}`}
          subtitle="All time"
          trend="+12%"
        />
        <StatsCard
          title="Total Orders"
          value={totalOrders}
          subtitle="All time"
          trend="+8%"
        />
        <StatsCard
          title="Customers"
          value={totalUsers}
          subtitle="Registered"
          trend="+23%"
        />
        <StatsCard
          title="Pending Reviews"
          value={pendingReviews}
          subtitle="Needs moderation"
          alert={pendingReviews > 10}
        />
      </div>

      {highFraudOrders.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-red-800 dark:text-red-400 mb-4">
            🚨 High-Risk Orders ({highFraudOrders.length})
          </h2>
          <FraudOrdersTable orders={highFraudOrders} />
        </div>
      )}
    </div>
  );
}
