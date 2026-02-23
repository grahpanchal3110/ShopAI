// // prisma/seed.ts
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function main() {
//   console.log("🌱 Seeding database...");

//   // Pehle purana data delete karo
//   await prisma.orderItem.deleteMany();
//   await prisma.order.deleteMany();
//   await prisma.cartItem.deleteMany();
//   await prisma.cart.deleteMany();
//   await prisma.review.deleteMany();
//   await prisma.wishlistItem.deleteMany();
//   await prisma.productImage.deleteMany();
//   await prisma.productVariant.deleteMany();
//   await prisma.product.deleteMany();
//   await prisma.category.deleteMany();
//   await prisma.store.deleteMany();
//   await prisma.user.deleteMany();

//   console.log("✅ Old data cleared");
//   // Create admin user (update clerkId after creating in Clerk dashboard)
//   const admin = await prisma.user.upsert({
//     where: { email: "admin@shopai.com" },
//     update: {},
//     create: {
//       clerkId: "user_placeholder_admin",
//       email: "admin@shopai.com",
//       name: "Admin User",
//       role: "ADMIN",
//     },
//   });

//   // Create categories
//   const electronics = await prisma.category.upsert({
//     where: { slug: "electronics" },
//     update: {},
//     create: {
//       name: "Electronics",
//       slug: "electronics",
//       description: "Gadgets, phones, laptops and more",
//     },
//   });

//   const fashion = await prisma.category.upsert({
//     where: { slug: "fashion" },
//     update: {},
//     create: {
//       name: "Fashion",
//       slug: "fashion",
//       description: "Clothing, footwear and accessories",
//     },
//   });

//   // Create a seller store
//   const seller = await prisma.user.upsert({
//     where: { email: "seller@shopai.com" },
//     update: {},
//     create: {
//       clerkId: "user_placeholder_seller",
//       email: "seller@shopai.com",
//       name: "Demo Seller",
//       role: "SELLER",
//     },
//   });

//   const store = await prisma.store.upsert({
//     where: { userId: seller.id },
//     update: {},
//     create: {
//       userId: seller.id,
//       name: "TechZone Store",
//       slug: "techzone",
//       description: "Your one-stop shop for electronics",
//       isVerified: true,
//       isActive: true,
//     },
//   });

//   // Create sample products
//   await prisma.product.create({
//     data: {
//       storeId: store.id,
//       categoryId: electronics.id,
//       name: "iPhone 15 Pro Max",
//       slug: "iphone-15-pro-max",
//       description:
//         "The most powerful iPhone ever with A17 Pro chip, titanium design, and USB-C.",
//       price: 134900,
//       comparePrice: 149900,
//       stock: 50,
//       isActive: true,
//       isFeatured: true,
//       tags: ["apple", "smartphone", "5G"],
//       images: {
//         create: [
//           {
//             url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
//             isPrimary: true,
//             order: 0,
//           },
//         ],
//       },
//       variants: {
//         create: [
//           {
//             name: "256GB / Natural Titanium",
//             options: [
//               { name: "Storage", value: "256GB" },
//               { name: "Color", value: "Natural Titanium" },
//             ],
//             price: 134900,
//             stock: 20,
//           },
//           {
//             name: "512GB / Black Titanium",
//             options: [
//               { name: "Storage", value: "512GB" },
//               { name: "Color", value: "Black Titanium" },
//             ],
//             price: 154900,
//             stock: 15,
//           },
//         ],
//       },
//     },
//   });

//   console.log("✅ Database seeded successfully");
// }

// main()
//   .catch(console.error)
//   .finally(() => prisma.$disconnect());

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear old data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.store.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();
  console.log("✅ Old data cleared");

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      clerkId: "seed-admin-placeholder",
      email: "admin@shopai.com",
      name: "ShopAI Admin",
      role: "ADMIN",
    },
  });

  // Create store
  // Create store
  const store = await prisma.store.create({
    data: {
      name: "TechZone Store",
      slug: "techzone-store",
      description: "Best tech products",
      isActive: true,
      userId: admin.id, // ← ownerId nahi, userId hai!
    },
  });

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Electronics",
        slug: "electronics",
        description: "Gadgets & devices",
      },
    }),
    prisma.category.create({
      data: {
        name: "Fashion",
        slug: "fashion",
        description: "Clothing & accessories",
      },
    }),
    prisma.category.create({
      data: {
        name: "Home & Living",
        slug: "home-living",
        description: "Home decor",
      },
    }),
    prisma.category.create({
      data: {
        name: "Sports",
        slug: "sports",
        description: "Sports equipment",
      },
    }),
    prisma.category.create({
      data: {
        name: "Books",
        slug: "books",
        description: "Books & learning",
      },
    }),
  ]);

  const [electronics, fashion, home, sports, books] = categories;

  // Products data
  const productsData = [
    {
      name: "iPhone 15 Pro Max",
      slug: "iphone-15-pro-max",
      description:
        "Apple iPhone 15 Pro Max with A17 Pro chip, titanium design, and 48MP camera.",
      price: 134900,
      comparePrice: 149900,
      stock: 47,
      categoryId: electronics.id,
      isFeatured: true,
      image:
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&q=80",
    },
    {
      name: "Samsung Galaxy S24 Ultra",
      slug: "samsung-galaxy-s24-ultra",
      description:
        "Samsung's flagship with S Pen, 200MP camera, and AI features.",
      price: 129999,
      comparePrice: 139999,
      stock: 32,
      categoryId: electronics.id,
      isFeatured: true,
      image:
        "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&q=80",
    },
    {
      name: "MacBook Pro 14 M3",
      slug: "macbook-pro-14-m3",
      description: "Apple MacBook Pro with M3 chip, 18-hour battery life.",
      price: 168900,
      comparePrice: 185000,
      stock: 15,
      categoryId: electronics.id,
      isFeatured: true,
      image:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    },
    {
      name: "Sony WH-1000XM5",
      slug: "sony-wh-1000xm5",
      description: "Industry-leading noise canceling wireless headphones.",
      price: 24990,
      comparePrice: 29990,
      stock: 85,
      categoryId: electronics.id,
      isFeatured: false,
      image:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    },
    {
      name: "iPad Pro 12.9 M2",
      slug: "ipad-pro-12-m2",
      description: "Apple iPad Pro with M2 chip and Liquid Retina XDR display.",
      price: 89900,
      comparePrice: 99900,
      stock: 28,
      categoryId: electronics.id,
      isFeatured: true,
      image:
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80",
    },
    {
      name: "Nike Air Max 270",
      slug: "nike-air-max-270",
      description:
        "Nike's most exaggerated Air unit yet for a super-soft ride.",
      price: 8995,
      comparePrice: 11995,
      stock: 120,
      categoryId: fashion.id,
      isFeatured: false,
      image:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    },
    {
      name: "Levi's 511 Slim Fit Jeans",
      slug: "levis-511-slim-fit",
      description: "Classic slim fit jeans with stretch comfort.",
      price: 3499,
      comparePrice: 4999,
      stock: 200,
      categoryId: fashion.id,
      isFeatured: false,
      image:
        "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=800&q=80",
    },
    {
      name: "Dyson V15 Detect",
      slug: "dyson-v15-detect",
      description: "Most powerful cordless vacuum with laser dust detection.",
      price: 52900,
      comparePrice: 59900,
      stock: 22,
      categoryId: home.id,
      isFeatured: true,
      image:
        "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=80",
    },
    {
      name: "Instant Pot Duo 7-in-1",
      slug: "instant-pot-duo",
      description:
        "Electric pressure cooker, slow cooker, rice cooker and more.",
      price: 7999,
      comparePrice: 9999,
      stock: 65,
      categoryId: home.id,
      isFeatured: false,
      image:
        "https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80",
    },
    {
      name: "Yoga Mat Premium",
      slug: "yoga-mat-premium",
      description: "6mm thick non-slip yoga mat with carrying strap.",
      price: 1299,
      comparePrice: 1999,
      stock: 300,
      categoryId: sports.id,
      isFeatured: false,
      image:
        "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800&q=80",
    },
    {
      name: "Fitbit Charge 6",
      slug: "fitbit-charge-6",
      description: "Advanced fitness tracker with GPS and heart rate monitor.",
      price: 14999,
      comparePrice: 17999,
      stock: 55,
      categoryId: sports.id,
      isFeatured: true,
      image:
        "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80",
    },
    {
      name: "Atomic Habits",
      slug: "atomic-habits-book",
      description:
        "James Clear's #1 New York Times bestseller on building good habits.",
      price: 399,
      comparePrice: 599,
      stock: 500,
      categoryId: books.id,
      isFeatured: false,
      image:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80",
    },
    {
      name: "The Psychology of Money",
      slug: "psychology-of-money",
      description: "Morgan Housel's timeless lessons on wealth and happiness.",
      price: 349,
      comparePrice: 499,
      stock: 350,
      categoryId: books.id,
      isFeatured: false,
      image:
        "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=800&q=80",
    },
    {
      name: "Apple Watch Series 9",
      slug: "apple-watch-series-9",
      description:
        "Smarter. Brighter. Mightier. With S9 chip and double tap gesture.",
      price: 41900,
      comparePrice: 45900,
      stock: 40,
      categoryId: electronics.id,
      isFeatured: true,
      image:
        "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=800&q=80",
    },
    {
      name: "DJI Mini 4 Pro Drone",
      slug: "dji-mini-4-pro",
      description:
        "Lightweight drone with 4K/60fps camera and omnidirectional obstacle sensing.",
      price: 74900,
      comparePrice: 84900,
      stock: 18,
      categoryId: electronics.id,
      isFeatured: true,
      image:
        "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80",
    },
  ];

  // Create products
  for (const p of productsData) {
    const { image, ...productData } = p;
    await prisma.product.create({
      data: {
        ...productData,
        storeId: store.id,
        isActive: true,
        isInStock: true,
        sku: `SKU-${p.slug.toUpperCase().slice(0, 8)}`,
        images: {
          create: [{ url: image, isPrimary: true }],
        },
      },
    });
  }

  // Create coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        type: "PERCENTAGE",
        value: 10,
        isActive: true,
        usageLimit: 100,
      },
      {
        code: "FLAT500",
        type: "FIXED",
        value: 500,
        isActive: true,
      },
      {
        code: "SUMMER20",
        type: "PERCENTAGE",
        value: 20,
        isActive: true,
        expiresAt: new Date("2026-08-31"),
      },
    ],
  });

  console.log("✅ Database seeded successfully with 15 products!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
