// // // // middleware.ts
// // // import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// // // import { NextResponse } from "next/server";

// // // const isPublicRoute = createRouteMatcher([
// // //   "/",
// // //   "/sign-in(.*)",
// // //   "/sign-up(.*)",
// // //   "/products(.*)",
// // //   "/api/webhooks(.*)",
// // //   "/api/ai/chat", // chatbot is public
// // // ]);

// // // const isSellerRoute = createRouteMatcher(["/seller(.*)"]);
// // // const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// // // export default clerkMiddleware(async (auth, req) => {
// // //   const { userId, sessionClaims } = await auth();
// // //   const role = (sessionClaims?.metadata as any)?.role as string | undefined;

// // //   // Protect non-public routes
// // //   if (!isPublicRoute(req)) {
// // //     if (!userId) {
// // //       return NextResponse.redirect(new URL("/sign-in", req.url));
// // //     }
// // //   }

// // //   // Seller route guard
// // //   if (isSellerRoute(req)) {
// // //     if (role !== "SELLER" && role !== "ADMIN") {
// // //       return NextResponse.redirect(new URL("/", req.url));
// // //     }
// // //   }

// // //   // Admin route guard
// // //   if (isAdminRoute(req)) {
// // //     if (role !== "ADMIN") {
// // //       return NextResponse.redirect(new URL("/", req.url));
// // //     }
// // //   }

// // //   return NextResponse.next();
// // // });

// // // export const config = {
// // //   matcher: [
// // //     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
// // //     "/(api|trpc)(.*)",
// // //   ],
// // // };

// // // middleware.ts (complete version with security)
// // import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// // import { NextResponse, NextRequest } from "next/server";
// // import { checkRateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

// // const isPublicRoute = createRouteMatcher([
// //   "/",
// //   "/sign-in(.*)",
// //   "/sign-up(.*)",
// //   "/products(.*)",
// //   "/api/webhooks(.*)",
// //   "/api/ai/chat",
// //   "/api/ai/smart-search(.*)",
// // ]);

// // const isSellerRoute = createRouteMatcher(["/seller(.*)"]);
// // const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
// // const isApiRoute = createRouteMatcher(["/api(.*)"]);
// // const isAiRoute = createRouteMatcher(["/api/ai(.*)"]);
// // const isCheckoutRoute = createRouteMatcher([
// //   "/api/payments(.*)",
// //   "/checkout(.*)",
// // ]);
// // const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

// // export default clerkMiddleware(async (auth, req) => {
// //   const { userId, sessionClaims } = await auth();
// //   const role = (sessionClaims?.metadata as any)?.role as string | undefined;

// //   // ── Security Headers ─────────────────────────────────────────
// //   const res = NextResponse.next();
// //   res.headers.set("X-Frame-Options", "DENY");
// //   res.headers.set("X-Content-Type-Options", "nosniff");
// //   res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
// //   res.headers.set(
// //     "Permissions-Policy",
// //     "camera=(), microphone=(), geolocation=()",
// //   );
// //   res.headers.set(
// //     "Content-Security-Policy",
// //     [
// //       "default-src 'self'",
// //       "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://checkout.razorpay.com https://clerk.com",
// //       "style-src 'self' 'unsafe-inline'",
// //       "img-src 'self' data: blob: https://res.cloudinary.com https://img.clerk.com https://images.unsplash.com",
// //       "font-src 'self'",
// //       "connect-src 'self' https://api.openai.com https://api.stripe.com https://lumberjack.razorpay.com",
// //       "frame-src https://js.stripe.com https://checkout.razorpay.com",
// //     ].join("; "),
// //   );

// //   // ── Rate Limiting ────────────────────────────────────────────
// //   if (isApiRoute(req)) {
// //     let limiterKey: "api" | "ai" | "checkout" | "auth" | "search" = "api";

// //     if (isAiRoute(req)) limiterKey = "ai";
// //     else if (isCheckoutRoute(req)) limiterKey = "checkout";
// //     else if (isAuthRoute(req)) limiterKey = "auth";
// //     else if (req.nextUrl.pathname.includes("search")) limiterKey = "search";

// //     // Skip rate limiting for webhooks
// //     if (!req.nextUrl.pathname.includes("webhook")) {
// //       const result = await checkRateLimit(req, limiterKey);
// //       if (!result.success) return rateLimitResponse(result.reset);

// //       res.headers.set("X-RateLimit-Limit", String(result.limit));
// //       res.headers.set("X-RateLimit-Remaining", String(result.remaining));
// //     }
// //   }

// //   // ── Auth Guards ─────────────────────────────────────────────
// //   if (!isPublicRoute(req) && !userId) {
// //     const signInUrl = new URL("/sign-in", req.url);
// //     signInUrl.searchParams.set("redirect", req.nextUrl.pathname);
// //     return NextResponse.redirect(signInUrl);
// //   }

// //   if (isSellerRoute(req) && role !== "SELLER" && role !== "ADMIN") {
// //     return NextResponse.redirect(new URL("/", req.url));
// //   }

// //   if (isAdminRoute(req) && role !== "ADMIN") {
// //     return NextResponse.redirect(new URL("/", req.url));
// //   }

// //   // Pass user ID to API routes via header
// //   if (userId) res.headers.set("x-user-id", userId);

// //   return res;
// // });

// // export const config = {
// //   matcher: [
// //     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
// //     "/(api|trpc)(.*)",
// //   ],
// // };

// // middleware.ts
// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// const isPublicRoute = createRouteMatcher([
//   "/",
//   "/sign-in(.*)",
//   "/sign-up(.*)",
//   "/products(.*)",
//   "/api/webhooks(.*)",
//   "/api/ai/chat(.*)",
//   "/api/ai/smart-search(.*)",
// ]);

// const isSellerRoute = createRouteMatcher(["/seller(.*)"]);
// const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// export default clerkMiddleware(async (auth, req) => {
//   const { userId, sessionClaims } = await auth();
//   const role = (sessionClaims?.metadata as any)?.role as string | undefined;

//   if (!isPublicRoute(req) && !userId) {
//     const signInUrl = new URL("/sign-in", req.url);
//     signInUrl.searchParams.set("redirect", req.nextUrl.pathname);
//     return NextResponse.redirect(signInUrl);
//   }

//   if (isSellerRoute(req) && role !== "SELLER" && role !== "ADMIN") {
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   if (isAdminRoute(req) && role !== "ADMIN") {
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   return NextResponse.next();
// });

// export const config = {
//   matcher: [
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//     "/(api|trpc)(.*)",
//   ],
// };

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/checkout(.*)",
  "/orders(.*)",
  "/wishlist(.*)",
  "/profile(.*)",
  "/cart(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Sirf ye routes protect karo — admin/seller layout handle karega
  if (isProtectedRoute(req) && !userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
