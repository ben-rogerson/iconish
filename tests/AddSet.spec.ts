import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("icon sets can be added", async ({ page }) => {
  await expect(page.getByRole("article", { name: "Icon set" })).toHaveCount(1);

  await page.getByRole("button", { name: "Add a set" }).click();
  await expect(page.getByRole("article", { name: "Icon set" })).toHaveCount(2);
});

test("icons sets can be removed", async ({ page }) => {
  const iconSet = page.getByRole("article", { name: "Icon set" });
  await expect(iconSet).toHaveCount(1);

  await iconSet.getByRole("button", { name: "More options" }).click();
  await page.getByRole("menuitem", { name: /Delete set/i }).click();

  // Verify a new set isn't created (min 1 set)
  await expect(iconSet).toHaveCount(1);

  await expect(
    page.getByRole("region", {
      name: "Notifications (F8)",
    })
  ).toContainText("Add another set first");
});

// should display the new svg in the set
