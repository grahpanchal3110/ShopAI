// // // next.config.ts
// // import type { NextConfig } from "next";

// // const nextConfig: NextConfig = {
// //   images: {
// //     remotePatterns: [
// //       { protocol: "https", hostname: "res.cloudinary.com" },
// //       { protocol: "https", hostname: "img.clerk.com" },
// //       { protocol: "https", hostname: "images.unsplash.com" },
// //     ],
// //   },
// //   experimental: {
// //     serverActions: { bodySizeLimit: "10mb" },
// //   },
// // };

// // export default nextConfig;

// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   images: {
//     remotePatterns: [
//       { protocol: "https", hostname: "res.cloudinary.com" },
//       { protocol: "https", hostname: "img.clerk.com" },
//       { protocol: "https", hostname: "images.unsplash.com" },
//     ],
//   },
//   async headers() {
//     return [
//       {
//         source: "/(.*)",
//         headers: [
//           {
//             key: "Content-Security-Policy",
//             value: [
//               "default-src 'self'",
//               "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.accounts.dev https://clerk.accounts.dev https://*.clerk.com https://js.stripe.com https://checkout.razorpay.com",
//               "style-src 'self' 'unsafe-inline' https://*.clerk.com",
//               "img-src 'self' data: blob: https://res.cloudinary.com https://img.clerk.com https://images.unsplash.com https://*.clerk.com",
//               "font-src 'self' https://*.clerk.com",
//               "connect-src 'self' https://*.clerk.accounts.dev https://clerk.accounts.dev https://*.clerk.com https://api.openai.com https://api.stripe.com",
//               "frame-src https://js.stripe.com https://checkout.razorpay.com https://*.clerk.com",
//               "worker-src blob:",
//             ].join("; "),
//           },
//         ],
//       },
//     ];
//   },
// };

// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "img.clerk.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
