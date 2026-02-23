// components/checkout/payment-step.tsx
"use client";

import { useState, useTransition } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Smartphone, Truck, ArrowLeft, Lock } from "lucide-react";
import {
  createOrder,
  createStripePaymentIntent,
  createRazorpayOrder,
} from "@/actions/order.actions";
import { toast } from "sonner";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

type PaymentMethod = "STRIPE" | "RAZORPAY" | "CASH_ON_DELIVERY";

interface Props {
  cart: any;
  addressId: string;
  onBack: () => void;
  onSuccess: (orderId: string) => void;
}

export function PaymentStep({ cart, addressId, onBack, onSuccess }: Props) {
  const [method, setMethod] = useState<PaymentMethod>("RAZORPAY");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const subtotal = cart.items.reduce(
    (s: number, i: any) => s + i.product.price * i.quantity,
    0,
  );
  const shipping = subtotal >= 500 ? 0 : 49;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal - (cart.coupon ? 0 : 0) + shipping + tax;

  const handleProceed = () => {
    startTransition(async () => {
      // Create the DB order record
      const result = await createOrder({ addressId, paymentMethod: method });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (method === "CASH_ON_DELIVERY") {
        onSuccess(result.orderId!);
        return;
      }

      if (method === "STRIPE") {
        const pi = await createStripePaymentIntent(result.orderId!);
        if (pi.error) {
          toast.error(pi.error);
          return;
        }
        setOrderId(result.orderId!);
        setClientSecret(pi.clientSecret!);
      }

      if (method === "RAZORPAY") {
        const rzp = await createRazorpayOrder(result.orderId!);
        if (rzp.error) {
          toast.error(rzp.error);
          return;
        }
        initiateRazorpay(
          result.orderId!,
          rzp.razorpayOrderId!,
          rzp.amount!,
          result.orderId!,
        );
      }
    });
  };

  const initiateRazorpay = (
    dbOrderId: string,
    rzpOrderId: string,
    amount: number,
    internalOrderId: string,
  ) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount,
      currency: "INR",
      name: "ShopAI",
      description: "Order Payment",
      order_id: rzpOrderId,
      handler: async (response: any) => {
        const verify = await fetch("/api/payments/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderId: internalOrderId,
          }),
        });

        const data = await verify.json();
        if (data.success) {
          onSuccess(internalOrderId);
        } else {
          toast.error("Payment verification failed. Contact support.");
        }
      },
      prefill: { name: "", email: "", contact: "" },
      theme: { color: "#6366f1" },
      modal: {
        ondismiss: () => toast.info("Payment cancelled"),
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  if (clientSecret && orderId) {
    return (
      <Elements
        stripe={stripePromise}
        options={{ clientSecret, appearance: { theme: "stripe" } }}
      >
        <StripePaymentForm
          orderId={orderId}
          onSuccess={onSuccess}
          onBack={() => setClientSecret(null)}
        />
      </Elements>
    );
  }

  return (
    <div className="bg-card border rounded-2xl p-6 space-y-6">
      {/* Add Razorpay script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <h2 className="text-xl font-bold flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" />
        Payment Method
      </h2>

      <RadioGroup
        value={method}
        onValueChange={(v) => setMethod(v as PaymentMethod)}
      >
        {[
          {
            value: "RAZORPAY",
            icon: Smartphone,
            label: "Razorpay",
            sub: "UPI, Cards, Net Banking, Wallets (India)",
            badge: "Recommended",
          },
          {
            value: "STRIPE",
            icon: CreditCard,
            label: "Credit / Debit Card",
            sub: "Visa, Mastercard, American Express",
          },
          {
            value: "CASH_ON_DELIVERY",
            icon: Truck,
            label: "Cash on Delivery",
            sub: "Pay when your order arrives",
          },
        ].map(({ value, icon: Icon, label, sub, badge }) => (
          <div
            key={value}
            className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
              method === value
                ? "border-primary bg-primary/5"
                : "hover:border-primary/50"
            }`}
            onClick={() => setMethod(value as PaymentMethod)}
          >
            <RadioGroupItem value={value} id={value} />
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={value} className="font-medium cursor-pointer">
                    {label}
                  </Label>
                  {badge && (
                    <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                      {badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            </div>
          </div>
        ))}
      </RadioGroup>

      {/* Security badge */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-xl p-3">
        <Lock className="h-4 w-4 text-green-500" />
        <span>
          Your payment information is secured with 256-bit SSL encryption
        </span>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          size="lg"
          className="rounded-xl"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Button
          size="lg"
          className="flex-1 rounded-xl"
          onClick={handleProceed}
          disabled={isPending}
        >
          {isPending
            ? "Processing..."
            : method === "CASH_ON_DELIVERY"
              ? "Place Order"
              : `Pay ₹${total.toLocaleString()}`}
        </Button>
      </div>
    </div>
  );
}

// Stripe Payment Form (renders inside <Elements>)
function StripePaymentForm({
  orderId,
  onSuccess,
  onBack,
}: {
  orderId: string;
  onSuccess: (id: string) => void;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message ?? "An error occurred");
      setIsLoading(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${orderId}`,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message ?? "Payment failed");
      setIsLoading(false);
    } else {
      onSuccess(orderId);
    }
  };

  return (
    <div className="bg-card border rounded-2xl p-6 space-y-6">
      <h2 className="text-xl font-bold">Enter Card Details</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <PaymentElement />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="rounded-xl"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Button
            type="submit"
            size="lg"
            className="flex-1 rounded-xl"
            disabled={isLoading || !stripe}
          >
            {isLoading ? "Processing..." : "Confirm Payment"}
          </Button>
        </div>
      </form>
    </div>
  );
}
