import { describe, expect, it } from "vitest";

import {
  DISPLAY_NAME_MAX_LENGTH,
  DISPLAY_NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  RequestPasswordResetSchema,
  SignInSchema,
  SignUpSchema,
  UpdatePasswordSchema,
} from "./auth";

describe("SignInSchema", () => {
  it("accepts a well-formed email and any non-empty password", () => {
    const result = SignInSchema.safeParse({
      email: "user@example.com",
      password: "anything",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty email and password with field errors", () => {
    const result = SignInSchema.safeParse({ email: "", password: "" });
    expect(result.success).toBe(false);
    if (result.success) return;
    const { fieldErrors } = result.error.flatten();
    expect(fieldErrors.email?.[0]).toBeTruthy();
    expect(fieldErrors.password?.[0]).toBeTruthy();
  });

  it("rejects malformed emails", () => {
    const result = SignInSchema.safeParse({
      email: "not-an-email",
      password: "secret",
    });
    expect(result.success).toBe(false);
  });

  it("carries an optional redirectTo string", () => {
    const result = SignInSchema.safeParse({
      email: "user@example.com",
      password: "secret",
      redirectTo: "/map",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.redirectTo).toBe("/map");
  });
});

describe("SignUpSchema", () => {
  const valid = {
    email: "user@example.com",
    password: "secret-pass",
    confirmPassword: "secret-pass",
    displayName: "Budi",
  } as const;

  it("accepts a complete payload with matching passwords", () => {
    expect(SignUpSchema.safeParse(valid).success).toBe(true);
  });

  it("enforces the documented password minimum", () => {
    const short = "a".repeat(PASSWORD_MIN_LENGTH - 1);
    const result = SignUpSchema.safeParse({
      ...valid,
      password: short,
      confirmPassword: short,
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.flatten().fieldErrors.password?.[0]).toContain(
      String(PASSWORD_MIN_LENGTH),
    );
  });

  it("enforces the documented password maximum", () => {
    const long = "a".repeat(PASSWORD_MAX_LENGTH + 1);
    const result = SignUpSchema.safeParse({
      ...valid,
      password: long,
      confirmPassword: long,
    });
    expect(result.success).toBe(false);
  });

  it("flags mismatched confirmation on the confirmPassword path", () => {
    const result = SignUpSchema.safeParse({
      ...valid,
      confirmPassword: "different-pass",
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.flatten().fieldErrors.confirmPassword?.[0]).toBeTruthy();
  });

  it("enforces display-name bounds", () => {
    const tooShort = SignUpSchema.safeParse({
      ...valid,
      displayName: "a".repeat(DISPLAY_NAME_MIN_LENGTH - 1),
    });
    const tooLong = SignUpSchema.safeParse({
      ...valid,
      displayName: "a".repeat(DISPLAY_NAME_MAX_LENGTH + 1),
    });
    expect(tooShort.success).toBe(false);
    expect(tooLong.success).toBe(false);
  });
});

describe("RequestPasswordResetSchema", () => {
  it("requires a valid email", () => {
    expect(
      RequestPasswordResetSchema.safeParse({ email: "user@example.com" })
        .success,
    ).toBe(true);
    expect(RequestPasswordResetSchema.safeParse({ email: "" }).success).toBe(
      false,
    );
    expect(
      RequestPasswordResetSchema.safeParse({ email: "bad" }).success,
    ).toBe(false);
  });
});

describe("UpdatePasswordSchema", () => {
  it("requires matching passwords with the documented minimum length", () => {
    const ok = UpdatePasswordSchema.safeParse({
      password: "supersecret",
      confirmPassword: "supersecret",
    });
    expect(ok.success).toBe(true);

    const mismatch = UpdatePasswordSchema.safeParse({
      password: "supersecret",
      confirmPassword: "different-pass",
    });
    expect(mismatch.success).toBe(false);

    const tooShort = UpdatePasswordSchema.safeParse({
      password: "a",
      confirmPassword: "a",
    });
    expect(tooShort.success).toBe(false);
  });
});
