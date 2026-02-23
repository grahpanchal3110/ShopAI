// // // // import { requireAdmin } from "@/lib/auth/get-user";
// // // // import Link from "next/link";
// // // // import {
// // // //   LayoutDashboard,
// // // //   Package,
// // // //   ShoppingCart,
// // // //   Users,
// // // //   Star,
// // // //   Mail,
// // // //   Tag,
// // // // } from "lucide-react";

// // // // const NAV = [
// // // //   { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
// // // //   { href: "/admin/products", label: "Products", icon: Package },
// // // //   { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
// // // //   { href: "/admin/users", label: "Users", icon: Users },
// // // //   { href: "/admin/reviews", label: "Reviews", icon: Star },
// // // //   { href: "/admin/coupons", label: "Coupons", icon: Tag },
// // // //   { href: "/admin/campaigns", label: "Campaigns", icon: Mail },
// // // // ];

// // // // export default async function AdminLayout({
// // // //   children,
// // // // }: {
// // // //   children: React.ReactNode;
// // // // }) {
// // // //   await requireAdmin();

// // // //   return (
// // // //     <div className="flex min-h-screen">
// // // //       {/* Sidebar */}
// // // //       <aside className="w-64 bg-card border-r shrink-0 p-4 space-y-1">
// // // //         <div className="px-3 py-4 mb-4">
// // // //           <h1 className="font-bold text-xl">
// // // //             <span className="text-primary">Shop</span>AI Admin
// // // //           </h1>
// // // //         </div>

// // // //         {NAV.map(({ href, label, icon: Icon }) => (
// // // //           <Link
// // // //             key={href}
// // // //             href={href}
// // // //             className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
// // // //           >
// // // //             <Icon className="h-4 w-4" />
// // // //             {label}
// // // //           </Link>
// // // //         ))}

// // // //         <div className="pt-4 border-t mt-4">
// // // //           <Link
// // // //             href="/"
// // // //             className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors"
// // // //           >
// // // //             ← Back to Store
// // // //           </Link>
// // // //         </div>
// // // //       </aside>

// // // //       {/* Main */}
// // // //       <main className="flex-1 p-8 bg-muted/20 overflow-auto">{children}</main>
// // // //     </div>
// // // //   );
// // // // }

// // // import { redirect } from "next/navigation";
// // // import { getCurrentUser } from "@/lib/auth/get-user";
// // // import Link from "next/link";
// // // import {
// // //   LayoutDashboard,
// // //   Package,
// // //   ShoppingCart,
// // //   Users,
// // //   Star,
// // //   Mail,
// // //   Tag,
// // // } from "lucide-react";

// // // const NAV = [
// // //   { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
// // //   { href: "/admin/products", label: "Products", icon: Package },
// // //   { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
// // //   { href: "/admin/users", label: "Users", icon: Users },
// // //   { href: "/admin/reviews", label: "Reviews", icon: Star },
// // //   { href: "/admin/coupons", label: "Coupons", icon: Tag },
// // //   { href: "/admin/campaigns", label: "Campaigns", icon: Mail },
// // // ];

// // // export default async function AdminLayout({
// // //   children,
// // // }: {
// // //   children: React.ReactNode;
// // // }) {
// // //   // Middleware ke bajaye yahan check karo
// // //   const user = await getCurrentUser();

// // //   if (!user) redirect("/sign-in");
// // //   if (user.role !== "ADMIN") redirect("/");

// // //   return (
// // //     <div className="flex min-h-screen">
// // //       {/* Sidebar */}
// // //       <aside className="w-64 bg-card border-r shrink-0 p-4 space-y-1">
// // //         <div className="px-3 py-4 mb-4">
// // //           <h1 className="font-bold text-xl">
// // //             <span className="text-primary">Shop</span>AI Admin
// // //           </h1>
// // //           <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
// // //         </div>

// // //         {NAV.map(({ href, label, icon: Icon }) => (
// // //           <Link
// // //             key={href}
// // //             href={href}
// // //             className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
// // //           >
// // //             <Icon className="h-4 w-4" />
// // //             {label}
// // //           </Link>
// // //         ))}

// // //         <div className="pt-4 border-t mt-4">
// // //           <Link
// // //             href="/"
// // //             className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors"
// // //           >
// // //             ← Back to Store
// // //           </Link>
// // //         </div>
// // //       </aside>

// // //       {/* Main Content */}
// // //       <main className="flex-1 p-8 bg-muted/20 overflow-auto">{children}</main>
// // //     </div>
// // //   );
// // // }

// // import { redirect } from "next/navigation";
// // import { getCurrentUser } from "@/lib/auth/get-user";
// // import Link from "next/link";
// // import {
// //   LayoutDashboard,
// //   Package,
// //   ShoppingCart,
// //   Users,
// //   Star,
// //   Mail,
// //   Tag,
// // } from "lucide-react";

