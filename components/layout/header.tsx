// // // components/layout/header.tsx
// // import Link from "next/link";
// // import { ShoppingCart, Search, Heart, User } from "lucide-react";
// // import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
// // import { Button } from "@/components/ui/button";
// // import { ThemeToggle } from "./theme-toggle";
// // import { CartSheet } from "@/components/cart/cart-sheet";
// // import { SmartSearchBar } from "@/components/ai/smart-search-bar";

// // export function Header() {
// //   return (
// //     <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
// //       <div className="container mx-auto flex h-16 items-center justify-between px-4">
// //         {/* Logo */}
// //         <Link href="/" className="flex items-center gap-2 font-bold text-xl">
// //           <span className="text-primary">Shop</span>
// //           <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
// //             AI
// //           </span>
// //         </Link>

// //         {/* Smart Search */}
// //         <div className="hidden flex-1 max-w-xl px-8 md:flex">
// //           <SmartSearchBar />
// //         </div>

// //         {/* Actions */}
// //         <div className="flex items-center gap-2">
// //           <ThemeToggle />

// //           <SignedIn>
// //             <Button variant="ghost" size="icon" asChild>
// //               <Link href="/wishlist">
// //                 <Heart className="h-5 w-5" />
// //               </Link>
// //             </Button>
// //             <CartSheet />
// //             <UserButton afterSignOutUrl="/" />
// //           </SignedIn>

// //           <SignedOut>
// //             <SignInButton mode="modal">
// //               <Button variant="outline" size="sm">
// //                 Sign In
// //               </Button>
// //             </SignInButton>
// //           </SignedOut>
// //         </div>
// //       </div>
// //     </header>
// //   );
// // }

// "use client";

// import Link from "next/link";
// import { Heart, UserCircle } from "lucide-react";
// import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
// import { Button } from "@/components/ui/button";
// import { ThemeToggle } from "./theme-toggle";
// import { CartSheet } from "@/components/cart/cart-sheet";
// import { SmartSearchBar } from "@/components/ai/smart-search-bar";
// import dynamic from "next/dynamic";

// // Dynamic import — hydration fix
// const DynamicUserButton = dynamic(
//   () => import("@clerk/nextjs").then((mod) => ({ default: mod.UserButton })),
//   { ssr: false },
// );

// export function Header() {
//   return (
//     <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//       <div className="container mx-auto flex h-16 items-center justify-between px-4">
//         {/* Logo */}
//         <Link href="/" className="flex items-center gap-2 font-bold text-xl">
//           <span className="text-primary">Shop</span>
//           <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//             AI
//           </span>
//         </Link>

//         {/* Smart Search */}
//         <div className="hidden flex-1 max-w-xl px-8 md:flex">
//           <SmartSearchBar />
//         </div>

//         {/* Actions */}
//         <div className="flex items-center gap-2">
//           <ThemeToggle />

//           <SignedIn>
//             <Button variant="ghost" size="icon" asChild>
//               <Link href="/wishlist">
//                 <Heart className="h-5 w-5" />
//               </Link>
//             </Button>
//             <Button variant="ghost" size="icon" asChild>
//               <Link href="/profile">
//                 <UserCircle className="h-5 w-5" />
//               </Link>
//             </Button>
//             <CartSheet />
//             <DynamicUserButton afterSignOutUrl="/" />
//           </SignedIn>

//           <SignedOut>
//             <SignInButton mode="modal">
//               <Button variant="outline" size="sm" className="rounded-xl">
//                 Sign In
//               </Button>
//             </SignInButton>
//           </SignedOut>
//         </div>
//       </div>
//     </header>
//   );
// }

"use client";

import Link from "next/link";
import { Heart, UserCircle } from "lucide-react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { CartSheet } from "@/components/cart/cart-sheet";
import { SmartSearchBar } from "@/components/ai/smart-search-bar";
import dynamic from "next/dynamic";

// Wrap ALL Clerk auth UI in a single dynamic component with ssr:false
// This fixes the hydration mismatch since Clerk doesn't know auth state on server
const AuthSection = dynamic(
  () =>
    Promise.resolve(function AuthSection() {
      return (
        <>
          <SignedIn>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/profile">
                <UserCircle className="h-5 w-5" />
              </Link>
            </Button>
            <CartSheet />
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline" size="sm" className="rounded-xl">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
        </>
      );
    }),
  { ssr: false },
);

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-primary">Shop</span>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI
          </span>
        </Link>

        {/* Smart Search */}
        <div className="hidden flex-1 max-w-xl px-8 md:flex">
          <SmartSearchBar />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuthSection />
        </div>
      </div>
    </header>
  );
}
