// components/product/visual-search-upload.tsx
"use client";

import { useState, useRef } from "react";
import { Upload, Camera, X, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "./product-card";
import Image from "next/image";
import { toast } from "sonner";

export function VisualSearchUpload() {
  const [preview, setPreview] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Preview
    const url = URL.createObjectURL(file);
    setPreview(url);
    setResults([]);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/ai/visual-search", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.error) toast.error(data.error);
      else setResults(data.products ?? []);
    } catch {
      toast.error("Visual search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors cursor-pointer ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onClick={() => fileRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center">
              <Camera className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">
                Upload an image to find similar products
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Drag & drop or click to browse · JPG, PNG, WEBP up to 5MB
              </p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="h-4 w-4" /> Choose Image
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              e.target.files?.[0] && handleFile(e.target.files[0])
            }
          />
        </div>
      ) : (
        <div className="flex items-start gap-4">
          <div className="relative w-40 h-40 rounded-2xl overflow-hidden bg-muted shrink-0">
            <Image
              src={preview}
              alt="Search image"
              fill
              className="object-cover"
              sizes="160px"
            />
          </div>
          <div className="flex-1 space-y-3">
            <p className="font-medium">
              Searching for visually similar products...
            </p>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Analyzing image with AI...</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Found {results.length} similar products
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                setPreview(null);
                setResults([]);
              }}
            >
              <X className="h-4 w-4" /> Clear
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Search className="h-4 w-4" />
            Visually Similar Products
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
