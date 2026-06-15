import { describe, expect, it } from "vitest";

import { AppErrors } from "@/domain/errors/app-error";
import { err, ok } from "@/domain/shared/result";

import {
  fakeChildOverviewLoader,
  fakeSession,
  makeChildOverview,
  makeIndicatorDefinition,
  makeIndicatorsDto,
  makeModelMetadata,
  makeRegionDto,
} from "../../../../tests/factories/ai";
import {
  BuildPageContextUseCase,
  type PageContextDeps,
} from "./build-page-context";

function deps(over: Partial<PageContextDeps> = {}): PageContextDeps {
  return {
    getDashboardInsights: {
      execute: async () =>
        ok({
          years: [2024],
          focusYear: 2024,
          perYear: [
            {
              tahun: 2024,
              meanPrevalence: 15,
              regionCount: 100,
              rendah: 50,
              sedang: 30,
              tinggi: 20,
            },
          ],
          bestRegions: [
            {
              kodeBps: "1",
              kabupatenKota: "Kota A",
              provinsi: "X",
              prevalence: 5,
              category: "Rendah",
            },
          ],
          worstRegions: [
            {
              kodeBps: "2",
              kabupatenKota: "Kab B",
              provinsi: "Y",
              prevalence: 40,
              category: "Tinggi",
            },
          ],
          bestProvinces: [],
          worstProvinces: [],
        }),
    },
    getRegionByKodeBps: { execute: async () => ok(makeRegionDto()) },
    listRegionIndicatorsHistory: {
      execute: async () => ok([makeIndicatorsDto({ tahun: 2024 })]),
    },
    getDefaultModelMetadata: { execute: async () => ok(makeModelMetadata()) },
    listIndicatorDictionary: {
      execute: async () =>
        ok([
          makeIndicatorDefinition({
            name: "Akses air bersih",
            corPrevalence: -0.42,
          }),
          makeIndicatorDefinition({
            name: "Kemiskinan",
            effectDirection: "risk",
            corPrevalence: 0.55,
          }),
        ]),
    },
    loadChildOverview: fakeChildOverviewLoader(ok(makeChildOverview())),
    ...over,
  };
}

describe("BuildPageContextUseCase", () => {
  it("summarises national stats on the data page", async () => {
    const ctx = await new BuildPageContextUseCase(deps()).execute(
      { pageId: "data" },
      null,
    );
    expect(ctx.pageId).toBe("data");
    expect(ctx.summary).toContain("nasional 2024");
  });

  it("lists the top correlated indicators (strongest first) on the data page", async () => {
    const ctx = await new BuildPageContextUseCase(deps()).execute(
      { pageId: "data" },
      null,
    );
    expect(ctx.summary.toLowerCase()).toContain("indikator");
    // |0.55| > |-0.42|, so Kemiskinan must be ranked before Akses air bersih.
    expect(ctx.summary.indexOf("Kemiskinan")).toBeLessThan(
      ctx.summary.indexOf("Akses air bersih"),
    );
  });

  it("includes the selected region when kodeBps is present", async () => {
    const ctx = await new BuildPageContextUseCase(deps()).execute(
      { pageId: "map", kodeBps: "3578" },
      null,
    );
    expect(ctx.summary).toContain("Kota Surabaya");
  });

  it("notes when the selected region is not found in the data", async () => {
    const ctx = await new BuildPageContextUseCase(
      deps({ getRegionByKodeBps: { execute: async () => ok(null) } }),
    ).execute({ pageId: "map", kodeBps: "9999" }, null);
    expect(ctx.summary).toContain("tidak ditemukan di data aplikasi");
  });

  it("summarises the model on the prediksi page", async () => {
    const ctx = await new BuildPageContextUseCase(deps()).execute(
      { pageId: "prediksi" },
      null,
    );
    expect(ctx.summary).toContain("Model default");
  });

  it("builds a tracker summary without the child's name", async () => {
    const ctx = await new BuildPageContextUseCase(deps()).execute(
      { pageId: "tracker", childId: "c1" },
      fakeSession(),
    );
    expect(ctx.summary).toContain("usia 12 bulan");
    expect(ctx.summary).not.toContain("Budi");
  });

  it("degrades when tracker has no session", async () => {
    const ctx = await new BuildPageContextUseCase(deps()).execute(
      { pageId: "tracker" },
      null,
    );
    expect(ctx.summary).toContain("Belum ada anak");
  });

  it("falls back when all data sources fail", async () => {
    const ctx = await new BuildPageContextUseCase(
      deps({
        getDashboardInsights: {
          execute: async () => err(AppErrors.unexpected("boom")),
        },
        listIndicatorDictionary: {
          execute: async () => err(AppErrors.unexpected("boom")),
        },
      }),
    ).execute({ pageId: "data" }, null);
    expect(ctx.summary).toContain("tidak tersedia");
  });
});
