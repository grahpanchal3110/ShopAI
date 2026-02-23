"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Check, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  title?: string | null;
  body: string;
  sentimentLabel?: string | null;
  isFlagged: boolean;
  isApproved: boolean;
  user: { name: string | null; email: string };
  product: { name: string; slug: string };
}

async function approveReview(id: string) {
  const res = await fetch(`/api/admin/reviews/${id}/approve`, {
    method: "POST",
  });
  return res.json();
}

async function deleteReview(id: string) {
  const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
  return res.json();
}

export function ReviewModerationTable({ reviews }: { reviews: Review[] }) {
  const [list, setList] = useState(reviews);
  const [isPending, startTransition] = useTransition();

  const handleApprove = (id: string) => {
    startTransition(async () => {
      await approveReview(id);
      setList((prev) => prev.filter((r) => r.id !== id));
      toast.success("Review approved!");
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteReview(id);
      setList((prev) => prev.filter((r) => r.id !== id));
      toast.success("Review deleted!");
    });
  };

  if (list.length === 0) {
    return (
      <div className="bg-card border rounded-2xl p-8 text-center text-muted-foreground">
        <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No pending reviews — all clear! ✅</p>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-2xl divide-y overflow-hidden">
      {list.map((review) => (
        <div key={review.id} className="p-4 flex gap-4 items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mb-1">
              <span className="font-medium text-foreground">
                {review.product.name}
              </span>
              {" · "}
              {review.user.name ?? review.user.email}
            </p>
            {review.title && (
              <p className="font-medium text-sm">{review.title}</p>
            )}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {review.body}
            </p>
            <div className="flex gap-2 mt-2">
              {review.isFlagged && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  🚩 Flagged
                </span>
              )}
              {review.sentimentLabel && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${review.sentimentLabel === "positive" ? "bg-green-100 text-green-700" : review.sentimentLabel === "negative" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}
                >
                  {review.sentimentLabel}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 border-green-200 hover:bg-green-50"
              onClick={() => handleApprove(review.id)}
              disabled={isPending}
            >
              <Check className="h-3 w-3 mr-1" /> Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => handleDelete(review.id)}
              disabled={isPending}
            >
              <Trash2 className="h-3 w-3 mr-1" /> Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
