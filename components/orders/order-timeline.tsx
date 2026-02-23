// components/orders/order-timeline.tsx
import { cn } from "@/lib/utils";
import { Check, Clock, Package, Truck, Home, XCircle } from "lucide-react";

const TIMELINE_STEPS = [
  { status: "PENDING", label: "Order Placed", icon: Clock },
  { status: "CONFIRMED", label: "Order Confirmed", icon: Check },
  { status: "PROCESSING", label: "Processing", icon: Package },
  { status: "SHIPPED", label: "Shipped", icon: Truck },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck },
  { status: "DELIVERED", label: "Delivered", icon: Home },
];

const STATUS_ORDER = TIMELINE_STEPS.map((s) => s.status);

interface Props {
  status: string;
  createdAt: Date;
}

export function OrderTimeline({ status, createdAt }: Props) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 text-destructive">
        <XCircle className="h-6 w-6" />
        <span className="font-medium">Order Cancelled</span>
      </div>
    );
  }

  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="relative">
      {TIMELINE_STEPS.map((step, i) => {
        const Icon = step.icon;
        const isCompleted = i <= currentIndex;
        const isCurrent = i === currentIndex;
        const isLast = i === TIMELINE_STEPS.length - 1;

        return (
          <div key={step.status} className="flex gap-4">
            {/* Icon + Line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground/30 text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "w-0.5 flex-1 my-1 min-h-[32px]",
                    i < currentIndex ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>

            {/* Label */}
            <div className="pb-6 pt-2">
              <p
                className={cn(
                  "font-medium text-sm",
                  isCurrent
                    ? "text-primary"
                    : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground",
                )}
              >
                {step.label}
              </p>
              {isCurrent && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Current status
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
