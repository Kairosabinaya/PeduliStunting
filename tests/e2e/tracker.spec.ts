import { expect, test } from "@playwright/test";

/**
 * Tracker journeys (list children, add child, log measurement, toggle
 * immunization/milestone) live behind Supabase auth and require a seeded test
 * user, which is not yet part of the e2e fixture stack. The tests below cover
 * the anonymous-guard contract and layout invariants that we can assert
 * deterministically without a session.
 */
const TRACKER_ROUTES = [
  "/tracker",
  "/tracker/anak/baru",
  "/tracker/anak/11111111-1111-1111-1111-111111111111",
  "/tracker/anak/11111111-1111-1111-1111-111111111111/pengukuran",
  "/tracker/anak/11111111-1111-1111-1111-111111111111/imunisasi",
  "/tracker/anak/11111111-1111-1111-1111-111111111111/perkembangan",
] as const;

test.describe("/tracker (anonymous)", () => {
  for (const route of TRACKER_ROUTES) {
    test(`redirects anonymous visitors from ${route} to sign-in`, async ({
      page,
    }) => {
      await page.goto(route);
      await expect(page).toHaveURL(/\/auth\/sign-in/);
      await expect(
        page.getByRole("heading", { name: /masuk ke akun anda/i, level: 1 }),
      ).toBeVisible();
    });
  }

  test("redirect lands on a layout with no horizontal overflow", async ({
    page,
  }) => {
    for (const width of [360, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/tracker");
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(
        overflow,
        `/tracker redirect at viewport ${String(width)}px must not overflow horizontally`,
      ).toBeLessThanOrEqual(1);
    }
  });
});
