// components/layout/mobile-nav.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Home, ShoppingBag, Heart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@clerk/nextjs";

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Products", icon: ShoppingBag },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
  { href: "/orders", label: "Orders", icon: Package },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useAuth();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="font-bold text-xl"
          >
            <span className="text-primary">Shop</span>
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI
            </span>
          </Link>
        </div>

        <nav className="space-y-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted transition-colors text-sm font-medium"
            >
              <Icon className="h-5 w-5 text-muted-foreground" />
              {label}
            </Link>
          ))}
        </nav>

        {!isSignedIn && (
          <div className="mt-6 space-y-2">
            <Button className="w-full rounded-xl" asChild>
              <Link href="/sign-in" onClick={() => setOpen(false)}>
                Sign In
              </Link>
            </Button>
            <Button variant="outline" className="w-full rounded-xl" asChild>
              <Link href="/sign-up" onClick={() => setOpen(false)}>
                Create Account
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
