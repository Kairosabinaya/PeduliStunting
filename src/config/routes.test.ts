import { describe, expect, it } from "vitest";

import { isApiRoute, isPublicRoute } from "./routes";

describe("isApiRoute", () => {
  it("recognises Route Handler paths under /api/", () => {
    expect(isApiRoute("/api/tracker/cek-cepat")).toBe(true);
    expect(isApiRoute("/api/health")).toBe(true);
  });

  it("does not treat page routes as API routes", () => {
    expect(isApiRoute("/tracker")).toBe(false);
    expect(isApiRoute("/")).toBe(false);
    expect(isApiRoute("/apidocs")).toBe(false);
  });
});

describe("Cek Cepat endpoint gating", () => {
  it("stays gated (proxy must not pass it through as public)", () => {
    // The endpoint reads RLS-protected WHO standards, so it requires auth.
    // Being an API route, an unauthenticated hit must yield a JSON 401 from the
    // proxy rather than an HTML sign-in redirect that breaks `response.json()`.
    expect(isPublicRoute("/api/tracker/cek-cepat")).toBe(false);
    expect(isApiRoute("/api/tracker/cek-cepat")).toBe(true);
  });
});
