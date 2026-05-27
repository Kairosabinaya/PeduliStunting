import { AuthError } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { mapSupabaseAuthError } from "./supabase-auth-error";

describe("mapSupabaseAuthError", () => {
  it("maps invalid_credentials to unauthorized with a friendly message", () => {
    const err = new AuthError("Invalid login credentials", 400, "invalid_credentials");
    const mapped = mapSupabaseAuthError(err);
    expect(mapped.kind).toBe("unauthorized");
    expect(mapped.message).toMatch(/salah/i);
  });

  it("maps email_not_confirmed to unauthorized with a verification hint", () => {
    const err = new AuthError("Email not confirmed", 400, "email_not_confirmed");
    const mapped = mapSupabaseAuthError(err);
    expect(mapped.kind).toBe("unauthorized");
    expect(mapped.message).toMatch(/verifikasi/i);
  });

  it("maps user_already_exists to conflict", () => {
    const err = new AuthError("User exists", 422, "user_already_exists");
    const mapped = mapSupabaseAuthError(err);
    expect(mapped.kind).toBe("conflict");
  });

  it("maps weak_password to validation", () => {
    const err = new AuthError("Weak password", 422, "weak_password");
    const mapped = mapSupabaseAuthError(err);
    expect(mapped.kind).toBe("validation");
  });

  it("maps over_email_send_rate_limit to rate_limit", () => {
    const err = new AuthError(
      "Too many requests",
      429,
      "over_email_send_rate_limit",
    );
    const mapped = mapSupabaseAuthError(err);
    expect(mapped.kind).toBe("rate_limit");
  });

  it("falls back to HTTP status when the code is unknown", () => {
    const err = new AuthError("Some new code", 429, "definitely_new_code");
    const mapped = mapSupabaseAuthError(err);
    expect(mapped.kind).toBe("rate_limit");
  });

  it("falls back to unauthorized when neither code nor status are recognised", () => {
    const mapped = mapSupabaseAuthError({ foo: "bar" });
    expect(mapped.kind).toBe("unauthorized");
  });

  it("never leaks raw SDK strings to the user message", () => {
    const err = new AuthError("Internal raw msg", 500, "invalid_credentials");
    const mapped = mapSupabaseAuthError(err);
    expect(mapped.message).not.toContain("Internal raw msg");
  });
});
