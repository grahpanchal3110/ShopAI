// e2e/homepage.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("renders hero section and featured products", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ShopAI/);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(
      page.locator('[data-testid="featured-products"]'),
    ).toBeVisible();
  });

  test("search bar is functional", async ({ page }) => {
    await page.goto("/");
    const searchBar = page.locator('input[placeholder*="Search"]');
    await searchBar.fill("iPhone");
    await expect(
      page.locator('[data-testid="search-suggestions"]'),
    ).toBeVisible({ timeout: 3000 });
  });

  test("dark mode toggle works", async ({ page }) => {
    await page.goto("/");
    const toggle = page.locator('[aria-label="Toggle theme"]');
    await toggle.click();
    await expect(page.locator("html")).toHaveAttribute("class", /dark/);
  });
});
