// lib/seo/metadata.ts
import type { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://shopai.vercel.app";

export function createMetadata({
  title,
  description,
  image,
  path = "",
  noIndex = false,
}: {
  title: string;
  description: string;
  image?: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${BASE_URL}${path}`;
  const ogImage = image ?? `${BASE_URL}/og-default.jpg`;

  return {
    title: { absolute: `${title} | ShopAI` },
    description,
    metadataBase: new URL(BASE_URL),
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true } },
    openGraph: {
      title,
      description,
      url,
      siteName: "ShopAI",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      type: "website",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function createProductMetadata(product: {
  name: string;
  description: string;
  slug: string;
  price: number;
  images: { url: string }[];
  metaTitle?: string | null;
  metaDescription?: string | null;
}): Metadata {
  return {
    ...createMetadata({
      title: product.metaTitle ?? product.name,
      description: product.metaDescription ?? product.description.slice(0, 155),
      image: product.images[0]?.url,
      path: `/products/${product.slug}`,
    }),
    other: {
      // Product structured data (JSON-LD added separately)
      "product:price:amount": product.price.toString(),
      "product:price:currency": "INR",
    },
  };
}
