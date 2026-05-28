import { expect, test } from "@playwright/test";

test.describe("auth flows (anonymous)", () => {
  test("sign-in renders branded layout, email + password fields, OAuth, and reset link", async ({
    page,
  }) => {
    await page.goto("/auth/sign-in");

    await expect(
      page.getByRole("heading", { name: /masuk ke akun anda/i, level: 1 }),
    ).toBeVisible();
    await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Kata sandi", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /^masuk$/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /lanjutkan dengan google/i }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: /lupa kata sandi/i }),
    ).toBeVisible();
  });

  test("submitting an empty sign-in form surfaces inline validation", async ({
    page,
  }) => {
    await page.goto("/auth/sign-in");

    const emailField = page.getByLabel("Email", { exact: true });
    await emailField.fill("not-an-email");
    await page.getByRole("button", { name: /^masuk$/i }).click();

    await expect(emailField).toHaveAttribute("aria-invalid", "true");
  });

  test("sign-in surfaces friendly query-string errors", async ({ page }) => {
    await page.goto("/auth/sign-in?error=callback_failed");

    await expect(page.getByRole("alert")).toContainText(/sesi/i);
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
    await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /kirim tautan reset/i }),
    ).toBeVisible();
  });

  test("sign-up renders the full registration form", async ({ page }) => {
    await page.goto("/auth/sign-up");

    await expect(
      page.getByRole("heading", { name: /buat akun baru/i, level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: /tahap pendaftaran/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/^foto profil$/i)).toBeVisible();
    await expect(page.getByLabel(/nama tampilan/i)).toBeVisible();
    await expect(page.getByLabel("Email", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Kata sandi", { exact: true })).toBeVisible();
    await expect(page.getByLabel(/konfirmasi kata sandi/i)).toBeVisible();
    await expect(
      page.getByRole("group", { name: /kekuatan kata sandi/i }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /^daftar$/i })).toBeVisible();
  });

  test("password strength updates as the user types", async ({ page }) => {
    await page.goto("/auth/sign-up");

    const passwordField = page.getByLabel("Kata sandi", { exact: true });
    const strength = page.getByRole("group", {
      name: /kekuatan kata sandi/i,
    });

    await passwordField.fill("abc");
    await expect(strength).toContainText(/lemah/i);

    await passwordField.fill("abcdefgh");
    await expect(strength).toContainText(/cukup/i);

    await passwordField.fill("abcdEFGH12!@");
    await expect(strength).toContainText(/kuat/i);
  });

  test("confirm password shows a live mismatch hint", async ({ page }) => {
    await page.goto("/auth/sign-up");

    await page.getByLabel("Kata sandi", { exact: true }).fill("password1");
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
