import { describe, expect, it } from "vitest";

import { AppErrors } from "@/domain/errors/app-error";

import { mapAppErrorToUi } from "./error-mapping";

describe("mapAppErrorToUi", () => {
  it("maps rate_limit to a toast treatment", () => {
    expect(mapAppErrorToUi(AppErrors.rateLimit("x")).treatment).toBe("toast");
  });

  it("maps unauthorized to a sign-in redirect", () => {
    expect(mapAppErrorToUi(AppErrors.unauthorized()).treatment).toBe(
      "redirect-signin",
    );
  });

  it("maps external_service to a full error", () => {
    expect(
      mapAppErrorToUi(AppErrors.externalService("x", "gemini")).treatment,
    ).toBe("full");
  });

  it("carries the error message as the description", () => {
    expect(mapAppErrorToUi(AppErrors.validation("pesan")).description).toBe(
      "pesan",
    );
  });
});
