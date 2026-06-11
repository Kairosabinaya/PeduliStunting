import { expect, test } from "@playwright/test";

/**
 * The dashboard is split into two public routes: `/data` (Potret Stunting) and
 * `/prediksi` (simulator + cara kerja model). Both are reachable signed-out;
 * `/dashboard` redirects to `/data`. This suite asserts the public-access +
 * redirect contract and responsive layout. Data-driven detail (KPIs, charts,
 * simulator) is covered by component + use-case unit tests.
 */
test.describe("dashboard routes (anonymous)", () => {
  test("/data is reachable without signing in", async ({ page }) => {
    await page.goto("/data");
    await expect(page).toHaveURL(/\/data$/);
    await expect(
      page.getByRole("heading", {
        name: /stunting indonesia dalam angka/i,
        level: 1,
      }),
    ).toBeVisible();
  });

  test("/prediksi is reachable and shows the model explanation", async ({
    page,
  }) => {
    await page.goto("/prediksi");
    await expect(page).toHaveURL(/\/prediksi$/);
    await expect(
      page.getByRole("heading", {
        name: /simulasi risiko stunting/i,
        level: 1,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /tentang model prediksi/i }),
    ).toBeVisible();
  });

  test("/dashboard redirects to /data", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/data$/);
  });

  for (const path of ["/data", "/prediksi"]) {
    test(`${path} has no horizontal overflow at the reference widths`, async ({
      page,
    }) => {
      for (const width of [360, 768, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(
          overflow,
          `${path} at viewport ${String(width)}px must not overflow horizontally`,
        ).toBeLessThanOrEqual(1);
      }
    });
  }
});
