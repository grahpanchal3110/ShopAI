"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toggleWishlist } from "@/actions/wishlist.actions";
import { toast } from "sonner";

export function WishlistRemoveButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      await toggleWishlist(productId);
      toast.success("Removed from wishlist");
    });
  };

  return (
    <button
      onClick={handleRemove}
      disabled={isPending}
      className="w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
      title="Remove from wishlist"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  );
}
