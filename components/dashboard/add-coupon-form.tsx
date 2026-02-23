"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createCoupon } from "@/actions/admin.actions";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";

export function AddCouponForm() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    startTransition(async () => {
      const res = await createCoupon({
        code: (data.get("code") as string).toUpperCase(),
        type: data.get("type") as "PERCENTAGE" | "FIXED",
        value: Number(data.get("value")),
        usageLimit: data.get("usageLimit")
          ? Number(data.get("usageLimit"))
          : undefined,
        minOrderAmount: data.get("minOrderAmount")
          ? Number(data.get("minOrderAmount"))
          : undefined,
        expiresAt: data.get("expiresAt")
          ? new Date(data.get("expiresAt") as string)
          : undefined,
      });

      if (res.success) {
        toast.success("Coupon created!");
        form.reset();
        setOpen(false);
      } else {
        toast.error(res.error ?? "Failed");
      }
    });
  };

  return (
    <div className="bg-card border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2 font-medium">
          <Plus className="h-4 w-4 text-primary" />
          Add New Coupon
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="p-4 pt-0 border-t space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
            <div className="space-y-1.5">
              <Label>Code *</Label>
              <Input
                name="code"
                placeholder="SAVE20"
                required
                className="uppercase"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type *</Label>
              <select
                name="type"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed (₹)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Value *</Label>
              <Input
                name="value"
                type="number"
                min="1"
                placeholder="10"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>Usage Limit</Label>
              <Input
                name="usageLimit"
                type="number"
                min="1"
                placeholder="100 (optional)"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Min Order (₹)</Label>
              <Input
                name="minOrderAmount"
                type="number"
                min="0"
                placeholder="500 (optional)"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Expires At</Label>
              <Input name="expiresAt" type="date" />
            </div>
          </div>
          <Button type="submit" disabled={isPending} className="rounded-xl">
            {isPending ? "Creating..." : "Create Coupon"}
          </Button>
        </form>
      )}
    </div>
  );
}
