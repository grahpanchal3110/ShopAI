// lib/validations/product.ts
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().min(20),
  shortDescription: z.string().max(300).optional(),
  price: z.coerce.number().positive(),
  comparePrice: z.coerce.number().positive().optional(),
  cost: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().min(0),
  sku: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  isActive: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
});

export type ProductInput = z.infer<typeof productSchema>;
