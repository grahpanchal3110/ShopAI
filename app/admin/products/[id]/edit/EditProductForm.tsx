"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { updateProduct } from "@/actions/product.admin.actions";

function normalizeImageUrl(u: string) {
  const url = (u ?? "").trim();
  if (!url) return "";

  // Unsplash photo page URL -> direct image URL
  const m = url.match(/^https?:\/\/unsplash\.com\/photos\/([a-zA-Z0-9_-]+)/);
  if (m?.[1]) return `https://source.unsplash.com/${m[1]}/1080x1080`;

  return url;
}

type EditProductFormProps = {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    comparePrice: number | null;
    stock: number;
    categorySlug: string;
    imageUrl: string;
    isFeatured: boolean;
  };
};

export default function EditProductForm({ product }: EditProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [imageUrl, setImageUrl] = useState(product.imageUrl ?? "");
  const normalizedImageUrl = useMemo(
    () => normalizeImageUrl(imageUrl),
    [imageUrl],
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const rawImageUrl = (data.get("imageUrl") as string) ?? "";
    const imageUrlFinal = normalizeImageUrl(rawImageUrl);

    startTransition(async () => {
      const result = await updateProduct(product.id, {
        name: data.get("name") as string,
        description: data.get("description") as string,
        price: Number(data.get("price")),
        comparePrice: data.get("comparePrice")
          ? Number(data.get("comparePrice"))
          : undefined,
        stock: Number(data.get("stock")),
        categorySlug: data.get("categorySlug") as string,
        imageUrl: imageUrlFinal,
        isFeatured: data.get("isFeatured") === "on",
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Product updated successfully!");
        router.push("/admin/products");
        router.refresh();
      }
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          ← Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-card border rounded-2xl p-6 space-y-5"
      >
        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. iPhone 15 Pro Max"
            required
            defaultValue={product.name}
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Product description..."
            required
            defaultValue={product.description}
          />
        </div>

        {/* Price Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="price">Price (₹) *</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              placeholder="99999"
              required
              defaultValue={product.price}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="comparePrice">Compare Price (₹)</Label>
            <Input
              id="comparePrice"
              name="comparePrice"
              type="number"
              min="0"
              placeholder="Optional"
              defaultValue={product.comparePrice ?? ""}
            />
          </div>
        </div>

        {/* Stock + Category */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="stock">Stock *</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              min="0"
              placeholder="100"
              required
              defaultValue={product.stock}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="categorySlug">Category *</Label>
            <select
              id="categorySlug"
              name="categorySlug"
              required
              defaultValue={product.categorySlug}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select category</option>
              <option value="electronics">Electronics</option>
              <option value="fashion">Fashion</option>
              <option value="home-living">Home & Living</option>
              <option value="sports">Sports</option>
              <option value="books">Books</option>
            </select>
          </div>
        </div>

        {/* Image URL */}
        <div className="space-y-1.5">
          <Label htmlFor="imageUrl">Image URL *</Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            placeholder="https://images.unsplash.com/... OR https://unsplash.com/photos/XXXX"
            required
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          {imageUrl &&
            imageUrl.trim().startsWith("https://unsplash.com/photos/") && (
              <p className="text-xs text-muted-foreground">
                Converted to:{" "}
                <span className="font-mono break-all">
                  {normalizedImageUrl}
                </span>
              </p>
            )}

          {normalizedImageUrl && (
            <div className="mt-2 w-32 h-32 rounded-xl overflow-hidden border">
              <img
                src={normalizedImageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={() => setImageUrl("")}
              />
            </div>
          )}
        </div>

        {/* Featured */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isFeatured"
            name="isFeatured"
            className="h-4 w-4 rounded"
            defaultChecked={product.isFeatured}
          />
          <Label htmlFor="isFeatured">Featured Product</Label>
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            className="flex-1 rounded-xl"
            size="lg"
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="rounded-xl"
            size="lg"
            disabled={isPending}
            onClick={() => router.push("/admin/products")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
