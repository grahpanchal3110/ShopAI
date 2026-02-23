// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import {
//   Heart,
//   ShoppingCart,
//   Trash2,
//   ArrowLeft,
//   PackageSearch,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";

// // -------------------------------------------------------------------
// // Type
// // -------------------------------------------------------------------
// type WishlistItem = {
//   id: string;
//   name: string;
//   price: number;
//   comparePrice?: number | null;
//   imageUrl?: string;
//   categoryName?: string;
//   slug: string;
//   isInStock: boolean;
// };

// // -------------------------------------------------------------------
// // Helpers
// // -------------------------------------------------------------------
// function getWishlist(): WishlistItem[] {
//   try {
//     return JSON.parse(localStorage.getItem("wishlist") ?? "[]");
//   } catch {
//     return [];
//   }
// }

// function saveWishlist(items: WishlistItem[]) {
//   localStorage.setItem("wishlist", JSON.stringify(items));
// }

// function discount(price: number, comparePrice?: number | null) {
//   if (!comparePrice || comparePrice <= price) return null;
//   return Math.round(((comparePrice - price) / comparePrice) * 100);
// }

// // -------------------------------------------------------------------
// // Page Component — THIS is the required default export
// // -------------------------------------------------------------------
// export default function WishlistPage() {
//   const [items, setItems] = useState<WishlistItem[]>([]);
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setItems(getWishlist());
//     setMounted(true);
//   }, []);

//   const remove = (id: string) => {
//     const updated = items.filter((i) => i.id !== id);
//     setItems(updated);
//     saveWishlist(updated);
//     toast.success("Removed from wishlist");
//   };

//   const clearAll = () => {
//     setItems([]);
//     saveWishlist([]);
//     toast.success("Wishlist cleared");
//   };

//   const addToCart = (item: WishlistItem) => {
//     if (!item.isInStock) {
//       toast.error("This product is out of stock");
//       return;
//     }
//     // TODO: wire up your cart logic here
//     toast.success(`${item.name} added to cart!`);
//   };

//   // Avoid hydration mismatch
//   if (!mounted) return null;

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
//         {/* Header */}
//         <div className="flex items-center justify-between flex-wrap gap-4">
//           <div className="flex items-center gap-3">
//             <Button variant="ghost" size="sm" asChild>
//               <Link href="/">
//                 <ArrowLeft className="h-4 w-4 mr-1" /> Back
//               </Link>
//             </Button>
//             <h1 className="text-2xl font-bold flex items-center gap-2">
//               <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
//               My Wishlist
//               {items.length > 0 && (
//                 <span className="text-sm font-normal text-muted-foreground">
//                   ({items.length} {items.length === 1 ? "item" : "items"})
//                 </span>
//               )}
//             </h1>
//           </div>

//           {items.length > 0 && (
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={clearAll}
//               className="text-muted-foreground hover:text-destructive"
//             >
//               <Trash2 className="h-4 w-4 mr-1" />
//               Clear all
//             </Button>
//           )}
//         </div>

//         {/* Empty State */}
//         {items.length === 0 && (
//           <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
//             <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
//               <PackageSearch className="h-10 w-10 text-muted-foreground" />
//             </div>
//             <h2 className="text-xl font-semibold">Your wishlist is empty</h2>
//             <p className="text-muted-foreground max-w-sm">
//               Save products you love by clicking the heart icon on any product
//               page.
//             </p>
//             <Button asChild className="rounded-xl mt-2">
//               <Link href="/products">Browse Products</Link>
//             </Button>
//           </div>
//         )}

//         {/* Grid */}
//         {items.length > 0 && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
//             {items.map((item) => {
//               const off = discount(item.price, item.comparePrice);
//               return (
//                 <div
//                   key={item.id}
//                   className="bg-card border rounded-2xl overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
//                 >
//                   {/* Image */}
//                   <Link
//                     href={`/products/${item.slug}`}
//                     className="relative block"
//                   >
//                     <div className="aspect-square bg-muted overflow-hidden">
//                       {item.imageUrl ? (
//                         <img
//                           src={item.imageUrl}
//                           alt={item.name}
//                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                         />
//                       ) : (
//                         <div className="w-full h-full flex items-center justify-center text-4xl">
//                           🛍️
//                         </div>
//                       )}
//                     </div>

