import { expect, test } from "@playwright/test";

test.describe("public landing", () => {
  test("renders the hero, scroll-story acts, and closing CTAs", async ({
    page,
  }) => {
    await page.goto("/");

    // Scroll-story hero headline ("1 dari 5 balita Indonesia mengalami
    // stunting."), word-split into spans — match on the stable keyword.
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /stunting/i,
    );

    await expect(
      page.getByRole("heading", { name: /otak bayi terbentuk/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /stunting tidak tersebar/i }),
    ).toBeVisible();
    // Closing band CTAs route to the map and the tracker.
    await expect(
      page.getByRole("link", { name: /pelajari peta nasional/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /mulai pantau anak/i }),
    ).toBeVisible();
  });

  test("header CTA navigates to sign-up", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /^daftar$/i }).click();
    await expect(page).toHaveURL(/\/auth\/sign-up$/);
  });

  test("closing CTA navigates to the national map", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /pelajari peta nasional/i }).click();
    await expect(page).toHaveURL(/\/map$/);
  });

  test("layout has no horizontal overflow at common breakpoints", async ({
    page,
  }) => {
    for (const width of [360, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      // Poll: a one-shot read raced entrance animations / streamed chunks
      // and flaked. The page must settle to zero horizontal overflow.
      await expect
        .poll(
          () =>
            page.evaluate(
              () =>
                document.documentElement.scrollWidth -
                document.documentElement.clientWidth,
            ),
          { message: `viewport ${width}px must not overflow horizontally` },
        )
        .toBeLessThanOrEqual(1);
    }
  });
});
