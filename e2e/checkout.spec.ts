// e2e/checkout.spec.ts
import { test, expect, Page } from "@playwright/test";

async function addProductToCart(page: Page) {
  await page.goto("/products");
  await page.locator('[data-testid="product-card"]').first().hover();
  await page.locator('button:has-text("Add to Cart")').first().click();
}

test.describe("Checkout Flow", () => {
  test.use({ storageState: "e2e/.auth/user.json" }); // pre-authenticated state

  test("complete COD checkout", async ({ page }) => {
    await addProductToCart(page);

    // Verify cart sheet opened
    await expect(page.locator('[data-testid="cart-sheet"]')).toBeVisible();

    // Proceed to checkout
    await page.locator('a:has-text("Proceed to Checkout")').click();
    await expect(page).toHaveURL(/\/checkout/);

    // Select existing address
    await page.locator('[data-testid="address-radio"]').first().click();
    await page.locator('button:has-text("Continue to Payment")').click();

    // Select COD
    await page.locator('label:has-text("Cash on Delivery")').click();
    await page.locator('button:has-text("Place Order")').click();

    // Verify success
    await expect(page.locator("text=Order Placed Successfully")).toBeVisible({
      timeout: 10000,
    });
    await expect(page).toHaveURL(/\/checkout/);
  });

  test("cart persists on page reload", async ({ page }) => {
    await addProductToCart(page);
    await page.reload();

    const cartIcon = page.locator('[data-testid="cart-count"]');
    await expect(cartIcon).toHaveText(/[1-9]/);
  });
});
