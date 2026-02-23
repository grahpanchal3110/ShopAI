// __tests__/lib/cart.test.ts
import { useCartStore } from "@/store/cart-store";
import { act, renderHook } from "@testing-library/react";

describe("Cart Store", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] });
  });

  it("adds item to empty cart", () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        productId: "prod-1",
        name: "Test Product",
        price: 999,
        quantity: 1,
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].productId).toBe("prod-1");
    expect(result.current.itemCount).toBe(1);
    expect(result.current.total).toBe(999);
  });

  it("increments quantity for duplicate item", () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        productId: "prod-1",
        name: "Test",
        price: 100,
        quantity: 1,
      });
      result.current.addItem({
        productId: "prod-1",
        name: "Test",
        price: 100,
        quantity: 2,
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.total).toBe(300);
  });

  it("removes item from cart", () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        productId: "prod-1",
        name: "Test",
        price: 100,
        quantity: 1,
      });
      result.current.removeItem("prod-1");
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.total).toBe(0);
  });

  it("clears entire cart", () => {
    const { result } = renderHook(() => useCartStore());

    act(() => {
      result.current.addItem({
        productId: "prod-1",
        name: "Test",
        price: 100,
        quantity: 2,
      });
      result.current.addItem({
        productId: "prod-2",
        name: "Test 2",
        price: 200,
        quantity: 1,
      });
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
  });
});
