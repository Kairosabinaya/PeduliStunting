/**
 * Server-side rebuild of the compact grounding context from the untrusted
 * client selection. The client only sends identifiers (pageId + kodeBps/tahun/
 * childId); the server re-derives every value from authoritative use cases, so
 * the client cannot forge data (especially tracker data). Best-effort: it never
 * fails the chat — a missing source degrades to a short fallback line.
 *
 * The tracker summary deliberately omits the child's name and birth date
 * (ADR-0021); only derived status is included.
 */

import type { ChildOverviewLoader } from "@/application/ai/ports/child-overview-loader";
import type { PageContextDto } from "@/application/ai/dtos";
import type { AiToolSession } from "@/application/ai/tools/tool-context";
import type { ModelMetadataDto } from "@/application/model/dtos";
import type {
  IndicatorDefinitionDto,
  RegionDto,
  RegionIndicatorsDto,
} from "@/application/region/dtos";
import type { DashboardInsightsDto } from "@/application/region/insights";
import { TrackerDashboardViewModelBuilder } from "@/application/tracking/tracker-dashboard-view-model";
import type { AppError } from "@/domain/errors/app-error";
import { asKodeBps } from "@/domain/region/value-objects/kode-bps";
import type { KodeBps } from "@/domain/region/value-objects/kode-bps";
import { asChildId } from "@/domain/shared/ids";
import type { Result } from "@/domain/shared/result";
import type { PageContextSelection } from "@/schemas/ai";

/** Structural deps (method signatures) so tests can inject plain-object fakes. */
export interface PageContextDeps {
  readonly getDashboardInsights: {
    execute(): Promise<Result<DashboardInsightsDto, AppError>>;
  };
  readonly getRegionByKodeBps: {
    execute(kodeBps: KodeBps): Promise<Result<RegionDto | null, AppError>>;
  };
  readonly listRegionIndicatorsHistory: {
    execute(
      kodeBps: KodeBps,
    ): Promise<Result<readonly RegionIndicatorsDto[], AppError>>;
  };
  readonly getDefaultModelMetadata: {
    execute(): Promise<Result<ModelMetadataDto | null, AppError>>;
  };
  readonly listIndicatorDictionary: {
    execute(): Promise<Result<readonly IndicatorDefinitionDto[], AppError>>;
  };
  readonly loadChildOverview: ChildOverviewLoader;
}

export class BuildPageContextUseCase {
  constructor(private readonly deps: PageContextDeps) {}

  async execute(
    selection: PageContextSelection,
    session: AiToolSession | null,
    includeScreenText = true,
  ): Promise<PageContextDto> {
    const summary = await this.summaryFor(selection, session);
    const screenText = includeScreenText ? selection.screenText : undefined;
    return {
      pageId: selection.pageId,
      summary: withScreenText(summary, screenText),
    };
  }

  private summaryFor(
    selection: PageContextSelection,
    session: AiToolSession | null,
  ): Promise<string> {
    switch (selection.pageId) {
      case "map":
      case "data":
        return buildPublicSummary(this.deps, selection);
      case "prediksi":
        return buildPrediksiSummary(this.deps, selection);
      case "tracker":
        return buildTrackerSummary(this.deps, selection, session);
    }
  }
}

/** Append the client-captured on-screen text (untrusted; treated as data). */
function withScreenText(
  summary: string,
  screenText: string | undefined,
): string {
  const trimmed = screenText?.trim();
  if (!trimmed) return summary;
  return `${summary}\n\nAPA YANG TAMPIL DI LAYAR (teks yang sedang dilihat pengguna):\n${trimmed}`;
}

async function buildPublicSummary(
  deps: PageContextDeps,
  selection: PageContextSelection,
): Promise<string> {
  const lines: string[] = [];
  const insightsRes = await deps.getDashboardInsights.execute();
  if (insightsRes.ok) {
    const insights = insightsRes.value;
    const focus = insights.perYear.find((y) => y.tahun === insights.focusYear);
    if (focus) {
      lines.push(
        `Rata-rata prevalensi nasional ${insights.focusYear}: ${focus.meanPrevalence}% dari ${focus.regionCount} wilayah (Rendah ${focus.rendah}, Sedang ${focus.sedang}, Tinggi ${focus.tinggi}).`,
      );
    }
    if (insights.perYear.length > 1) {
      const trend = [...insights.perYear]
        .sort((a, b) => a.tahun - b.tahun)
        .map((year) => `${year.tahun}: ${year.meanPrevalence}%`)
        .join(", ");
      lines.push(
        `Tren rata-rata prevalensi nasional (lintas wilayah): ${trend}.`,
      );
    }
    const best = insights.bestRegions[0];
    const worst = insights.worstRegions[0];
    if (best) {
      lines.push(
        `Prevalensi terendah ${insights.focusYear}: ${best.kabupatenKota} (${best.prevalence}%).`,
      );
    }
    if (worst) {
      lines.push(
        `Prevalensi tertinggi ${insights.focusYear}: ${worst.kabupatenKota} (${worst.prevalence}%).`,
      );
    }
  }
  if (selection.kodeBps) {
    const line = await buildSelectedRegionLine(deps, selection.kodeBps);
    if (line) lines.push(line);
  }
  const indicatorsLine = await buildTopIndicatorsLine(deps);
  if (indicatorsLine) lines.push(indicatorsLine);
  return lines.length > 0 ? lines.join("\n") : "Ringkasan data tidak tersedia.";
}

