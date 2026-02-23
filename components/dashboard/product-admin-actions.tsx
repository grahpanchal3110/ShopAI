// // "use client";

// // import { useTransition } from "react";
// // import { Button } from "@/components/ui/button";
// // import { Trash2, Eye, EyeOff } from "lucide-react";
// // import { toast } from "sonner";
// // import {
// //   deleteProduct,
// //   toggleProductStatus,
// // } from "@/actions/product.admin.actions";

// // export function ProductAdminActions({
// //   productId,
// //   isActive,
// // }: {
// //   productId: string;
// //   isActive: boolean;
// // }) {
// //   const [isPending, startTransition] = useTransition();

// //   const handleDelete = () => {
// //     if (!confirm("Are you sure you want to delete this product?")) return;
// //     startTransition(async () => {
// //       const res = await deleteProduct(productId);
// //       if (res.success) toast.success("Product deleted!");
// //       else toast.error(res.error ?? "Failed");
// //     });
// //   };

// //   const handleToggle = () => {
// //     startTransition(async () => {
// //       const res = await toggleProductStatus(productId, isActive);
// //       if (res.success)
// //         toast.success(isActive ? "Product hidden!" : "Product active!");
// //       else toast.error(res.error ?? "Failed");
// //     });
// //   };

// //   return (
// //     <div className="flex items-center gap-1">
// //       <Button
// //         size="sm"
// //         variant="ghost"
// //         onClick={handleToggle}
// //         disabled={isPending}
// //         title={isActive ? "Hide product" : "Show product"}
// //         className="text-muted-foreground hover:text-foreground"
// //       >
// //         {isActive ? (
// //           <EyeOff className="h-4 w-4" />
// //         ) : (
// //           <Eye className="h-4 w-4" />
// //         )}
// //       </Button>
// //       <Button
// //         size="sm"
// //         variant="ghost"
// //         onClick={handleDelete}
// //         disabled={isPending}
// //         className="text-muted-foreground hover:text-destructive"
// //       >
// //         <Trash2 className="h-4 w-4" />
// //       </Button>
// //     </div>
// //   );
// // }

// "use client";

// import { useTransition } from "react";
// import { Button } from "@/components/ui/button";
// import { Trash2, EyeOff } from "lucide-react";
// import { toast } from "sonner";
// import {
//   deleteProduct,
//   toggleProductStatus,
// } from "@/actions/product.admin.actions";

// export function ProductAdminActions({
//   productId,
//   isActive,
// }: {
//   productId: string;
//   isActive: boolean;
// }) {
//   const [isPending, startTransition] = useTransition();

//   const handleDelete = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (!confirm("Are you sure you want to delete this product?")) return;
//     startTransition(async () => {
//       const res = await deleteProduct(productId);
//       if (res.success) toast.success("Product deleted!");
//       else toast.error(res.error ?? "Failed");
//     });
//   };

//   const handleToggle = (e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();

//     startTransition(async () => {
//       const res = await toggleProductStatus(productId, isActive);
//       if (res.success)
//         toast.success(isActive ? "Product hidden!" : "Product active!");
//       else toast.error(res.error ?? "Failed");
//     });
//   };

//   return (
//     <div className="flex items-center gap-1">
//       <Button
//         size="sm"
//         variant="ghost"
//         onClick={handleToggle}
//         disabled={isPending}
//         title={isActive ? "Hide product" : "Show product"}
//         className="text-muted-foreground hover:text-foreground"
//       >
//         <EyeOff className="h-4 w-4" />
//       </Button>

//       <Button
//         size="sm"
//         variant="ghost"
//         onClick={handleDelete}
//         disabled={isPending}
//         className="text-muted-foreground hover:text-destructive"
//       >
//         <Trash2 className="h-4 w-4" />
//       </Button>
//     </div>
//   );
// }

"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, EyeOff, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  deleteProduct,
  toggleProductStatus,
} from "@/actions/product.admin.actions";

export function ProductAdminActions({
  productId,
  isActive,
}: {
  productId: string;
  isActive: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this product?")) return;

    startTransition(async () => {
      const res = await deleteProduct(productId);
      if (res.success) toast.success("Product deleted!");
      else toast.error(res.error ?? "Failed");
    });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const res = await toggleProductStatus(productId, isActive);
      if (res.success)
        toast.success(isActive ? "Product hidden!" : "Product active!");
      else toast.error(res.error ?? "Failed");
    });
  };

  return (
    <div className="flex items-center gap-1">
      {/* Edit */}
      <Button
        size="sm"
        variant="ghost"
        asChild
        className="text-muted-foreground hover:text-foreground"
        title="Edit product"
        onClick={(e) => {
          // important: prevent row click (if any)
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Link href={`/admin/products/${productId}/edit`}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>

      {/* Toggle Active/Inactive */}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleToggle}
        disabled={isPending}
        title={isActive ? "Hide product" : "Show product"}
        className="text-muted-foreground hover:text-foreground"
      >
        {isActive ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>

      {/* Delete */}
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDelete}
        disabled={isPending}
        className="text-muted-foreground hover:text-destructive"
        title="Delete product"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
