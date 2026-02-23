// import { auth, currentUser } from "@clerk/nextjs/server";
// import { redirect } from "next/navigation";
// import { prisma } from "@/lib/db/prisma";
// import { User, ShoppingBag, Heart, MapPin, Mail, Phone } from "lucide-react";
// import Link from "next/link";

// export default async function ProfilePage() {
//   const { userId } = await auth();
//   if (!userId) redirect("/sign-in");

//   const clerkUser = await currentUser();

//   // Fetch orders count and wishlist count from DB
//   const [ordersCount, wishlistCount] = await Promise.all([
//     prisma.order.count({ where: { userId } }),
//     prisma.wishlistItem.count({ where: { userId } }),
//   ]);

//   // Recent orders
//   const recentOrders = await prisma.order.findMany({
//     where: { userId },
//     orderBy: { createdAt: "desc" },
//     take: 5,
//     include: {
//       items: {
//         take: 1,
//         include: {
//           product: {
//             include: { images: { where: { isPrimary: true }, take: 1 } },
//           },
//         },
//       },
//     },
//   });

//   const fullName =
//     [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
//     "User";
//   const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? "";
//   const avatar = clerkUser?.imageUrl ?? "";

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
//         {/* Profile Header */}
//         <div className="bg-card border rounded-2xl p-6 flex items-center gap-5">
//           {avatar ? (
//             <img
//               src={avatar}
//               alt={fullName}
//               className="w-20 h-20 rounded-full object-cover border"
//             />
//           ) : (
//             <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
//               <User className="h-10 w-10 text-muted-foreground" />
//             </div>
//           )}
//           <div className="flex-1 min-w-0">
//             <h1 className="text-2xl font-bold truncate">{fullName}</h1>
//             {email && (
//               <p className="text-muted-foreground flex items-center gap-1.5 mt-1 text-sm">
//                 <Mail className="h-3.5 w-3.5" />
//                 {email}
//               </p>
//             )}
//           </div>
//         </div>

//         {/* Stats */}
//         <div className="grid grid-cols-2 gap-4">
//           <div className="bg-card border rounded-2xl p-5 flex items-center gap-4">
//             <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
//               <ShoppingBag className="h-6 w-6 text-blue-500" />
//             </div>
//             <div>
//               <p className="text-2xl font-bold">{ordersCount}</p>
//               <p className="text-sm text-muted-foreground">Total Orders</p>
//             </div>
//           </div>

//           <Link href="/wishlist">
//             <div className="bg-card border rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
//               <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
//                 <Heart className="h-6 w-6 text-rose-500" />
//               </div>
//               <div>
//                 <p className="text-2xl font-bold">{wishlistCount}</p>
//                 <p className="text-sm text-muted-foreground">Wishlist Items</p>
//               </div>
//             </div>
//           </Link>
//         </div>

//         {/* Recent Orders */}
//         <div className="bg-card border rounded-2xl overflow-hidden">
//           <div className="p-5 border-b flex items-center justify-between">
//             <h2 className="font-semibold text-lg">Recent Orders</h2>
//             {ordersCount > 5 && (
//               <Link
//                 href="/orders"
//                 className="text-sm text-primary hover:underline"
//               >
//                 View all
//               </Link>
//             )}
//           </div>

//           {recentOrders.length === 0 ? (
//             <div className="py-16 text-center text-muted-foreground">
//               <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-40" />
//               <p>No orders yet</p>
//               <Link
//                 href="/products"
//                 className="text-primary hover:underline text-sm mt-1 inline-block"
//               >
//                 Start shopping
//               </Link>
//             </div>
//           ) : (
//             <div className="divide-y">
//               {recentOrders.map((order) => {
//                 const firstItem = order.items[0];
//                 const image = firstItem?.product?.images?.[0]?.url;
//                 const statusColors: Record<string, string> = {
//                   PENDING: "bg-yellow-100 text-yellow-700",
//                   CONFIRMED: "bg-blue-100 text-blue-700",
//                   PROCESSING: "bg-purple-100 text-purple-700",
//                   SHIPPED: "bg-indigo-100 text-indigo-700",
//                   DELIVERED: "bg-green-100 text-green-700",
//                   CANCELLED: "bg-red-100 text-red-700",
//                 };

