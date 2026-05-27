import { describe, expect, it } from "vitest";
import {
  err,
  flatMap,
  fromPromise,
  fromThrowable,
  isErr,
  isOk,
  map,
  mapErr,
  ok,
  type Result,
} from "./result";

describe("Result", () => {
  describe("ok / err / isOk / isErr", () => {
    it("constructs a success and narrows via isOk", () => {
      const result: Result<number, string> = ok(42);
      expect(isOk(result)).toBe(true);
      expect(isErr(result)).toBe(false);
      if (isOk(result)) {
        expect(result.value).toBe(42);
      }
    });

    it("constructs a failure and narrows via isErr", () => {
      const result: Result<number, string> = err("boom");
      expect(isOk(result)).toBe(false);
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBe("boom");
      }
    });
  });

  describe("map", () => {
    it("transforms the success branch", () => {
      const result = map(ok<number>(2), (n) => n * 3);
      expect(result).toEqual({ ok: true, value: 6 });
    });

    it("leaves a failure untouched", () => {
      const result = map(err<string>("nope"), (n: number) => n * 3);
      expect(result).toEqual({ ok: false, error: "nope" });
    });
  });

  describe("flatMap", () => {
    it("chains a Result-returning function on success", () => {
      const parsed = flatMap(ok("5"), (s) =>
        Number.isNaN(Number(s)) ? err("nan") : ok(Number(s)),
      );
      expect(parsed).toEqual({ ok: true, value: 5 });
    });

    it("propagates the original failure", () => {
      const parsed = flatMap(err<string>("upstream"), (s: string) => ok(s));
      expect(parsed).toEqual({ ok: false, error: "upstream" });
    });
  });

  describe("mapErr", () => {
    it("transforms the failure branch only", () => {
      const original: Result<number, string> = err("low");
      const upgraded = mapErr(original, (e) => ({ code: e.toUpperCase() }));
      expect(upgraded).toEqual({ ok: false, error: { code: "LOW" } });
    });
  });

  describe("fromThrowable", () => {
    it("captures a successful return value", () => {
      const result = fromThrowable(
        () => JSON.parse('{"a":1}') as { a: number },
        () => "parse-error",
      );
      expect(result).toEqual({ ok: true, value: { a: 1 } });
    });

    it("converts a thrown error into a domain error", () => {
      const result = fromThrowable(
        () => JSON.parse("not json") as unknown,
        (cause) => `bad-json:${(cause as Error).name}`,
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toMatch(/^bad-json:/);
      }
    });
  });

  describe("fromPromise", () => {
    it("captures a resolved promise", async () => {
      const result = await fromPromise(Promise.resolve("hi"), () => "boom");
      expect(result).toEqual({ ok: true, value: "hi" });
    });

    it("converts a rejection into a domain error", async () => {
      const result = await fromPromise(
        Promise.reject(new Error("nope")),
        (cause) => (cause as Error).message,
      );
      expect(result).toEqual({ ok: false, error: "nope" });
    });
  });
});
