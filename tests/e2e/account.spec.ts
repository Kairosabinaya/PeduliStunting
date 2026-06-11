import { expect, test } from "@playwright/test";

/**
 * Authenticated-user journeys (display profile, edit name, sign out) live
 * behind Supabase auth and require a seeded test user, which is not yet part
 * of the e2e fixture stack. The tests below cover the anonymous-guard
 * contract and layout invariants that we *can* assert deterministically
 * without a session.
 */
test.describe("/account (anonymous)", () => {
  test("redirects anonymous visitors to sign-in", async ({ page }) => {
    await page.goto("/account");
    await expect(page).toHaveURL(/\/auth\/sign-in/);
    await expect(
      page.getByRole("heading", {
        name: /lanjutkan pemantauan anak/i,
        level: 1,
      }),
    ).toBeVisible();
  });

  test("redirect lands on a layout with no horizontal overflow", async ({
    page,
  }) => {
    for (const width of [360, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/account");
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(
        overflow,
        `/account redirect at viewport ${String(width)}px must not overflow horizontally`,
      ).toBeLessThanOrEqual(1);
    }
  });
});
