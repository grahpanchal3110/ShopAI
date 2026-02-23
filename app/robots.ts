// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL!;
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/seller/", "/api/", "/checkout/", "/profile/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
