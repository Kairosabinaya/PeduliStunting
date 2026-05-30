import { describe, expect, it } from "vitest";

import {
  mapModelLocalFitRow,
  mapModelMetadataRow,
  parseBaselines,
} from "@/schemas/model";
import type { Tables } from "@/types/supabase";

function localFitRow(
  overrides: Partial<Tables<"model_local_fits">> = {},
): Tables<"model_local_fits"> {
  return {
    id: "00000000-0000-0000-0000-000000000000",
    model_version: "gtwenolr-adaptif-1.0",
    kode_bps: "1101",
    tahun: 2024,
    alfa1: -0.738776,
    alfa2: 2.687123,
    n_active: 17,
    converged: false,
    created_at: "2026-05-30T00:00:00Z",
    updated_at: "2026-05-30T00:00:00Z",
    ...overrides,
  };
}

function metadataRow(
  overrides: Partial<Tables<"model_metadata">> = {},
): Tables<"model_metadata"> {
  return {
    version: "gtwenolr-adaptif-1.0",
    name: "GTWENOLR Bandwidth Adaptif",
    eta_sign: 1,
    hyperparameters: {},
    metrics: {},
    moran_per_year: {},
    notes: null,
    is_default: true,
    created_at: "2026-05-30T00:00:00Z",
    updated_at: "2026-05-30T00:00:00Z",
    ...overrides,
  };
}

describe("mapModelLocalFitRow", () => {
  it("maps a valid row to a LocalFit entity", () => {
    const result = mapModelLocalFitRow(localFitRow());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.alfa1).toBeCloseTo(-0.738776, 6);
    expect(result.value.alfa2).toBeCloseTo(2.687123, 6);
    expect(result.value.nActive).toBe(17);
    expect(result.value.converged).toBe(false);
    expect(result.value.kodeBps).toBe("1101");
  });

  it("rejects an out-of-range year", () => {
    const result = mapModelLocalFitRow(localFitRow({ tahun: 1800 }));
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.kind).toBe("validation");
  });

  it("tolerates a null n_active", () => {
    const result = mapModelLocalFitRow(localFitRow({ n_active: null }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.nActive).toBeNull();
  });
});

describe("mapModelMetadataRow", () => {
  it("surfaces eta_sign onto the entity", () => {
    const result = mapModelMetadataRow(metadataRow({ eta_sign: -1 }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.etaSign).toBe(-1);
  });
});

describe("parseBaselines", () => {
  it("parses the keyed baseline record into an ordered list", () => {
    const entries = parseBaselines({
      baselines: {
        OLR: { acc_out: 0.589, qwk_out: 0.53 },
        GTWENOLR_adaptif: { acc_out: 0.716, qwk_out: 0.696 },
      },
    });
    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      name: "OLR",
      accuracyOut: 0.589,
      qwkOut: 0.53,
    });
    expect(entries[1]?.name).toBe("GTWENOLR_adaptif");
  });

  it("returns an empty list when baselines are absent or malformed", () => {
    expect(parseBaselines({})).toEqual([]);
    expect(parseBaselines({ baselines: null })).toEqual([]);
    expect(parseBaselines({ baselines: "nope" })).toEqual([]);
  });

  it("keeps a named entry with null scores when values are missing", () => {
    const entries = parseBaselines({ baselines: { OLR: {} } });
    expect(entries[0]).toMatchObject({
      name: "OLR",
      accuracyOut: null,
      qwkOut: null,
    });
  });
});
