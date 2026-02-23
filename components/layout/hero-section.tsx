// components/layout/hero-section.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ShoppingBag, Zap } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full opacity-10 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <span>AI-Powered Shopping Experience</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Shop Smarter with{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-white/70 max-w-xl mx-auto">
            Personalized recommendations, visual search, and an AI assistant —
            all in one place. Discover products made for you.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              size="lg"
              className="rounded-full bg-white text-black hover:bg-white/90 font-semibold px-8"
              asChild
            >
              <Link href="/products">
                <ShoppingBag className="h-5 w-5 mr-2" />
                Shop Now
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-white/30 text-white hover:bg-white/10 px-8"
              asChild
            >
              <Link href="/products/search">
                <Zap className="h-5 w-5 mr-2" />
                Visual Search
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
            {[
              { value: "10K+", label: "Products" },
              { value: "500+", label: "Brands" },
              { value: "AI", label: "Powered" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-white/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
