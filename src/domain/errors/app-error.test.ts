import { describe, expect, it } from "vitest";
import { AppErrors, appErrorToHttpStatus } from "./app-error";

describe("AppErrors factories", () => {
  it("builds a validation error with field errors when supplied", () => {
    const error = AppErrors.validation("invalid input", {
      email: ["wajib diisi"],
    });
    expect(error.kind).toBe("validation");
    expect(error.fieldErrors).toEqual({ email: ["wajib diisi"] });
  });

  it("omits fieldErrors key when not provided", () => {
    const error = AppErrors.validation("invalid input");
    expect("fieldErrors" in error).toBe(false);
  });

  it("provides Indonesian default messages for auth errors", () => {
    expect(AppErrors.unauthorized().message).toContain("masuk");
    expect(AppErrors.forbidden().message).toContain("akses");
  });

  it("attaches retryAfterSeconds only when provided", () => {
    const withRetry = AppErrors.rateLimit("slow down", 30);
    expect(withRetry.retryAfterSeconds).toBe(30);
    const withoutRetry = AppErrors.rateLimit("slow down");
    expect("retryAfterSeconds" in withoutRetry).toBe(false);
  });

  it("attaches service and cause to external service errors when provided", () => {
    const error = AppErrors.externalService("upstream down", "supabase", {
      detail: "x",
    });
    expect(error.service).toBe("supabase");
    expect(error.cause).toEqual({ detail: "x" });
  });
});

describe("appErrorToHttpStatus", () => {
  it.each([
    ["validation", 400],
    ["unauthorized", 401],
    ["forbidden", 403],
    ["not_found", 404],
    ["conflict", 409],
    ["rate_limit", 429],
    ["external_service", 502],
    ["unexpected", 500],
  ] as const)("maps %s to HTTP %d", (kind, status) => {
    expect(
      appErrorToHttpStatus({ kind, message: "x" } as Parameters<
        typeof appErrorToHttpStatus
      >[0]),
    ).toBe(status);
  });
});
