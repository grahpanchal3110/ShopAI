// lib/validations/index.ts
import { z } from "zod";

// Sanitize string — strip HTML/JS injection
const safeString = (min = 1, max = 500) =>
  z
    .string()
    .min(min)
    .max(max)
    .transform((s) =>
      s
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<[^>]+>/g, "")
        .trim(),
    );

export const addressSchema = z.object({
  name: safeString(2, 100),
  line1: safeString(5, 200),
  line2: safeString(0, 200).optional(),
  city: safeString(2, 50),
  state: safeString(2, 50),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
  phone: z.string().regex(/^(\+91)?[6-9]\d{9}$/, "Invalid Indian phone number"),
  isDefault: z.boolean().default(false),
});

export const reviewSchema = z.object({
  productId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  title: safeString(0, 100).optional(),
  body: safeString(10, 2000),
});

export const searchSchema = z.object({
  q: z
    .string()
    .min(1)
    .max(200)
    .transform((s) => s.replace(/[<>]/g, "").trim()),
  page: z.coerce.number().int().min(1).max(100).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  category: z.string().max(50).optional(),
  minPrice: z.coerce.number().min(0).max(10_000_000).optional(),
  maxPrice: z.coerce.number().min(0).max(10_000_000).optional(),
  sort: z
    .enum(["newest", "price_asc", "price_desc", "rating", "popular"])
    .default("newest"),
});

export const couponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
});

export const checkoutSchema = z.object({
  addressId: z.string().cuid(),
  paymentMethod: z.enum(["STRIPE", "RAZORPAY", "CASH_ON_DELIVERY"]),
  couponCode: z.string().max(20).optional(),
});

// Server Action wrapper with validation
export function withValidation<T extends z.ZodSchema>(
  schema: T,
  handler: (data: z.infer<T>) => Promise<any>,
) {
  return async (rawData: unknown) => {
    const result = schema.safeParse(rawData);
    if (!result.success) {
      return {
        error: result.error.issues.map((i) => i.message).join(", "),
      };
    }
    return handler(result.data);
  };
}
