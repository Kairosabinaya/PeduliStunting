import { expect, test } from "@playwright/test";

/**
 * `/map` is public (ADR-0018): anonymous visitors reach the interactive
 * choropleth without signing in. Authenticated-only flows (year slider → URL →
 * re-render, region selection → detail panel, source toggle) still need a
 * seeded user and are covered by component/unit tests. This suite locks in the
 * public-access contract and the responsive layout invariants.
 */
test.describe("/map (anonymous)", () => {
  test("is reachable without signing in", async ({ page }) => {
    await page.goto("/map");
    await expect(page).toHaveURL(/\/map$/);
    await expect(page).not.toHaveURL(/\/auth\/sign-in/);
  });

  test("has no horizontal overflow at the reference widths", async ({
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
        `/map at viewport ${String(width)}px must not overflow horizontally`,
      ).toBeLessThanOrEqual(1);
    }
  });
});
