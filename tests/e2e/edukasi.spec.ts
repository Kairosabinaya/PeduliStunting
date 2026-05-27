import { expect, test } from "@playwright/test";

/**
 * The Edukasi list and detail routes live behind Supabase auth, so the
 * authenticated rendering (filters, search, pagination, markdown body) needs
 * a seeded user that is not yet part of the e2e fixture stack. Until then this
 * suite locks in the anonymous-guard contract and verifies the redirected
 * layout has no horizontal overflow at the reference breakpoints.
 */
test.describe("/edukasi (anonymous)", () => {
  test("redirects anonymous visitors to sign-in", async ({ page }) => {
    await page.goto("/edukasi");
    await expect(page).toHaveURL(/\/auth\/sign-in/);
    await expect(
      page.getByRole("heading", { name: /masuk ke akun anda/i, level: 1 }),
    ).toBeVisible();
  });

  test("redirects anonymous visitors away from the detail route", async ({
    page,
  }) => {
    await page.goto("/edukasi/asi-eksklusif-6-bulan");
    await expect(page).toHaveURL(/\/auth\/sign-in/);
  });

  test("redirect lands on a layout with no horizontal overflow", async ({
    page,
  }) => {
    for (const width of [360, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/edukasi");
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(
        overflow,
        `/edukasi redirect at viewport ${String(width)}px must not overflow horizontally`,
      ).toBeLessThanOrEqual(1);
    }
  });
});
