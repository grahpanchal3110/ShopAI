// components/checkout/address-step.tsx
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, Plus } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { toast } from "sonner";

interface Props {
  addresses: any[];
  selectedId: string;
  onSelect: (id: string) => void;
  onNext: () => void;
}

export function AddressStep({
  addresses,
  selectedId,
  onSelect,
  onNext,
}: Props) {
  const [showForm, setShowForm] = useState(addresses.length === 0);
  const [isPending, startTransition] = useTransition();

  const handleSaveAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await fetch("/api/address", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(form)),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.error) toast.error(data.error);
      else {
        toast.success("Address saved!");
        setShowForm(false);
        onSelect(data.id);
        window.location.reload(); // refresh to show new address
      }
    });
  };

  return (
    <div className="bg-card border rounded-2xl p-6 space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        Delivery Address
      </h2>

      {addresses.length > 0 && !showForm && (
        <>
          <RadioGroup value={selectedId} onValueChange={onSelect}>
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="flex items-start gap-3 p-4 border rounded-xl cursor-pointer hover:border-primary transition-colors"
                onClick={() => onSelect(addr.id)}
              >
                <RadioGroupItem value={addr.id} id={addr.id} className="mt-1" />
                <label htmlFor={addr.id} className="cursor-pointer flex-1">
                  <p className="font-medium">{addr.name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {addr.line1}
                    {addr.line2 ? `, ${addr.line2}` : ""}
                    <br />
                    {addr.city}, {addr.state} – {addr.pincode}
                    <br />
                    📞 {addr.phone}
                  </p>
                  {addr.isDefault && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1 inline-block">
                      Default
                    </span>
                  )}
                </label>
              </div>
            ))}
          </RadioGroup>

          <Button
            variant="outline"
            onClick={() => setShowForm(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Add New Address
          </Button>
        </>
      )}

      {showForm && (
        <form onSubmit={handleSaveAddress} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" name="name" required placeholder="John Doe" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                name="phone"
                required
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="line1">Address Line 1 *</Label>
            <Input
              id="line1"
              name="line1"
              required
              placeholder="House no., Street, Area"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="line2">Address Line 2</Label>
            <Input id="line2" name="line2" placeholder="Landmark (optional)" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city">City *</Label>
              <Input id="city" name="city" required placeholder="Mumbai" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                name="state"
                required
                placeholder="Maharashtra"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                name="pincode"
                required
                placeholder="400001"
                maxLength={6}
              />
            </div>
          </div>

          <div className="flex gap-3">
            {addresses.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? "Saving..." : "Save Address"}
            </Button>
          </div>
        </form>
      )}

      {!showForm && selectedId && (
        <Button size="lg" className="w-full rounded-xl" onClick={onNext}>
          Continue to Payment
        </Button>
      )}
    </div>
  );
}