// // const NAV = [
// //   { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
// //   { href: "/admin/products", label: "Products", icon: Package },
// //   { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
// //   { href: "/admin/users", label: "Users", icon: Users },
// //   { href: "/admin/reviews", label: "Reviews", icon: Star },
// //   { href: "/admin/coupons", label: "Coupons", icon: Tag },
// //   { href: "/admin/campaigns", label: "Campaigns", icon: Mail },
// // ];

// // export default async function AdminLayout({
// //   children,
// // }: {
// //   children: React.ReactNode;
// // }) {
// //   // Middleware ke bajaye yahan check karo
// //   const user = await getCurrentUser();

// //   if (!user) redirect("/sign-in");
// //   if (user.role !== "ADMIN") redirect("/");

// //   return (
// //     <div className="flex min-h-screen">
// //       {/* Sidebar */}
// //       <aside className="w-64 bg-card border-r shrink-0 p-4 space-y-1">
// //         <div className="px-3 py-4 mb-4">
// //           <h1 className="font-bold text-xl">
// //             <span className="text-primary">Shop</span>AI Admin
// //           </h1>
// //           <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
// //         </div>

// //         {NAV.map(({ href, label, icon: Icon }) => (
// //           <Link
// //             key={href}
// //             href={href}
// //             className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
// //           >
// //             <Icon className="h-4 w-4" />
// //             {label}
// //           </Link>
// //         ))}

// //         <div className="pt-4 border-t mt-4">
// //           <Link
// //             href="/"
// //             className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors"
// //           >
// //             ← Back to Store
// //           </Link>
// //         </div>
// //       </aside>

// //       {/* Main Content */}
// //       <main className="flex-1 p-8 bg-muted/20 overflow-auto">{children}</main>
// //     </div>
// //   );
// // }

// import { redirect } from "next/navigation";
// import { auth } from "@clerk/nextjs/server";
// import { prisma } from "@/lib/db/prisma";
// import Link from "next/link";
// import {
//   LayoutDashboard,
//   Package,
//   ShoppingCart,
//   Users,
//   Star,
//   Mail,
//   Tag,
// } from "lucide-react";

// const NAV = [
//   { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
//   { href: "/admin/products", label: "Products", icon: Package },
//   { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
//   { href: "/admin/users", label: "Users", icon: Users },
//   { href: "/admin/reviews", label: "Reviews", icon: Star },
//   { href: "/admin/coupons", label: "Coupons", icon: Tag },
//   { href: "/admin/campaigns", label: "Campaigns", icon: Mail },
// ];

// export default async function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   // Direct auth check
//   const { userId } = await auth();
//   if (!userId) redirect("/sign-in");

//   // DB se role check
//   const user = await prisma.user.findUnique({
//     where: { clerkId: userId },
//     select: { role: true, email: true, name: true },
//   });

//   if (!user || user.role !== "ADMIN") redirect("/");

//   return (
//     <div className="flex min-h-screen">
//       <aside className="w-64 bg-card border-r shrink-0 p-4 space-y-1">
//         <div className="px-3 py-4 mb-4">
//           <h1 className="font-bold text-xl">
//             <span className="text-primary">Shop</span>
//             <span>AI Admin</span>
//           </h1>
//           <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
//         </div>

//         {NAV.map(({ href, label, icon: Icon }) => (
//           <Link
//             key={href}
//             href={href}
//             className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
//           >
//             <Icon className="h-4 w-4" />
//             {label}
//           </Link>
//         ))}

//         <div className="pt-4 border-t mt-4">
//           <Link
//             href="/"
//             className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors"
//           >
//             ← Back to Store
//           </Link>
//         </div>
//       </aside>

//       <main className="flex-1 p-8 bg-muted/20 overflow-auto">{children}</main>
//     </div>
//   );
// }

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Star,
  Mail,
  Tag,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/campaigns", label: "Campaigns", icon: Mail },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true, email: true, name: true },
  });

  // ✅ make role check case-insensitive + null-safe
  // const role = (user?.role ?? "").toString().toUpperCase();
  // const isAdmin = role === "ADMIN";

  // if (!user || !isAdmin) redirect("/");
  const role = (user?.role ?? "").toString().toUpperCase();
  if (!user || role !== "ADMIN") redirect("/");
  console.log("[ADMIN] clerk userId:", userId);
  console.log("[ADMIN] db user:", user);
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-card border-r shrink-0 p-4 space-y-1">
        <div className="px-3 py-4 mb-4">
          <h1 className="font-bold text-xl">
            <span className="text-primary">Shop</span>
            <span>AI Admin</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
        </div>

        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}

        <div className="pt-4 border-t mt-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            ← Back to Store
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-8 bg-muted/20 overflow-auto">{children}</main>
    </div>
  );
}
