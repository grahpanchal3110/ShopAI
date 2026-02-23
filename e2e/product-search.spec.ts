// e2e/product-search.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Product Search", () => {
  test("search returns relevant results", async ({ page }) => {
    await page.goto("/products");
    await page.locator('input[placeholder*="Search"]').fill("laptop");
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/search\?q=laptop/);
    await expect(
      page.locator('[data-testid="product-card"]').first(),
    ).toBeVisible();
  });

  test("visual search upload works", async ({ page }) => {
    await page.goto("/products/search");
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles("e2e/fixtures/test-product.jpg");
    await expect(
      page.locator("text=Searching for visually similar"),
    ).toBeVisible();
  });

  test("filters work correctly", async ({ page }) => {
    await page.goto("/products");
    await page.locator("text=Electronics").click();
    await expect(page).toHaveURL(/category=electronics/);
  });
});
