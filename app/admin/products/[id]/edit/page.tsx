// import { prisma } from "@/lib/db/prisma";
// import { notFound } from "next/navigation";
// import EditProductForm from "./EditProductForm";

// export default async function EditProductPage({
//   params,
// }: {
//   params: { id?: string };
// }) {
//   const product = await prisma.product.findUnique({
//     where: { id: params.id },
//     include: {
//       category: { select: { slug: true, name: true } },
//       images: { orderBy: { order: "asc" } },
//     },
//   });

//   if (!product) notFound();

//   return (
//     <EditProductForm
//       product={{
//         id: product.id,
//         name: product.name,
//         description: product.description ?? "",
//         price: product.price,
//         comparePrice: product.comparePrice ?? null,
//         stock: product.stock,
//         categorySlug: product.category?.slug ?? "",
//         imageUrl: product.images?.[0]?.url ?? "",
//         isFeatured: Boolean(product.isFeatured),
//       }}
//     />
//   );
// }

import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import EditProductForm from "./EditProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Debug (server terminal me dikhega)
  console.log("[EDIT PRODUCT] params:", params);

  if (!id || typeof id !== "string") notFound();

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: { select: { slug: true, name: true } },
      images: { orderBy: { order: "asc" } },
    },
  });

  if (!product) notFound();

  return (
    <EditProductForm
      product={{
        id: product.id,
        name: product.name,
        description: product.description ?? "",
        price: product.price,
        comparePrice: product.comparePrice ?? null,
        stock: product.stock,
        categorySlug: product.category?.slug ?? "",
        imageUrl: product.images?.[0]?.url ?? "",
        isFeatured: Boolean(product.isFeatured),
      }}
    />
  );
}
