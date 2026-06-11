import { expect, test } from "@playwright/test";

test.describe("auth flows (anonymous)", () => {
  test("sign-in renders branded layout, email + password fields, OAuth, and reset link", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/auth/sign-in");

    await expect(
      page.getByRole("heading", {
        name: /lanjutkan pemantauan anak/i,
        level: 1,
      }),
    ).toBeVisible();
    await expect(
      page.getByText(/masuk untuk melihat tracker anak/i),
    ).toBeVisible();
    await expect(page.getByLabel(/^email\b/i)).toBeVisible();
    await expect(page.getByLabel(/^kata sandi\b/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /^masuk$/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /lanjutkan dengan google/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /lupa kata sandi/i }),
    ).toBeVisible();
    // Brand panel only rendered at lg+ (desktop viewport). The aside is the
    // page's only complementary landmark (it carries no accessible name).
    await expect(page.getByRole("complementary")).toBeVisible();
  });

  test("submitting an empty sign-in form surfaces inline validation", async ({
    page,
  }) => {
    await page.goto("/auth/sign-in");

    const emailField = page.getByLabel(/^email\b/i);
    await emailField.fill("not-an-email");
    await page.getByRole("button", { name: /^masuk$/i }).click();

    await expect(emailField).toHaveAttribute("aria-invalid", "true");
  });

  test("sign-in surfaces friendly query-string errors", async ({ page }) => {
    await page.goto("/auth/sign-in?error=callback_failed");

    // `.filter({ hasText })` skips Next's empty route-announcer, which also
    // carries role="alert" and would trip Playwright strict mode.
    await expect(
      page.getByRole("alert").filter({ hasText: /\S/ }),
    ).toContainText(/sesi/i);
  });

  test("forgot-password link navigates to reset request flow", async ({
    page,
  }) => {
    await page.goto("/auth/sign-in");
    await page.getByRole("link", { name: /lupa kata sandi/i }).click();
    await expect(page).toHaveURL(/\/auth\/reset-password$/);
    await expect(
      page.getByRole("heading", { name: /atur ulang kata sandi/i, level: 1 }),
    ).toBeVisible();
    await expect(page.getByLabel(/^email\b/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /kirim tautan reset/i }),
    ).toBeVisible();
  });

  test("sign-up renders the full registration form", async ({ page }) => {
    await page.goto("/auth/sign-up");

    await expect(
      page.getByRole("heading", {
        name: /mulai pantau anak dengan lebih mudah/i,
        level: 1,
      }),
    ).toBeVisible();
    await expect(page.getByText(/buat akun gratis/i).first()).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: /tahap pendaftaran/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/^foto profil$/i)).toBeVisible();
    await expect(page.getByLabel(/nama tampilan/i)).toBeVisible();
    await expect(page.getByLabel(/^email\b/i)).toBeVisible();
    await expect(page.getByLabel(/^kata sandi\b/i)).toBeVisible();
    await expect(page.getByLabel(/konfirmasi kata sandi/i)).toBeVisible();
    await expect(
      page.getByRole("group", { name: /kekuatan kata sandi/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /^daftar$/i })).toBeVisible();
  });

  test("password strength updates as the user types", async ({ page }) => {
    await page.goto("/auth/sign-up");

    const passwordField = page.getByLabel(/^kata sandi\b/i);
    const strength = page.getByRole("group", {
      name: /kekuatan kata sandi/i,
    });

    await passwordField.fill("abc");
    await expect(strength).toContainText(/lemah/i);

    // Length 8 plus two character classes scores "fair" on the heuristic
    // (length alone stays "weak").
    await passwordField.fill("abcdefg1");
    await expect(strength).toContainText(/cukup/i);

    await passwordField.fill("abcdEFGH12!@");
    await expect(strength).toContainText(/kuat/i);
  });

  test("confirm password shows a live mismatch hint", async ({ page }) => {
    await page.goto("/auth/sign-up");

    await page.getByLabel(/^kata sandi\b/i).fill("password1");
    await page.getByLabel(/konfirmasi kata sandi/i).fill("different");

    await expect(
      page.getByText(/konfirmasi kata sandi tidak sama/i),
    ).toBeVisible();
  });

  test("auth pages have no horizontal overflow at common breakpoints", async ({
    page,
  }) => {
    for (const path of [
      "/auth/sign-in",
      "/auth/sign-up",
      "/auth/reset-password",
    ]) {
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
          `${path} at viewport ${width}px must not overflow horizontally`,
        ).toBeLessThanOrEqual(1);
      }
    }
  });
});
