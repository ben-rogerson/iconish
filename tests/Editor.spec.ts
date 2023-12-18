import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("should have a preview area and not a code editor by default", async ({
  page,
}) => {
  await expect(page.getByRole("article", { name: "preview" })).toHaveCount(1);
  await expect(page.getByRole("article", { name: "editor" })).toHaveCount(0);
});

test("should add an editor after clicking the add buttons", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Add SVG" }).first().click();

  await expect(page.getByRole("article", { name: "preview" })).toHaveCount(2);

  await page.getByRole("button", { name: "Add SVG" }).last().click();

  await expect(page.getByRole("article", { name: "preview" })).toHaveCount(3);
});

test("should remove an editor after clicking the remove button", async ({
  page,
}) => {
  const preview = page.getByRole("article", { name: "preview" }).first();

  await preview.hover(); // Hover to reveal the remove button
  await preview.getByLabel("Remove editor").click();

  await expect(page.getByRole("article", { name: "editor" })).toHaveCount(0);
});

test("a svg can be added via paste", async ({ page }) => {
  const icon = '<svg><circle cx="50" cy="50" r="40"/></svg>';

  const preview = page.getByRole("article", { name: "preview" }).first();
  await preview.getByPlaceholder("Untitled icon…").fill("My test icon");

  const input = preview.getByPlaceholder("Paste a <svg> here…");
  await input.fill(icon);
  await input.press("Enter");

  await expect(page.getByRole("article", { name: "preview" })).toHaveCount(0);
  await expect(page.getByRole("article", { name: "editor" })).toHaveCount(1);
  await expect(
    page
      .getByRole("article", { name: "editor" })
      .getByPlaceholder("Untitled icon…")
  ).toHaveValue("My test icon");
});

test("a svg can be added via the test buttons", async ({ page }) => {
  await page
    .getByRole("article", { name: "preview" })
    .first()
    .getByRole("button", { name: "Bug" })
    .first()
    .click();

  await expect(page.getByRole("article", { name: "editor" })).toHaveCount(1);
});
