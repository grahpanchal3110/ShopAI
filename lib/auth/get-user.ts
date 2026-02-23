// // lib/auth/get-user.ts
// import { auth, currentUser } from "@clerk/nextjs/server";
// import { prisma } from "@/lib/db/prisma";
// import { cache } from "react";

// export const getCurrentUser = cache(async () => {
//   const { userId } = await auth();
//   if (!userId) return null;

//   const user = await prisma.user.findUnique({
//     where: { clerkId: userId },
//     include: { store: true },
//   });

//   return user;
// });

// export const requireAuth = async () => {
//   const user = await getCurrentUser();
//   if (!user) throw new Error("Unauthorized");
//   return user;
// };

// export const requireSeller = async () => {
//   const user = await requireAuth();
//   if (user.role !== "SELLER" && user.role !== "ADMIN") {
//     throw new Error("Seller access required");
//   }
//   return user;
// };

// export const requireAdmin = async () => {
//   const user = await requireAuth();
//   if (user.role !== "ADMIN") throw new Error("Admin access required");
//   return user;
// };

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import { cache } from "react";

export const getCurrentUser = cache(async () => {
  const { userId } = await auth();
  if (!userId) return null;

  // DB mein dhundo
  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { store: true },
  });

  // Nahi mila toh auto-create karo
  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
        avatar: clerkUser.imageUrl,
        role: "CUSTOMER",
      },
      include: { store: true },
    });

    console.log("✅ New user created in DB:", user.email);
  }

  return user;
});

export const requireAuth = async () => {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
};

export const requireSeller = async () => {
  const user = await requireAuth();
  if (user.role !== "SELLER" && user.role !== "ADMIN") {
    throw new Error("Seller access required");
  }
  return user;
};

export const requireAdmin = async () => {
  const user = await requireAuth();
  if (user.role !== "ADMIN") throw new Error("Admin access required");
  return user;
};
