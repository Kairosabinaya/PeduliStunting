import { expect, test } from "@playwright/test";

/**
 * `/dashboard` is public (ADR-0018): anonymous visitors see the three-section
 * experience without signing in. The e2e suite asserts the public-access
 * contract + responsive layout; the data-driven detail (KPIs, charts, simulator
 * behaviour) is covered by the component tests in
 * src/components/features/dashboard/*.test.tsx and the use-case + schema units.
 */
test.describe("/dashboard (anonymous)", () => {
  test("is reachable without signing in", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(
      page.getByRole("heading", { name: /dashboard stunting/i, level: 1 }),
    ).toBeVisible();
    // The three sections are present.
    await expect(
      page.getByRole("heading", { name: /insight data stunting/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /penjelasan model/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /prediktor interaktif/i }),
    ).toBeVisible();
  });

  test("has no horizontal overflow at the reference widths", async ({
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
        `/dashboard at viewport ${String(width)}px must not overflow horizontally`,
      ).toBeLessThanOrEqual(1);
    }
  });
});