async function buildPrediksiSummary(
  deps: PageContextDeps,
  selection: PageContextSelection,
): Promise<string> {
  const lines: string[] = [];
  const modelRes = await deps.getDefaultModelMetadata.execute();
  if (modelRes.ok && modelRes.value) {
    const model = modelRes.value;
    const accuracy = numericMetric(model.metrics, "accuracy");
    const qwk = numericMetric(model.metrics, "qwk");
    const suffix = [
      accuracy !== null ? `akurasi ${accuracy}` : null,
      qwk !== null ? `QWK ${qwk}` : null,
    ]
      .filter((part): part is string => part !== null)
      .join(", ");
    lines.push(
      `Model default: ${model.name} (versi ${model.version})${suffix ? `, ${suffix}` : ""}.`,
    );
  }
  if (selection.kodeBps) {
    const line = await buildSelectedRegionLine(deps, selection.kodeBps);
    if (line) lines.push(line);
  }
  const indicatorsLine = await buildTopIndicatorsLine(deps);
  if (indicatorsLine) lines.push(indicatorsLine);
  return lines.length > 0
    ? lines.join("\n")
    : "Ringkasan model tidak tersedia.";
}

async function buildTrackerSummary(
  deps: PageContextDeps,
  selection: PageContextSelection,
  session: AiToolSession | null,
): Promise<string> {
  if (!session || !selection.childId) return "Belum ada anak yang dipilih.";
  const result = await deps.loadChildOverview(
    session.userId,
    asChildId(selection.childId),
  );
  if (!result.ok) return "Konteks anak tidak tersedia.";
  const overview = result.value;
  const vm = new TrackerDashboardViewModelBuilder().build({
    child: overview.child,
    childAgeMonths: overview.childAgeMonths,
    measurements: overview.measurements,
    immunizationSchedule: overview.immunizationSchedule,
    childImmunizations: overview.childImmunizations,
    milestoneCatalog: overview.milestoneCatalog,
    childMilestones: overview.childMilestones,
  });
  const growth = vm.growthStatuses
    .map((g) => `${g.indicator} z=${g.zScore.toFixed(2)} (${g.sdClass})`)
    .join("; ");
  return [
    `Anak usia ${vm.childAgeMonths} bulan. Risiko keseluruhan: ${vm.overallRiskLevel}.`,
    growth ? `Status pertumbuhan: ${growth}.` : "Belum ada pengukuran.",
    `Imunisasi: ${vm.immunizationProgress.done}/${vm.immunizationProgress.due} selesai, ${vm.immunizationsMissed.length} terlewat.`,
    `Milestone terlambat pada rentang usia saat ini: ${vm.milestoneAlert.delayedCount}.`,
  ].join("\n");
}

async function buildSelectedRegionLine(
  deps: PageContextDeps,
  kodeBps: string,
): Promise<string | null> {
  const [regionRes, historyRes] = await Promise.all([
    deps.getRegionByKodeBps.execute(asKodeBps(kodeBps)),
    deps.listRegionIndicatorsHistory.execute(asKodeBps(kodeBps)),
  ]);
  if (!regionRes.ok || !regionRes.value) return null;
  const region = regionRes.value;
  if (!historyRes.ok || historyRes.value.length === 0) {
    return `Wilayah dipilih: ${region.kabupatenKota}, ${region.provinsi}.`;
  }
  const sorted = [...historyRes.value].sort((a, b) => a.tahun - b.tahun);
  const series = sorted
    .map((i) => `${i.tahun}: ${i.y1Prevalence ?? "-"}%`)
    .join(", ");
  const latest = sorted[sorted.length - 1];
  return `Wilayah dipilih: ${region.kabupatenKota}, ${region.provinsi}. Prevalensi (${series}). Kategori terakhir: ${latest?.yCategory ?? "-"}.`;
}

function numericMetric(
  metrics: Readonly<Record<string, unknown>>,
  key: string,
): number | null {
  const value = metrics[key];
  return typeof value === "number" ? value : null;
}

/**
 * Top predictors by absolute correlation with stunting prevalence, so the model
 * can answer "indikator apa yang paling terkait" directly from grounded data
 * instead of deflecting to the dashboard.
 */
async function buildTopIndicatorsLine(
  deps: PageContextDeps,
): Promise<string | null> {
  const result = await deps.listIndicatorDictionary.execute();
  if (!result.ok) return null;
  const ranked = result.value
    .map((def) => ({
      name: def.name,
      cor: def.model.corPrevalence,
      effect: def.effectDirection,
    }))
    .filter(
      (item): item is { name: string; cor: number; effect: string | null } =>
        typeof item.cor === "number",
    )
    .sort((a, b) => Math.abs(b.cor) - Math.abs(a.cor))
    .slice(0, 4);
  if (ranked.length === 0) return null;
  const items = ranked
    .map(
      (item) =>
        `${item.name} (korelasi ${item.cor.toFixed(2)}${effectSuffix(item.effect)})`,
    )
    .join("; ");
  return `Indikator yang paling terkait dengan prevalensi stunting (urut kekuatan korelasi): ${items}.`;
}

function effectSuffix(effect: string | null): string {
  if (effect === "protective") return ", protektif";
  if (effect === "risk") return ", risiko";
  return "";
}
