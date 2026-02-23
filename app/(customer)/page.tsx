// // // app/(customer)/page.tsx
// // import { getFeaturedProducts } from "@/lib/db/queries/products";
// // import { ProductCarousel } from "@/components/product/product-carousel";
// // import { HeroSection } from "@/components/layout/hero-section";
// // import { CategoryGrid } from "@/components/product/category-grid";
// // import { getCategories } from "@/lib/db/queries/products";
// // import { RecommendationCarousel } from "@/components/ai/recommendation-carousel";
// // import { auth } from "@clerk/nextjs/server";

// // export default async function HomePage() {
// //   const { userId } = await auth();
// //   const [featured, categories] = await Promise.all([
// //     getFeaturedProducts(),
// //     getCategories(),
// //   ]);

// //   return (
// //     <div className="space-y-16 pb-16">
// //       <HeroSection />

// //       <div className="container mx-auto px-4">
// //         {/* Featured Products */}
// //         <section>
// //           <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
// //           <ProductCarousel products={featured} />
// //         </section>

// //         {/* Categories */}
// //         <section className="mt-16">
// //           <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
// //           <CategoryGrid categories={categories} />
// //         </section>

// //         {/* AI Recommendations (only if logged in) */}
// //         {userId && (
// //           <section className="mt-16">
// //             <div className="flex items-center gap-2 mb-6">
// //               <h2 className="text-2xl font-bold">Recommended for You</h2>
// //               <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-0.5 rounded-full font-medium">
// //                 AI Powered ✨
// //               </span>
// //             </div>
// //             <RecommendationCarousel userId={userId} />
// //           </section>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // app/(customer)/page.tsx
// import { Suspense } from "react";
// import { HeroSection } from "@/components/layout/hero-section";
// import { CategoryGrid } from "@/components/product/category-grid";
// import { ProductCarousel } from "@/components/product/product-carousel";
// import { Skeleton } from "@/components/ui/skeleton";
// import Link from "next/link";

// // Temporary mock data jab tak DB setup ho
// const MOCK_CATEGORIES = [
//   {
//     id: "1",
//     name: "Electronics",
//     slug: "electronics",
//     _count: { products: 120 },
//   },
//   { id: "2", name: "Fashion", slug: "fashion", _count: { products: 85 } },
//   {
//     id: "3",
//     name: "Home & Living",
//     slug: "home-living",
//     _count: { products: 60 },
//   },
//   { id: "4", name: "Sports", slug: "sports", _count: { products: 45 } },
// ];

// export default function HomePage() {
//   return (
//     <div className="space-y-16 pb-16">
//       {/* Hero */}
//       <HeroSection />

//       <div className="container mx-auto px-4 space-y-16">
//         {/* Categories */}
//         <section>
//           <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
//           <CategoryGrid categories={MOCK_CATEGORIES} />
//         </section>

//         {/* Featured - placeholder */}
//         <section>
//           <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             {Array.from({ length: 4 }).map((_, i) => (
//               <div key={i} className="space-y-3">
//                 <Skeleton className="h-64 w-full rounded-xl" />
//                 <Skeleton className="h-4 w-3/4" />
//                 <Skeleton className="h-4 w-1/2" />
//               </div>
//             ))}
//           </div>
//           <p className="text-center text-muted-foreground mt-4 text-sm">
//             Database setup ke baad products yahan dikhenge →{" "}
//             <Link href="/products" className="text-primary underline">
//               Browse All Products
//             </Link>
//           </p>
//         </section>
//       </div>
//     </div>
//   );
// }

import { Suspense } from "react";
import { HeroSection } from "@/components/layout/hero-section";
import { CategoryGrid } from "@/components/product/category-grid";
import { ProductCarousel } from "@/components/product/product-carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { getFeaturedProducts, getCategories } from "@/lib/db/queries/products";
import Link from "next/link";

// Featured Products Section
async function FeaturedSection() {
  const products = await getFeaturedProducts();
  if (!products.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Featured Products</h2>
        <Link href="/products" className="text-primary text-sm hover:underline">
          View All →
        </Link>
      </div>
      <ProductCarousel products={products} />
    </section>
  );
}

// Categories Section
async function CategoriesSection() {
  const categories = await getCategories();
  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
      <CategoryGrid categories={categories} />
    </section>
  );
}

// Loading Skeleton
function ProductSkeleton() {
  return (
    <div className="flex gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3 shrink-0 w-64">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero */}
      <HeroSection />

      <div className="container mx-auto px-4 space-y-16">
        {/* Categories */}
        <Suspense fallback={<Skeleton className="h-40 w-full rounded-xl" />}>
          <CategoriesSection />
        </Suspense>

        {/* Featured Products */}
        <Suspense fallback={<ProductSkeleton />}>
          <FeaturedSection />
        </Suspense>
      </div>
    </div>
  );
}
