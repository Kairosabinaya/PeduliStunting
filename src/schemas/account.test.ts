import { describe, expect, it } from "vitest";

import {
  DISPLAY_NAME_MAX_LENGTH,
  displayNameSchema,
  inputLocaleSchema,
  themePreferenceSchema,
  updateProfilePreferencesInputSchema,
  userRoleSchema,
} from "./account";

describe("userRoleSchema", () => {
  it("accepts the documented roles", () => {
    expect(userRoleSchema.safeParse("user").success).toBe(true);
    expect(userRoleSchema.safeParse("admin").success).toBe(true);
  });

  it("rejects unknown roles", () => {
    expect(userRoleSchema.safeParse("superuser").success).toBe(false);
  });
});

describe("themePreferenceSchema", () => {
  it("accepts system, light, and dark", () => {
    for (const value of ["system", "light", "dark"]) {
      expect(themePreferenceSchema.safeParse(value).success).toBe(true);
    }
  });

  it("rejects other values", () => {
    expect(themePreferenceSchema.safeParse("auto").success).toBe(false);
  });
});

describe("inputLocaleSchema", () => {
  it("accepts the configured locale", () => {
    expect(inputLocaleSchema.safeParse("id-ID").success).toBe(true);
  });

  it("rejects an unsupported locale", () => {
    expect(inputLocaleSchema.safeParse("en-US").success).toBe(false);
  });
});

describe("displayNameSchema", () => {
  it("trims and accepts a regular name", () => {
    const result = displayNameSchema.safeParse("  Bunda Aira  ");
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBe("Bunda Aira");
  });

  it("treats an empty string (or whitespace) as null", () => {
    const empty = displayNameSchema.safeParse("");
    const blank = displayNameSchema.safeParse("   ");
    expect(empty.success).toBe(true);
    expect(blank.success).toBe(true);
    if (empty.success) expect(empty.data).toBeNull();
    if (blank.success) expect(blank.data).toBeNull();
  });

  it("accepts an explicit null", () => {
    const result = displayNameSchema.safeParse(null);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toBeNull();
  });

  it("rejects values exceeding the documented max length", () => {
    const result = displayNameSchema.safeParse(
      "a".repeat(DISPLAY_NAME_MAX_LENGTH + 1),
    );
    expect(result.success).toBe(false);
  });
});

describe("updateProfilePreferencesInputSchema", () => {
  const valid = {
    displayName: "Bunda Aira",
    themePreference: "system" as const,
    locale: "id-ID" as const,
  };

  it("accepts a fully valid payload", () => {
    expect(updateProfilePreferencesInputSchema.safeParse(valid).success).toBe(
      true,
    );
  });

  it("allows displayName to be null", () => {
    const result = updateProfilePreferencesInputSchema.safeParse({
      ...valid,
      displayName: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown theme", () => {
    const result = updateProfilePreferencesInputSchema.safeParse({
      ...valid,
      themePreference: "auto",
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(
      result.error.flatten().fieldErrors.themePreference?.[0],
    ).toBeTruthy();
  });

  it("rejects an unsupported locale", () => {
    const result = updateProfilePreferencesInputSchema.safeParse({
      ...valid,
      locale: "fr-FR",
    });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.flatten().fieldErrors.locale?.[0]).toBeTruthy();
  });

  it("rejects extra (unknown) fields via .strict()", () => {
    const result = updateProfilePreferencesInputSchema.safeParse({
      ...valid,
      role: "admin",
    });
    expect(result.success).toBe(false);
  });
});
