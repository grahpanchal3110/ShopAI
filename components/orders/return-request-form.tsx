// components/orders/return-request-form.tsx
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { requestReturn } from "@/actions/order.actions";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";

const RETURN_REASONS = [
  "Defective / Damaged product",
  "Wrong item delivered",
  "Item not as described",
  "Changed my mind",
  "Better price available elsewhere",
  "Arrived too late",
  "Other",
];

export function ReturnRequestForm({ orderId }: { orderId: string }) {
  const [show, setShow] = useState(false);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!reason) {
      toast.error("Please select a return reason");
      return;
    }

    startTransition(async () => {
      const result = await requestReturn(orderId, reason, description);
      if (result.error) toast.error(result.error);
      else {
        toast.success(
          "Return request submitted! We'll process it within 24–48 hours.",
        );
        setShow(false);
      }
    });
  };

  if (!show) {
    return (
      <Button
        variant="outline"
        className="rounded-xl gap-2"
        onClick={() => setShow(true)}
      >
        <RotateCcw className="h-4 w-4" />
        Request Return / Refund
      </Button>
    );
  }

  return (
    <div className="bg-card border rounded-2xl p-6 space-y-4">
      <h2 className="font-bold">Request Return</h2>
      <p className="text-sm text-muted-foreground">
        You can return items within 7 days of delivery. Refunds are processed in
        5–7 business days.
      </p>

      <div className="space-y-1.5">
        <Label>Reason for Return *</Label>
        <Select onValueChange={setReason}>
          <SelectTrigger>
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            {RETURN_REASONS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="desc">Additional Details</Label>
        <Textarea
          id="desc"
          placeholder="Describe the issue (optional but helpful)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setShow(false)}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="rounded-xl"
        >
          {isPending ? "Submitting..." : "Submit Return Request"}
        </Button>
      </div>
    </div>
  );
}
