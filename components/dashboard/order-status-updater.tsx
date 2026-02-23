"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { updateOrderStatus } from "@/actions/admin.actions";

const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
  PROCESSING: "bg-purple-100 text-purple-700 border-purple-200",
  SHIPPED: "bg-indigo-100 text-indigo-700 border-indigo-200",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700 border-orange-200",
  DELIVERED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
  REFUNDED: "bg-gray-100 text-gray-700 border-gray-200",
};

export function OrderStatusUpdater({
  orderId,
  currentStatus,
  trackingNumber,
}: {
  orderId: string;
  currentStatus: string;
  trackingNumber: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [tracking, setTracking] = useState(trackingNumber);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = () => {
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, status, tracking);
      if (res.success) toast.success("Order updated!");
      else toast.error("Update failed");
    });
  };

  return (
    <div className="flex items-center gap-3 flex-wrap pt-2 border-t">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className={`text-xs px-3 py-1.5 rounded-lg border font-medium cursor-pointer ${
          STATUS_COLORS[status] ?? "bg-gray-100 text-gray-700"
        }`}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s.replace(/_/g, " ")}
          </option>
        ))}
      </select>

      <Input
        placeholder="Tracking number (optional)"
        value={tracking}
        onChange={(e) => setTracking(e.target.value)}
        className="h-8 text-xs max-w-[200px]"
      />

      <Button
        size="sm"
        onClick={handleUpdate}
        disabled={
          isPending || (status === currentStatus && tracking === trackingNumber)
        }
        className="h-8 rounded-lg text-xs"
      >
        {isPending ? "Updating..." : "Update Status"}
      </Button>
    </div>
  );
}
