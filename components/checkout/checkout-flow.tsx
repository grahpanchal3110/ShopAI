// components/checkout/checkout-flow.tsx
"use client";

import { useState } from "react";
import { AddressStep } from "./address-step";
import { PaymentStep } from "./payment-step";
import { OrderSummary } from "./order-summary";
import { CheckCircle, MapPin, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Step = "address" | "payment" | "confirm";

const STEPS = [
  { id: "address", label: "Address", icon: MapPin },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "confirm", label: "Confirm", icon: CheckCircle },
] as const;

interface Props {
  cart: any;
  addresses: any[];
}

export function CheckoutFlow({ cart, addresses }: Props) {
  const [step, setStep] = useState<Step>("address");
  const [selectedAddress, setSelectedAddress] = useState<string>(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? "",
  );
  const [orderId, setOrderId] = useState<string | null>(null);

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Steps */}
      <div className="lg:col-span-2 space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === currentStepIndex;
            const isCompleted = i < currentStepIndex;

            return (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all",
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isActive
                        ? "border-primary text-primary"
                        : "border-muted-foreground/30 text-muted-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={cn(
                    "text-sm font-medium hidden sm:block",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-2 transition-colors",
                      i < currentStepIndex ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        {step === "address" && (
          <AddressStep
            addresses={addresses}
            selectedId={selectedAddress}
            onSelect={setSelectedAddress}
            onNext={() => setStep("payment")}
          />
        )}

        {step === "payment" && (
          <PaymentStep
            cart={cart}
            addressId={selectedAddress}
            onBack={() => setStep("address")}
            onSuccess={(id) => {
              setOrderId(id);
              setStep("confirm");
            }}
          />
        )}

        {step === "confirm" && orderId && (
          <OrderConfirmStep orderId={orderId} />
        )}
      </div>

      {/* Right: Order Summary */}
      <div className="lg:col-span-1">
        <OrderSummary cart={cart} />
      </div>
    </div>
  );
}

function OrderConfirmStep({ orderId }: { orderId: string }) {
  return (
    <div className="text-center py-12 space-y-4">
      <div className="text-7xl">🎉</div>
      <h2 className="text-2xl font-bold">Order Placed Successfully!</h2>
      <p className="text-muted-foreground">
        You'll receive a confirmation email shortly.
      </p>
      <div className="flex gap-3 justify-center mt-6">
        <a
          href={`/orders/${orderId}`}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium hover:opacity-90 transition"
        >
          Track Order
        </a>
        <Link
          href="/products"
          className="border px-6 py-3 rounded-xl font-medium hover:bg-muted transition"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
