// components/product/category-grid.tsx
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  _count?: { products: number };
}

const CATEGORY_COLORS: Record<string, string> = {
  electronics: "from-blue-500 to-cyan-500",
  fashion: "from-pink-500 to-rose-500",
  "home-living": "from-orange-500 to-amber-500",
  sports: "from-green-500 to-emerald-500",
  books: "from-purple-500 to-violet-500",
  beauty: "from-red-500 to-pink-500",
  default: "from-slate-500 to-slate-700",
};

const CATEGORY_EMOJIS: Record<string, string> = {
  electronics: "📱",
  fashion: "👗",
  "home-living": "🏠",
  sports: "⚽",
  books: "📚",
  beauty: "💄",
  default: "🛍️",
};

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (!categories || categories.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map((category) => {
        const colorClass =
          CATEGORY_COLORS[category.slug] ?? CATEGORY_COLORS.default;
        const emoji =
          CATEGORY_EMOJIS[category.slug] ?? CATEGORY_EMOJIS.default;

        return (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            className="group relative overflow-hidden rounded-2xl h-32 flex flex-col items-center justify-center gap-2 text-white transition-transform hover:-translate-y-1 hover:shadow-lg"
          >
            {/* Gradient Background */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-90 group-hover:opacity-100 transition-opacity`}
            />

            {/* Content */}
            <div className="relative z-10 text-center px-3">
              <span className="text-3xl">{emoji}</span>
              <p className="font-semibold text-sm mt-1">{category.name}</p>
              {category._count && (
                <p className="text-xs text-white/70">
                  {category._count.products} items
                </p>
              )}
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
          </Link>
        );
      })}

      {/* View All Card */}
      <Link
        href="/products"
        className="group relative overflow-hidden rounded-2xl h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border hover:border-primary transition-colors"
      >
        <ShoppingBag className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
        <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
          View All
        </p>
      </Link>
    </div>
  );
}