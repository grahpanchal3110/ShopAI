// components/ui/optimized-image.tsx
import Image from "next/image";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
}

// Cloudinary URL transformer for on-the-fly optimization
export function getCloudinaryUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "auto" | "webp" | "avif";
    crop?: "fill" | "fit" | "scale";
  } = {},
): string {
  if (!url.includes("cloudinary.com")) return url;

  const {
    width,
    height,
    quality = 80,
    format = "auto",
    crop = "fill",
  } = options;

  const transforms = [
    "f_auto",
    `q_${quality}`,
    width ? `w_${width}` : null,
    height ? `h_${height}` : null,
    width && height ? `c_${crop}` : null,
  ]
    .filter(Boolean)
    .join(",");

  return url.replace("/upload/", `/upload/${transforms}/`);
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  className,
  priority = false,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  quality = 80,
}: OptimizedImageProps) {
  const optimizedSrc = getCloudinaryUrl(src, { width, height, quality });

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      className={cn("object-cover", className)}
      priority={priority}
      sizes={sizes}
      quality={quality}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJQAB/9k="
    />
  );
}
