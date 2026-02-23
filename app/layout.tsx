// // // app/layout.tsx
// // import type { Metadata } from "next";
// // import { ClerkProvider } from "@clerk/nextjs";
// // import { Inter } from "next/font/google";
// // import { ThemeProvider } from "@/components/layout/theme-provider";
// // import { Toaster } from "@/components/ui/sonner";
// // import "./globals.css";

// // const inter = Inter({ subsets: ["latin"] });

// // export const metadata: Metadata = {
// //   title: {
// //     default: "ShopAI – AI-Powered Shopping",
// //     template: "%s | ShopAI",
// //   },
// //   description:
// //     "The smartest way to shop online with AI-powered recommendations",
// //   keywords: ["ecommerce", "AI shopping", "online store"],
// //   openGraph: {
// //     type: "website",
// //     locale: "en_IN",
// //     url: process.env.NEXT_PUBLIC_APP_URL,
// //     siteName: "ShopAI",
// //   },
// // };

// // export default function RootLayout({
// //   children,
// // }: {
// //   children: React.ReactNode;
// // }) {
// //   return (
// //     <ClerkProvider>
// //       <html lang="en" suppressHydrationWarning>
// //         <body className={inter.className}>
// //           <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
// //             {children}
// //             <Toaster richColors position="top-right" />
// //           </ThemeProvider>
// //         </body>
// //       </html>
// //     </ClerkProvider>
// //   );
// // }

// import type { Metadata } from "next";
// import { ClerkProvider } from "@clerk/nextjs";
// import { Inter } from "next/font/google";
// import "./globals.css";

// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: {
//     default: "ShopAI – AI-Powered Shopping",
//     template: "%s | ShopAI",
//   },
//   description: "The smartest way to shop online",
// };

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <ClerkProvider>
//       <html lang="en">
//         <body className={inter.className}>{children}</body>
//       </html>
//     </ClerkProvider>
//   );
// }

// app/layout.tsx
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "ShopAI – AI-Powered Shopping",
    template: "%s | ShopAI",
  },
  description:
    "The smartest way to shop online with AI-powered recommendations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