//                     {/* Badges */}
//                     <div className="absolute top-2 left-2 flex flex-col gap-1">
//                       {off && (
//                         <span className="text-xs font-semibold bg-rose-500 text-white px-2 py-0.5 rounded-full">
//                           -{off}%
//                         </span>
//                       )}
//                       {!item.isInStock && (
//                         <span className="text-xs font-semibold bg-gray-700 text-white px-2 py-0.5 rounded-full">
//                           Out of stock
//                         </span>
//                       )}
//                     </div>

//                     {/* Remove button */}
//                     <button
//                       onClick={(e) => {
//                         e.preventDefault();
//                         e.stopPropagation();
//                         remove(item.id);
//                       }}
//                       className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-white"
//                       title="Remove from wishlist"
//                     >
//                       <Trash2 className="h-3.5 w-3.5" />
//                     </button>
//                   </Link>

//                   {/* Info */}
//                   <div className="p-4 flex flex-col gap-3 flex-1">
//                     {item.categoryName && (
//                       <p className="text-xs text-muted-foreground uppercase tracking-wide">
//                         {item.categoryName}
//                       </p>
//                     )}

//                     <Link
//                       href={`/products/${item.slug}`}
//                       className="font-medium line-clamp-2 hover:underline leading-snug"
//                     >
//                       {item.name}
//                     </Link>

//                     {/* Price */}
//                     <div className="flex items-baseline gap-2 mt-auto">
//                       <span className="text-lg font-bold">
//                         ₹{item.price.toLocaleString("en-IN")}
//                       </span>
//                       {item.comparePrice && item.comparePrice > item.price && (
//                         <span className="text-sm text-muted-foreground line-through">
//                           ₹{item.comparePrice.toLocaleString("en-IN")}
//                         </span>
//                       )}
//                     </div>

//                     {/* Add to Cart */}
//                     <Button
//                       size="sm"
//                       className="w-full rounded-xl gap-2"
//                       disabled={!item.isInStock}
//                       onClick={() => addToCart(item)}
//                     >
//                       <ShoppingCart className="h-4 w-4" />
//                       {item.isInStock ? "Add to Cart" : "Out of Stock"}
//                     </Button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import Link from "next/link";
import Image from "next/image";
import { Heart, PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWishlist } from "@/actions/wishlist.actions";
import { WishlistRemoveButton } from "@/components/wishlist/wishlist-remove-button";
import { AddToCartButton } from "@/components/wishlist/add-to-cart-button";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function WishlistPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const items = await getWishlist();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
            My Wishlist
            {items.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({items.length} {items.length === 1 ? "item" : "items"})
              </span>
            )}
          </h1>
        </div>

        {/* Empty State */}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <PackageSearch className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">Your wishlist is empty</h2>
            <p className="text-muted-foreground max-w-sm">
              Save products you love by clicking the heart icon on any product
              page.
            </p>
            <Button asChild className="rounded-xl mt-2">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        )}

        {/* Grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map(({ id, product }) => {
              const imageUrl = product.images[0]?.url ?? null;
              const discount =
                product.comparePrice && product.comparePrice > product.price
                  ? Math.round(
                      ((product.comparePrice - product.price) /
                        product.comparePrice) *
                        100,
                    )
                  : null;

              return (
                <div
                  key={id}
                  className="bg-card border rounded-2xl overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-muted overflow-hidden">
                    <Link href={`/products/${product.slug}`}>
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          🛍️
                        </div>
                      )}
                    </Link>

                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
                      {discount && (
                        <span className="text-xs font-semibold bg-rose-500 text-white px-2 py-0.5 rounded-full">
                          -{discount}%
                        </span>
                      )}
                      {!product.isInStock && (
                        <span className="text-xs font-semibold bg-gray-700 text-white px-2 py-0.5 rounded-full">
                          Out of stock
                        </span>
                      )}
                    </div>

                    {/* Remove from wishlist */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <WishlistRemoveButton productId={product.id} />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <Link
                      href={`/products/${product.slug}`}
                      className="font-medium line-clamp-2 hover:underline leading-snug"
                    >
                      {product.name}
                    </Link>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mt-auto">
                      <span className="text-lg font-bold">
                        ₹{product.price.toLocaleString("en-IN")}
                      </span>
                      {product.comparePrice &&
                        product.comparePrice > product.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{product.comparePrice.toLocaleString("en-IN")}
                          </span>
                        )}
                    </div>

                    {/* Add to Cart */}
                    <AddToCartButton product={product} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