//                 return (
//                   <div
//                     key={order.id}
//                     className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
//                   >
//                     <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
//                       {image ? (
//                         <img
//                           src={image}
//                           alt=""
//                           className="w-full h-full object-cover"
//                         />
//                       ) : (
//                         <div className="w-full h-full flex items-center justify-center text-xl">
//                           🛍️
//                         </div>
//                       )}
//                     </div>

//                     <div className="flex-1 min-w-0">
//                       <p className="text-sm font-medium truncate">
//                         Order #{order.id.slice(-8).toUpperCase()}
//                       </p>
//                       <p className="text-xs text-muted-foreground">
//                         {new Date(order.createdAt).toLocaleDateString("en-IN", {
//                           day: "numeric",
//                           month: "short",
//                           year: "numeric",
//                         })}
//                       </p>
//                     </div>

//                     <div className="flex items-center gap-3 shrink-0">
//                       <span
//                         className={`text-xs px-2 py-1 rounded-full font-medium ${
//                           statusColors[order.status] ??
//                           "bg-muted text-muted-foreground"
//                         }`}
//                       >
//                         {order.status}
//                       </span>
//                       <p className="text-sm font-bold">
//                         ₹{Number(order.total).toLocaleString("en-IN")}
//                       </p>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/get-user";
import { prisma } from "@/lib/db/prisma";
import { User, ShoppingBag, Heart, Mail } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  let dbUser;
  try {
    dbUser = await requireAuth();
  } catch {
    redirect("/sign-in");
  }

  const clerkUser = await currentUser();

  // dbUser.id is what WishlistItem.userId and Order.userId store
  const [ordersCount, wishlistCount] = await Promise.all([
    prisma.order.count({ where: { userId: dbUser.id } }),
    prisma.wishlistItem.count({ where: { userId: dbUser.id } }),
  ]);

  const recentOrders = await prisma.order.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      items: {
        take: 1,
        include: {
          product: {
            include: { images: { where: { isPrimary: true }, take: 1 } },
          },
        },
      },
    },
  });

  const fullName = dbUser.name || clerkUser?.firstName || "User";
  const email = dbUser.email || "";
  const avatar = dbUser.avatar || clerkUser?.imageUrl || "";

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    PROCESSING: "bg-purple-100 text-purple-700",
    SHIPPED: "bg-indigo-100 text-indigo-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* Profile Header */}
        <div className="bg-card border rounded-2xl p-6 flex items-center gap-5">
          {avatar ? (
            <img
              src={avatar}
              alt={fullName}
              className="w-20 h-20 rounded-full object-cover border"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold truncate">{fullName}</h1>
            {email && (
              <p className="text-muted-foreground flex items-center gap-1.5 mt-1 text-sm">
                <Mail className="h-3.5 w-3.5" /> {email}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/orders">
            <div className="bg-card border rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ordersCount}</p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </div>
            </div>{" "}
          </Link>

          <Link href="/wishlist">
            <div className="bg-card border rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <Heart className="h-6 w-6 text-rose-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{wishlistCount}</p>
                <p className="text-sm text-muted-foreground">Wishlist Items</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-card border rounded-2xl overflow-hidden">
          <div className="p-5 border-b flex items-center justify-between">
            <h2 className="font-semibold text-lg">Recent Orders</h2>
            {ordersCount > 5 && (
              <Link
                href="/orders"
                className="text-sm text-primary hover:underline"
              >
                View all
              </Link>
            )}
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <ShoppingBag className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>No orders yet</p>
              <Link
                href="/products"
                className="text-primary hover:underline text-sm mt-1 inline-block"
              >
                Start shopping
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {recentOrders.map((order) => {
                const image = order.items[0]?.product?.images?.[0]?.url;
                return (
                  <Link
                    key={order.id}
                    href={`/orders/${order.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                      {image ? (
                        <img
                          src={image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">
                          🛍️
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[order.status] ?? "bg-muted text-muted-foreground"}`}
                      >
                        {order.status}
                      </span>
                      <p className="text-sm font-bold">
                        ₹{Number(order.total).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
