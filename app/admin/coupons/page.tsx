// import { prisma } from "@/lib/db/prisma";

// export default async function AdminCouponsPage() {
//   const coupons = await prisma.coupon.findMany({
//     orderBy: { createdAt: "desc" },
//   });

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold">Coupons</h1>
//       <div className="bg-card border rounded-2xl overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="border-b bg-muted/50">
//             <tr>
//               <th className="text-left p-4">Code</th>
//               <th className="text-left p-4">Type</th>
//               <th className="text-left p-4">Value</th>
//               <th className="text-left p-4">Used</th>
//               <th className="text-left p-4">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {coupons.length === 0 ? (
//               <tr>
//                 <td
//                   colSpan={5}
//                   className="text-center p-8 text-muted-foreground"
//                 >
//                   No coupons yet
//                 </td>
//               </tr>
//             ) : (
//               coupons.map((c) => (
//                 <tr
//                   key={c.id}
//                   className="border-b last:border-0 hover:bg-muted/30"
//                 >
//                   <td className="p-4 font-mono font-bold text-primary">
//                     {c.code}
//                   </td>
//                   <td className="p-4">{c.type}</td>
//                   <td className="p-4">
//                     {c.type === "PERCENTAGE" ? `${c.value}%` : `₹${c.value}`}
//                   </td>
//                   <td className="p-4">
//                     {c.usedCount}
//                     {c.usageLimit ? ` / ${c.usageLimit}` : ""}
//                   </td>
//                   <td className="p-4">
//                     <span
//                       className={`text-xs px-2 py-1 rounded-full ${c.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
//                     >
//                       {c.isActive ? "Active" : "Inactive"}
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
import { AddCouponForm } from "@/components/dashboard/add-coupon-form";

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Coupons ({coupons.length})</h1>
      </div>

      <AddCouponForm />

      <div className="bg-card border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="text-left p-4">Code</th>
              <th className="text-left p-4">Type</th>
              <th className="text-left p-4">Value</th>
              <th className="text-left p-4">Used</th>
              <th className="text-left p-4">Expires</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center p-8 text-muted-foreground"
                >
                  No coupons yet
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr
                  key={c.id}
                  className="border-b last:border-0 hover:bg-muted/30"
                >
                  <td className="p-4 font-mono font-bold text-primary">
                    {c.code}
                  </td>
                  <td className="p-4">{c.type}</td>
                  <td className="p-4 font-medium">
                    {c.type === "PERCENTAGE" ? `${c.value}%` : `₹${c.value}`}
                  </td>
                  <td className="p-4">
                    {c.usedCount}
                    {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {c.expiresAt
                      ? new Date(c.expiresAt).toLocaleDateString("en-IN")
                      : "Never"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        c.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4">
                    <CouponDeleteButton couponId={c.id} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CouponDeleteButton({ couponId }: { couponId: string }) {
  return (
    <form
      action={async () => {
        "use server";
        const { prisma } = await import("@/lib/db/prisma");
        const { revalidatePath } = await import("next/cache");
        await prisma.coupon.delete({ where: { id: couponId } });
        revalidatePath("/admin/coupons");
      }}
    >
      <button
        type="submit"
        className="text-xs text-red-500 hover:text-red-700 hover:underline"
      >
        Delete
      </button>
    </form>
  );
}
