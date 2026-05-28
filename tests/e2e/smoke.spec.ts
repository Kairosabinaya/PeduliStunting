import { expect, test } from "@playwright/test";

test.describe("public landing", () => {
  test("renders the hero, brand pillars, and CTA banner", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Peduli Stunting",
    );

    const main = page.locator("#main");
    await expect(
      main.getByRole("heading", { name: /empat alat/i }),
    ).toBeVisible();
    await expect(
      main.getByRole("heading", { name: /peta nasional/i }),
    ).toBeVisible();
    await expect(
      main.getByRole("heading", {
        name: /1\.000 hari yang mengubah segalanya/i,
      }),
    ).toBeVisible();
    await expect(
      main.getByRole("heading", { name: /tracker pertumbuhan/i }),
    ).toBeVisible();
    await expect(
      main.getByRole("heading", { name: /dashboard model/i }),
    ).toBeVisible();
  });

  test("primary CTA navigates to sign-up", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /daftar gratis/i }).click();
    await expect(page).toHaveURL(/\/auth\/sign-up$/);
  });

  test("secondary CTA navigates to sign-in", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /saya sudah punya akun/i }).click();
    await expect(page).toHaveURL(/\/auth\/sign-in$/);
  });

  test("layout has no horizontal overflow at common breakpoints", async ({
    page,
  }) => {
    for (const width of [360, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(
        overflow,
        `viewport ${width}px must not overflow horizontally`,
      ).toBeLessThanOrEqual(1);
    }
  });
});
