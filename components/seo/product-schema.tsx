// components/seo/product-schema.tsx
export function ProductSchema({ product }: { product: any }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images?.map((i: any) => i.url),
    sku: product.sku,
    brand: product.store?.name
      ? { "@type": "Brand", name: product.store.name }
      : undefined,
    offers: {
      "@type": "Offer",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`,
      priceCurrency: "INR",
      price: product.price,
      availability: product.isInStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "ShopAI" },
    },
    aggregateRating:
      product.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.avgRating?.toFixed(1),
            reviewCount: product.reviewCount,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ShopAI",
    url: process.env.NEXT_PUBLIC_APP_URL,
    logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "Hindi"],
    },
    sameAs: ["https://twitter.com/shopai", "https://instagram.com/shopai"],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
