// components/product/product-reviews.tsx
"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { submitReview } from "@/actions/review.actions";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Props {
  productId: string;
  reviews: any[];
}

export function ProductReviews({ productId, reviews }: Props) {
  const { isSignedIn } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = () => {
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }
    if (body.length < 10) {
      toast.error("Review must be at least 10 characters");
      return;
    }

    startTransition(async () => {
      const result = await submitReview({ productId, rating, title, body });
      if (result.success) {
        toast.success("Review submitted! It will be visible after moderation.");
        setRating(0);
        setTitle("");
        setBody("");
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Write Review */}
      {isSignedIn && (
        <div className="bg-muted/50 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold">Write a Review</h3>

          {/* Star Rating Picker */}
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                onMouseEnter={() => setHover(i + 1)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(i + 1)}
              >
                <Star
                  className={cn(
                    "h-7 w-7 transition-colors",
                    i < (hover || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground",
                  )}
                />
              </button>
            ))}
          </div>

          <Input
            placeholder="Review title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Share your experience with this product..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
          />
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="rounded-xl"
          >
            {isPending ? "Submitting..." : "Submit Review"}
          </Button>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No reviews yet. Be the first!
        </p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id}>
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={review.user?.avatar} />
                  <AvatarFallback>
                    {review.user?.name?.[0] ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">
                      {review.user?.name ?? "Customer"}
                    </span>
                    {review.orderId && (
                      <Badge
                        variant="secondary"
                        className="text-xs text-green-600"
                      >
                        Verified Purchase
                      </Badge>
                    )}
                    {review.sentimentLabel && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          review.sentimentLabel === "positive" &&
                            "border-green-500 text-green-600",
                          review.sentimentLabel === "negative" &&
                            "border-red-500 text-red-600",
                        )}
                      >
                        {review.sentimentLabel}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {format(new Date(review.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground",
                        )}
                      />
                    ))}
                  </div>
                  {review.title && (
                    <p className="font-medium text-sm">{review.title}</p>
                  )}
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.body}
                  </p>
                </div>
              </div>
              <Separator className="mt-4" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
