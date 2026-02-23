// components/dashboard/pricing-suggestion-card.tsx
"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Loader2, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PricingSuggestionCard({
  productId,
  currentPrice,
  onApply,
}: {
  productId: string;
  currentPrice: number;
  onApply: (price: number) => void;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/ai/pricing?productId=${productId}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="border rounded-xl p-4 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Analyzing market prices...</span>
      </div>
    );
  }

  if (!data) return null;

  const diff = data.suggestedPrice - currentPrice;
  const pctDiff = ((diff / currentPrice) * 100).toFixed(1);

  return (
    <div className="border rounded-xl p-5 space-y-3 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-emerald-600" />
        <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">
          AI Price Suggestion
        </span>
        <Badge
          variant="outline"
          className={cn(
            "text-xs",
            data.confidence === "high"
              ? "border-green-500 text-green-600"
              : data.confidence === "medium"
                ? "border-yellow-500 text-yellow-600"
                : "border-gray-400 text-gray-600",
          )}
        >
          {data.confidence} confidence
        </Badge>
      </div>

      <div className="flex items-end gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Suggested Price</p>
          <p className="text-2xl font-bold">
            ₹{data.suggestedPrice?.toLocaleString()}
          </p>
        </div>
        <p
          className={cn(
            "text-sm font-medium mb-1",
            diff > 0
              ? "text-green-600"
              : diff < 0
                ? "text-red-600"
                : "text-muted-foreground",
          )}
        >
          {diff > 0 ? "+" : ""}
          {pctDiff}% vs current
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/60 dark:bg-black/20 rounded-lg p-2">
        <Info className="h-3 w-3 shrink-0" />
        <p>{data.reasoning}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {data.factors?.map((f: string) => (
          <Badge key={f} variant="secondary" className="text-xs">
            {f}
          </Badge>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Market range: ₹{data.minPrice?.toLocaleString()} – ₹
        {data.maxPrice?.toLocaleString()}
      </p>

      <Button
        size="sm"
        variant="outline"
        className="w-full rounded-xl border-emerald-500 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
        onClick={() => onApply(data.suggestedPrice)}
      >
        Apply Suggested Price
      </Button>
    </div>
  );
}
