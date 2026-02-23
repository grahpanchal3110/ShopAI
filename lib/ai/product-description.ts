// lib/ai/product-description.ts
import { openai } from "./openai";
import { getCached } from "@/lib/cache/redis";

interface DescriptionInput {
  name: string;
  category: string;
  keyFeatures: string[];
  targetAudience?: string;
  price?: number;
  brand?: string;
}

interface DescriptionOutput {
  description: string;
  shortDescription: string;
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  highlights: string[];
}

export async function generateProductDescription(
  input: DescriptionInput,
): Promise<DescriptionOutput> {
  const cacheKey = `desc:${Buffer.from(JSON.stringify(input)).toString("base64").slice(0, 50)}`;

  return getCached(
    cacheKey,
    async () => {
      const res = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert e-commerce copywriter specializing in SEO-optimized product descriptions for the Indian market.
Create compelling, conversion-focused content that:
- Highlights key benefits (not just features)
- Uses natural keywords for SEO
- Is culturally relevant for Indian shoppers
- Follows Google's helpful content guidelines

Return ONLY valid JSON matching this exact schema:
{
  "description": "<200-300 word detailed product description>",
  "shortDescription": "<50-80 word summary>",
  "metaTitle": "<60 char max SEO title>",
  "metaDescription": "<155 char max meta description>",
  "tags": ["tag1", "tag2", ...],
  "highlights": ["highlight1", "highlight2", ...]
}`,
          },
          {
            role: "user",
            content: `Generate product content for:
Product Name: ${input.name}
Category: ${input.category}
Key Features: ${input.keyFeatures.join(", ")}
${input.brand ? `Brand: ${input.brand}` : ""}
${input.price ? `Price: ₹${input.price.toLocaleString()}` : ""}
${input.targetAudience ? `Target Audience: ${input.targetAudience}` : ""}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
        response_format: { type: "json_object" },
      });

      const parsed = JSON.parse(res.choices[0].message.content ?? "{}");
      return {
        description: parsed.description ?? "",
        shortDescription: parsed.shortDescription ?? "",
        metaTitle: parsed.metaTitle ?? input.name,
        metaDescription: parsed.metaDescription ?? "",
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
      };
    },
    86400,
  );
}
