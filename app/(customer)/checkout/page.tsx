// app/(customer)/checkout/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getCartWithItems } from "@/actions/cart.actions";
import { CheckoutFlow } from "@/components/checkout/checkout-flow";
import { prisma } from "@/lib/db/prisma";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in?redirect=/checkout");

  const cart = await getCartWithItems();
  if (!cart || cart.items.length === 0) redirect("/cart");

  const user = await prisma.user.findUnique({
    where: { clerkId },
    include: { addresses: true },
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <CheckoutFlow cart={cart} addresses={user?.addresses ?? []} />
    </div>
  );
}
