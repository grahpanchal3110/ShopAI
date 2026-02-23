// // import { prisma } from "@/lib/db/prisma";

// // export default async function AdminProductsPage() {
// //   const products = await prisma.product.findMany({
// //     include: {
// //       category: { select: { name: true } },
// //       store: { select: { name: true } },
// //       images: { where: { isPrimary: true }, take: 1 },
// //       _count: { select: { orderItems: true } },
// //     },
// //     orderBy: { createdAt: "desc" },
// //     take: 50,
// //   });

// //   return (
// //     <div className="space-y-6">
// //       <h1 className="text-2xl font-bold">Products ({products.length})</h1>
// //       <div className="bg-card border rounded-2xl overflow-hidden">
// //         <table className="w-full text-sm">
// //           <thead className="border-b bg-muted/50">
// //             <tr>
// //               <th className="text-left p-4">Product</th>
// //               <th className="text-left p-4">Category</th>
// //               <th className="text-left p-4">Price</th>
// //               <th className="text-left p-4">Stock</th>
// //               <th className="text-left p-4">Status</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {products.map((p) => (
// //               <tr
// //                 key={p.id}
// //                 className="border-b last:border-0 hover:bg-muted/30"
// //               >
// //                 <td className="p-4">
// //                   <div className="flex items-center gap-3">
// //                     <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden shrink-0">
// //                       {p.images[0] ? (
// //                         <img
// //                           src={p.images[0].url}
// //                           alt={p.name}
// //                           className="w-full h-full object-cover"
// //                         />
// //                       ) : (
// //                         <div className="w-full h-full flex items-center justify-center">
// //                           🛍️
// //                         </div>
// //                       )}
// //                     </div>
// //                     <p className="font-medium line-clamp-1 max-w-[200px]">
// //                       {p.name}
// //                     </p>
// //                   </div>
// //                 </td>
// //                 <td className="p-4 text-muted-foreground">
// //                   {p.category?.name ?? "—"}
// //                 </td>
// //                 <td className="p-4 font-medium">
// //                   ₹{p.price.toLocaleString("en-IN")}
// //                 </td>
// //                 <td className="p-4">{p.stock}</td>
// //                 <td className="p-4">
// //                   <span
// //                     className={`text-xs px-2 py-1 rounded-full ${p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
// //                   >
// //                     {p.isActive ? "Active" : "Inactive"}
// //                   </span>
// //                 </td>
// //               </tr>
// //             ))}
// //           </tbody>
// //         </table>
// //       </div>
// //     </div>
// //   );
// // }

// import { prisma } from "@/lib/db/prisma";
// import Link from "next/link";
// import { Plus } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { ProductAdminActions } from "@/components/dashboard/product-admin-actions";

// export default async function AdminProductsPage() {
//   const products = await prisma.product.findMany({
//     include: {
//       category: { select: { name: true } },
//       store: { select: { name: true } },
//       images: { where: { isPrimary: true }, take: 1 },
//       _count: { select: { orderItems: true } },
//     },
//     orderBy: { createdAt: "desc" },
//     take: 100,
//   });

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-2xl font-bold">Products ({products.length})</h1>
//         <Button asChild className="rounded-xl gap-2">
//           <Link href="/admin/products/new">
//             <Plus className="h-4 w-4" /> Add Product
//           </Link>
//         </Button>
//       </div>

