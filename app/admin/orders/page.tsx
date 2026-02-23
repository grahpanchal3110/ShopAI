// import { prisma } from "@/lib/db/prisma";

// export default async function AdminOrdersPage() {
//   const orders = await prisma.order.findMany({
//     include: { user: { select: { name: true, email: true } } },
//     orderBy: { createdAt: "desc" },
//     take: 50,
//   });

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold">Orders ({orders.length})</h1>
//       <div className="bg-card border rounded-2xl overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="border-b bg-muted/50">
//             <tr>
//               <th className="text-left p-4">Order #</th>
//               <th className="text-left p-4">Customer</th>
//               <th className="text-left p-4">Total</th>
//               <th className="text-left p-4">Payment</th>
//               <th className="text-left p-4">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {orders.length === 0 ? (
//               <tr>
//                 <td
//                   colSpan={5}
//                   className="text-center p-8 text-muted-foreground"
//                 >
//                   No orders yet
//                 </td>
//               </tr>
//             ) : (
//               orders.map((o) => (
//                 <tr
//                   key={o.id}
//                   className="border-b last:border-0 hover:bg-muted/30"
//                 >
//                   <td className="p-4 font-mono font-medium">
//                     #{o.orderNumber.slice(-8).toUpperCase()}
//                   </td>
//                   <td className="p-4">
//                     <p className="font-medium">{o.user.name ?? "—"}</p>
//                     <p className="text-xs text-muted-foreground">
//                       {o.user.email}
//                     </p>
//                   </td>
//                   <td className="p-4 font-bold">
//                     ₹{o.total.toLocaleString("en-IN")}
//                   </td>
//                   <td className="p-4">
//                     <span
//                       className={`text-xs px-2 py-1 rounded-full ${o.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
//                     >
//                       {o.paymentStatus}
//                     </span>
//                   </td>
//                   <td className="p-4">
//                     <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
//                       {o.status}
//                     </span>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

import { prisma } from "@/lib/db/prisma";
import { OrderStatusUpdater } from "@/components/dashboard/order-status-updater";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          product: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders ({orders.length})</h1>

      {orders.length === 0 ? (
        <div className="bg-card border rounded-2xl p-8 text-center text-muted-foreground">
          No orders yet
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-card border rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-mono font-bold text-lg">
                    #{order.orderNumber.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.user.name ?? order.user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">
                    ₹{order.total.toLocaleString("en-IN")}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      order.paymentStatus === "PAID"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="text-sm text-muted-foreground">
                {order.items.map((item) => (
                  <span key={item.id} className="mr-2">
                    {item.product.name} ×{item.quantity}
                  </span>
                ))}
              </div>

              {/* Status Updater */}
              <OrderStatusUpdater
                orderId={order.id}
                currentStatus={order.status}
                trackingNumber={order.trackingNumber ?? ""}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
