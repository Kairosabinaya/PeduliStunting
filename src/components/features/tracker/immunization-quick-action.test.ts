import { describe, expect, it } from "vitest";

import { applyImmunizationStatus } from "./immunization-quick-action";

const OPTS = { childBirthDate: "2024-01-01", today: "2024-06-01" } as const;

describe("applyImmunizationStatus", () => {
  it("keeps the note the user just typed instead of overwriting it", () => {
    const form = new FormData();
    form.set("note", "Diberi di posyandu RW 03");
    form.set("givenAt", "");

    const result = applyImmunizationStatus(form, {
      ...OPTS,
      nextStatus: "done",
    });

    expect(result.get("note")).toBe("Diberi di posyandu RW 03");
    expect(result.get("status")).toBe("done");
    expect(result.get("childBirthDate")).toBe("2024-01-01");
  });

  it("keeps a typed given-at date when marking done", () => {
    const form = new FormData();
    form.set("givenAt", "2024-05-20");

    const result = applyImmunizationStatus(form, {
      ...OPTS,
      nextStatus: "done",
    });

    expect(result.get("givenAt")).toBe("2024-05-20");
  });

  it("defaults given-at to today when marking done with no date", () => {
    const form = new FormData();
    form.set("givenAt", "");

    const result = applyImmunizationStatus(form, {
      ...OPTS,
      nextStatus: "done",
    });

    expect(result.get("givenAt")).toBe("2024-06-01");
  });

  it("clears given-at for non-done statuses but preserves the typed note", () => {
    const form = new FormData();
    form.set("givenAt", "2024-05-20");
    form.set("note", "Ditunda karena demam");

    const result = applyImmunizationStatus(form, {
      ...OPTS,
      nextStatus: "skipped",
    });

    expect(result.get("givenAt")).toBe("");
    expect(result.get("note")).toBe("Ditunda karena demam");
    expect(result.get("status")).toBe("skipped");
  });
});