//       <div className="bg-card border rounded-2xl overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="border-b bg-muted/50">
//             <tr>
//               <th className="text-left p-4 font-medium">Product</th>
//               <th className="text-left p-4 font-medium">Category</th>
//               <th className="text-left p-4 font-medium">Price</th>
//               <th className="text-left p-4 font-medium">Stock</th>
//               <th className="text-left p-4 font-medium">Orders</th>
//               <th className="text-left p-4 font-medium">Status</th>
//               <th className="text-left p-4 font-medium">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {products.length === 0 ? (
//               <tr>
//                 <td
//                   colSpan={7}
//                   className="text-center p-8 text-muted-foreground"
//                 >
//                   No products yet —{" "}
//                   <Link
//                     href="/admin/products/new"
//                     className="text-primary underline"
//                   >
//                     Add one!
//                   </Link>
//                 </td>
//               </tr>
//             ) : (
//               products.map((product) => (
//                 <tr
//                   key={product.id}
//                   className="border-b last:border-0 hover:bg-muted/30 transition-colors"
//                 >
//                   <td className="p-4">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden shrink-0">
//                         {product.images[0] ? (
//                           <img
//                             src={product.images[0].url}
//                             alt={product.name}
//                             className="w-full h-full object-cover"
//                           />
//                         ) : (
//                           <div className="w-full h-full flex items-center justify-center">
//                             🛍️
//                           </div>
//                         )}
//                       </div>
//                       <p className="font-medium line-clamp-1 max-w-[180px]">
//                         {product.name}
//                       </p>
//                     </div>
//                   </td>
//                   <td className="p-4 text-muted-foreground">
//                     {product.category?.name ?? "—"}
//                   </td>
//                   <td className="p-4 font-medium">
//                     ₹{product.price.toLocaleString("en-IN")}
//                   </td>
//                   <td className="p-4">
//                     <span
//                       className={
//                         product.stock < 10 ? "text-red-500 font-medium" : ""
//                       }
//                     >
//                       {product.stock}
//                     </span>
//                   </td>
//                   <td className="p-4">{product._count.orderItems}</td>
//                   <td className="p-4">
//                     <span
//                       className={`text-xs px-2 py-1 rounded-full ${
//                         product.isActive
//                           ? "bg-green-100 text-green-700"
//                           : "bg-red-100 text-red-700"
//                       }`}
//                     >
//                       {product.isActive ? "Active" : "Inactive"}
//                     </span>
//                   </td>
//                   <td className="p-4">
//                     <ProductAdminActions
//                       productId={product.id}
//                       isActive={product.isActive}
//                     />
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
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductAdminActions } from "@/components/dashboard/product-admin-actions";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      category: { select: { name: true } },
      store: { select: { name: true } },
      images: { where: { isPrimary: true }, take: 1 },
      _count: { select: { orderItems: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products ({products.length})</h1>
        <Button asChild className="rounded-xl gap-2">
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        </Button>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium">Product</th>
              <th className="text-left p-4 font-medium">Category</th>
              <th className="text-left p-4 font-medium">Price</th>
              <th className="text-left p-4 font-medium">Stock</th>
              <th className="text-left p-4 font-medium">Orders</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center p-8 text-muted-foreground"
                >
                  No products yet —{" "}
                  <Link
                    href="/admin/products/new"
                    className="text-primary underline"
                  >
                    Add one!
                  </Link>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const editHref = `/admin/products/${product.id}/edit`;

                return (
                  <tr
                    key={product.id}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    {/* Make product cell clickable */}
                    <td className="p-4">
                      <Link
                        href={editHref}
                        className="flex items-center gap-3 group"
                      >
                        <div className="w-10 h-10 bg-muted rounded-lg overflow-hidden shrink-0">
                          {product.images[0] ? (
                            <img
                              src={product.images[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              🛍️
                            </div>
                          )}
                        </div>
                        <p className="font-medium line-clamp-1 max-w-[180px] group-hover:underline">
                          {product.name}
                        </p>
                      </Link>
                    </td>

                    {/* Make other cells clickable too (optional but nice) */}
                    <td className="p-4 text-muted-foreground">
                      <Link href={editHref} className="hover:underline">
                        {product.category?.name ?? "—"}
                      </Link>
                    </td>

                    <td className="p-4 font-medium">
                      <Link href={editHref} className="hover:underline">
                        ₹{product.price.toLocaleString("en-IN")}
                      </Link>
                    </td>

                    <td className="p-4">
                      <Link href={editHref} className="hover:underline">
                        <span
                          className={
                            product.stock < 10 ? "text-red-500 font-medium" : ""
                          }
                        >
                          {product.stock}
                        </span>
                      </Link>
                    </td>

                    <td className="p-4">
                      <Link href={editHref} className="hover:underline">
                        {product._count.orderItems}
                      </Link>
                    </td>

                    <td className="p-4">
                      <Link href={editHref}>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            product.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </Link>
                    </td>

                    {/* Actions should NOT trigger link; they remain buttons */}
                    <td className="p-4">
                      <ProductAdminActions
                        productId={product.id}
                        isActive={product.isActive}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}