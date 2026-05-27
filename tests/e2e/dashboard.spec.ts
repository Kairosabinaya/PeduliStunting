import { expect, test } from "@playwright/test";

/**
 * The Dashboard route lives behind Supabase auth. Without a seeded session the
 * end-to-end suite can only assert the guard + responsive contract, mirroring
 * the approach used for `/map`. Coverage for the metric tiles, comparison
 * table, Moran's I bars, and what-if simulator is provided by the component
 * tests in src/components/features/dashboard/*.test.tsx and the use-case +
 * schema units further down the stack.
 */
test.describe("/dashboard (anonymous)", () => {
  test("redirects anonymous visitors to sign-in", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth\/sign-in/);
    await expect(
      page.getByRole("heading", { name: /masuk ke akun anda/i, level: 1 }),
    ).toBeVisible();
  });

  test("redirect lands on a layout with no horizontal overflow", async ({
    page,
  }) => {
    for (const width of [360, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/dashboard");
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(
        overflow,
        `/dashboard redirect at viewport ${String(width)}px must not overflow horizontally`,
      ).toBeLessThanOrEqual(1);
    }
  });
});
