// components/ai/ai-description-form.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface Props {
  onApply: (data: {
    description: string;
    shortDescription: string;
    metaTitle: string;
    metaDescription: string;
    tags: string[];
  }) => void;
  productName?: string;
  category?: string;
}

export function AiDescriptionForm({
  onApply,
  productName = "",
  category = "",
}: Props) {
  const [name, setName] = useState(productName);
  const [cat, setCat] = useState(category);
  const [features, setFeatures] = useState("");
  const [audience, setAudience] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!name || !features) {
      toast.error("Product name and features are required");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category: cat,
          keyFeatures: features.split(",").map((f) => f.trim()),
          targetAudience: audience,
        }),
      });

      const data = await res.json();
      if (data.error) toast.error(data.error);
      else setResult(data);
    } catch {
      toast.error("Generation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-purple-500" />
        <h3 className="font-bold text-purple-900 dark:text-purple-300">
          AI Description Generator
        </h3>
        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 text-xs">
          Powered by GPT-4o-mini
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-sm">Product Name *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="iPhone 15 Pro"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm">Category</Label>
          <Input
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            placeholder="Electronics"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Key Features * (comma-separated)</Label>
        <Input
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
          placeholder="A17 Pro chip, titanium design, 48MP camera, USB-C"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">Target Audience</Label>
        <Input
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder="Tech enthusiasts, professionals"
        />
      </div>

      <Button
        onClick={generate}
        disabled={isLoading}
        className="w-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" /> Generate with AI
          </>
        )}
      </Button>

      {result && (
        <div className="space-y-4 pt-2 border-t">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                Generated Description
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyText(result.description)}
              >
                {copied ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <Textarea
              value={result.description}
              readOnly
              rows={5}
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Meta Title ({result.metaTitle?.length}/60)
              </Label>
              <Input value={result.metaTitle} readOnly className="text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Short Description
              </Label>
              <Input
                value={result.shortDescription}
                readOnly
                className="text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Suggested Tags
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {result.tags?.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Button
            onClick={() => onApply(result)}
            className="w-full rounded-xl"
            variant="outline"
          >
            Apply to Product Form
          </Button>
        </div>
      )}
    </div>
  );
}
