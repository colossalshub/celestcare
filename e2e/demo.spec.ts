import { expect, test } from "@playwright/test";

test("demo journey persists a completed step and theme", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Explore the demo shelf" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Demo shelf" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Morning", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Evening", exact: true })).toBeVisible();
  if (test.info().project.name === "desktop") {
    await page.screenshot({ path: "test-results/today-desktop-dark.png", fullPage: true });
  }
  if (test.info().project.name === "mobile") {
    await page.screenshot({ path: "test-results/today-mobile-dark.png", fullPage: true });
  }
  await expect(page.getByText(/illustrative/i).first()).toBeVisible();

  await page.getByRole("link", { name: "Shelf" }).first().click();
  await page.waitForURL("**/shelf");
  await page.getByRole("link", { name: "Harbor Mineral Screen" }).click();
  await page.waitForURL("**/shelf/harbor");
  await expect(page.getByRole("heading", { level: 1, name: "Harbor Mineral Screen" })).toBeVisible();
  await expect(page.getByText(/Illustrative demo formula/).first()).toBeVisible();

  await page.getByRole("link", { name: "Zinc oxide" }).click();
  await expect(page.getByRole("heading", { name: "Zinc oxide" })).toBeVisible();
  await expect(page.getByText(/SPF 30 or higher/)).toBeVisible();

  await page.goto("/routine");
  await expect(page.getByRole("heading", { name: "Morning", exact: true })).toBeVisible();
  const done = page.getByRole("button", { name: "Mark done" }).first();
  await done.click();
  await expect(page.getByRole("button", { name: "Done" }).first()).toBeVisible();

  await page.goto("/compatibility");
  await page.getByRole("button", { name: /Sample Adapalene Gel/ }).first().click();
  await expect(page.getByText(/label|irritat|caution/i).first()).toBeVisible();

  await page.getByRole("button", { name: /theme/i }).click();
  await expect(page.getByRole("button", { name: /Light theme/i })).toBeVisible();
  await page.goto("/");
  if (test.info().project.name === "desktop") {
    await page.screenshot({ path: "test-results/today-desktop-light.png", fullPage: false });
  }

  await page.reload();
  await expect(page.getByRole("status").filter({ hasText: "Demo shelf" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Light theme/i })).toBeVisible();
  await page.goto("/routine");
  await expect(page.getByRole("button", { name: "Done" }).first()).toBeVisible();
});

test("add a product on the personal shelf", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("celestcare-db", "celestcare"));
  await page.reload();
  await page.goto("/shelf/new");
  await page.getByLabel("Name").fill("Plain Cream");
  await page.getByLabel("Brand").fill("Local");
  await page.getByLabel("Category").selectOption("moisturizer");
  await page.getByLabel("Ingredients, one per line or separated by commas").fill("Glycerin\nCeramide NP");
  await page.getByRole("button", { name: "Save product" }).click();
  await expect(page.getByRole("heading", { name: "Plain Cream" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Plain Cream" })).toBeVisible();
});
