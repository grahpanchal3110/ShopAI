// import { prisma } from "@/lib/db/prisma";

// export default async function AdminUsersPage() {
//   const users = await prisma.user.findMany({
//     include: { _count: { select: { orders: true } } },
//     orderBy: { createdAt: "desc" },
//   });

//   return (
//     <div className="space-y-6">
//       <h1 className="text-2xl font-bold">Users ({users.length})</h1>
//       <div className="bg-card border rounded-2xl overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="border-b bg-muted/50">
//             <tr>
//               <th className="text-left p-4">User</th>
//               <th className="text-left p-4">Role</th>
//               <th className="text-left p-4">Orders</th>
//               <th className="text-left p-4">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {users.map((u) => (
//               <tr
//                 key={u.id}
//                 className="border-b last:border-0 hover:bg-muted/30"
//               >
//                 <td className="p-4">
//                   <p className="font-medium">{u.name ?? "—"}</p>
//                   <p className="text-xs text-muted-foreground">{u.email}</p>
//                 </td>
//                 <td className="p-4">
//                   <span
//                     className={`text-xs px-2 py-1 rounded-full ${u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : u.role === "SELLER" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}
//                   >
//                     {u.role}
//                   </span>
//                 </td>
//                 <td className="p-4">{u._count.orders}</td>
//                 <td className="p-4">
//                   <span
//                     className={`text-xs px-2 py-1 rounded-full ${u.isBanned ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
//                   >
//                     {u.isBanned ? "Banned" : "Active"}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

import { prisma } from "@/lib/db/prisma";
import { UserAdminActions } from "@/components/dashboard/user-admin-actions";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    include: { _count: { select: { orders: true, reviews: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users ({users.length})</h1>

      <div className="bg-card border rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="text-left p-4">User</th>
              <th className="text-left p-4">Role</th>
              <th className="text-left p-4">Orders</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b last:border-0 hover:bg-muted/30"
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                        {(user.name ?? user.email)[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{user.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      user.role === "ADMIN"
                        ? "bg-purple-100 text-purple-700"
                        : user.role === "SELLER"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-4">{user._count.orders}</td>
                <td className="p-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      user.isBanned
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {user.isBanned ? "Banned" : "Active"}
                  </span>
                </td>
                <td className="p-4">
                  <UserAdminActions
                    userId={user.id}
                    currentRole={user.role}
                    isBanned={user.isBanned}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
