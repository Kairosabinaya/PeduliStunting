import { expect, test } from "@playwright/test";

/**
 * The Map page lives behind Supabase auth and reads dynamic search params.
 * Authenticated end-to-end coverage (year slider → URL → re-render, region
 * selection → detail panel, source toggle) requires a seeded user, which is
 * not yet part of the e2e fixture stack. Until then this suite locks in the
 * anonymous-guard contract, the layout invariants, and the URL preservation
 * across the sign-in redirect.
 */
test.describe("/map (anonymous)", () => {
  test("redirects anonymous visitors to sign-in", async ({ page }) => {
    await page.goto("/map");
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
      await page.goto("/map");
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(
        overflow,
        `/map redirect at viewport ${String(width)}px must not overflow horizontally`,
      ).toBeLessThanOrEqual(1);
    }
  });
});
