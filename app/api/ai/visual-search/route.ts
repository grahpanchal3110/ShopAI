// app/api/ai/visual-search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { visualSearch } from "@/lib/ai/visual-search";
import { rateLimiter } from "@/lib/cache/redis";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "anon";
  const { success } = await rateLimiter.limit(`visual:${ip}`);
  if (!success)
    return NextResponse.json({ error: "Rate limited" }, { status: 429 });

  const formData = await req.formData();
  const file = formData.get("image") as File | null;

  if (!file)
    return NextResponse.json({ error: "No image provided" }, { status: 400 });

  // Validate file
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: "File must be an image" },
      { status: 400 },
    );
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json(
      { error: "Image must be under 5MB" },
      { status: 400 },
    );
  }

  // Upload to Cloudinary
  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadResult = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "visual-search",
          transformation: [{ width: 512, height: 512, crop: "fill" }],
        },
        (err, result) => (err ? reject(err) : resolve(result)),
      )
      .end(buffer);
  });

  // Run visual search
  const products = await visualSearch(uploadResult.secure_url, 8);

  return NextResponse.json({ products, imageUrl: uploadResult.secure_url });
}
