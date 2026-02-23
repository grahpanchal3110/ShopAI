// components/layout/footer.tsx
import Link from "next/link";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-xl mb-3"
            >
              <span className="text-primary">Shop</span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered shopping platform with personalized recommendations and
              smart search.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                { label: "All Products", href: "/products" },
                {
                  label: "Electronics",
                  href: "/products?category=electronics",
                },
                { label: "Fashion", href: "/products?category=fashion" },
                { label: "New Arrivals", href: "/products?sort=newest" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Account</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                { label: "My Orders", href: "/orders" },
                { label: "Wishlist", href: "/wishlist" },
                { label: "Profile", href: "/profile" },
                { label: "Sign In", href: "/sign-in" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          {/* <div>
            <h3 className="font-semibold mb-3 text-sm">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                { label: "Help Center", href: "/help" },
                { label: "Returns", href: "/returns" },
                { label: "Track Order", href: "/orders" },
                { label: "Contact Us", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div> */}
          {/* Support */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                { label: "Help Center", href: "/help" },
                { label: "Returns", href: "/returns" },
                { label: "Track Order", href: "/orders" },
                { label: "Contact Us", href: "/contact" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 ShopAI. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            <span>Powered by AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
