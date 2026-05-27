"use client";

/**
 * Client-rendered detail panel. All data — current-year indicator,
 * ranking, and the cross-year history series — arrives as props from
 * MapShell, which derives everything from the in-memory dataset already
 * shipped with the initial HTML (`indicatorsByYear` / `predictionsByYear`).
 *
 * No more `/api/region/[id]/history` fetch: history is a pure projection
 * of data the client already owns, so opening a region's detail panel is
 * instantaneous and the Papua-pemekaran sibling pair (e.g. 9402 / 9701)
 * is merged into a single 2021–2024 timeline upstream by MapShell.
 */

import type { ModelPredictionDto } from "@/application/model/dtos";
import type { RegionDto, RegionIndicatorsDto } from "@/application/region/dtos";
import { Badge } from "@/components/primitives/badge";
import {
  CATEGORY_BADGE_TONE,
  CATEGORY_TEXT_CLASS,
  MAP_DETAIL_COPY,
  type MapSource,
} from "@/config/map";
import { cn } from "@/lib/cn";

import {
  mergeYearlyRows,
  type RegionRanking,
  type YearlyRow,
} from "./map-data";
import { useMapState } from "./map-state-context";
import { MiniHistoryChart, type HistoryPoint } from "./mini-history-chart";

export interface RegionDetailPopupProps {
  readonly region: RegionDto;
  readonly tahun: number;
  readonly source: MapSource;
  readonly currentIndicator: RegionIndicatorsDto | null;
  readonly ranking: RegionRanking | null;
  /** Observed history across all years (already merged across pemekaran siblings). */
  readonly history: readonly RegionIndicatorsDto[];
  /** Predicted history across all years (merged across siblings, same as history). */
  readonly predictionHistory: readonly ModelPredictionDto[];
  /**
   * `true` when {@link region} is a sibling lookup, not the kode_bps the
   * user actually clicked. Happens when a Papua-pemekaran code is selected
   * but the active year predates the 2022 split, so we fall back to the
   * pre-pemekaran province + code for historical accuracy.
   */
  readonly isHistoricalFallback?: boolean;
  /** The kode_bps the user actually clicked (may differ from `region`). */
  readonly originalSelection?: RegionDto;
  readonly className?: string;
}

export function RegionDetailPopup({
  region,
  tahun,
  source,
  currentIndicator,
  ranking,
  history,
  predictionHistory,
  isHistoricalFallback = false,
  originalSelection,
  className,
}: RegionDetailPopupProps) {
  const { setWilayah } = useMapState();

  const category =
    source === "predicted" ? null : (currentIndicator?.yCategory ?? null);
  const prevalence = currentIndicator?.y1Prevalence ?? null;

  const rows = mergeYearlyRows(history, predictionHistory);
  const points: HistoryPoint[] = rows.map((row) => ({
    tahun: row.tahun,
    observed: row.observed?.y1Prevalence ?? null,
    observedCategory: row.observed?.yCategory ?? null,
    predictedCategory: row.predicted?.predictedCategory ?? null,
  }));

  return (
    <article className={cn("glass-panel space-y-5 rounded-2xl p-5", className)}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {MAP_DETAIL_COPY.eyebrow}
          </p>
          <h2 className="text-2xl font-semibold text-foreground">
            {region.kabupatenKota}
          </h2>
          <p className="text-sm text-muted-foreground">{region.provinsi}</p>
          {isHistoricalFallback && originalSelection ? (
            <p className="mt-1 inline-flex items-start gap-1 rounded-md bg-info/10 px-2 py-1 text-[11px] leading-snug text-info">
              <span aria-hidden>ⓘ</span>
              <span>
                Tahun {tahun} merujuk pada konteks{" "}
                <strong>{region.provinsi}</strong> (pra-pemekaran 2022). Kode
                aktif saat ini: {originalSelection.kodeBps} (
                {originalSelection.provinsi}).
              </span>
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {category ? (
            <Badge tone={CATEGORY_BADGE_TONE[category]}>{category}</Badge>
          ) : (
            <Badge tone="neutral">Data tidak tersedia</Badge>
          )}
          <button
            type="button"
            aria-label={MAP_DETAIL_COPY.closeLabel}
            onClick={() => setWilayah(null)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <span aria-hidden className="text-2xl leading-none">
              ×
            </span>
          </button>
        </div>
      </header>

      <section>
        <p className="text-xs font-medium text-muted-foreground">
          {MAP_DETAIL_COPY.prevalenceLabel}, {tahun}
        </p>
        <p
          className={cn(
            "stat-number mt-1 text-4xl font-semibold",
            category ? CATEGORY_TEXT_CLASS[category] : "text-muted-foreground",
          )}
        >
          {prevalence !== null
            ? `${prevalence.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
            : "—"}
        </p>
      </section>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <StatTile
          label={MAP_DETAIL_COPY.rankLabel}
          value={ranking ? `#${ranking.rank}` : MAP_DETAIL_COPY.rankUnavailable}
          {...(ranking ? { hint: `dari ${ranking.total}` } : {})}
        />
        <StatTile label={MAP_DETAIL_COPY.typeLabel} value={region.tipe} />
      </dl>

      <MiniHistoryChart points={points} activeTahun={tahun} />
      <HistoryTable rows={rows} activeTahun={tahun} />
    </article>
  );
}

interface StatTileProps {
  readonly label: string;
  readonly value: string;
  readonly hint?: string;
}

function StatTile({ label, value, hint }: StatTileProps) {
  return (
    <div className="rounded-xl border border-border bg-surface-muted/30 p-3">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 flex items-baseline gap-2">
        <span className="text-base font-semibold text-foreground">{value}</span>
        {hint ? (
          <span className="text-[11px] text-muted-foreground">{hint}</span>
        ) : null}
      </dd>
    </div>
  );
}

function HistoryTable({
  rows,
  activeTahun,
}: {
  readonly rows: readonly YearlyRow[];
  readonly activeTahun: number;
}) {
  if (rows.length === 0) return null;
  return (
    <section aria-label={`${MAP_DETAIL_COPY.historyTitlePrefix} per tahun`}>
      <table className="w-full text-sm">
        <thead className="text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th scope="col" className="py-2 text-left font-medium">
              Tahun
            </th>
            <th scope="col" className="py-2 text-left font-medium">
              {MAP_DETAIL_COPY.prevalenceAxisLabel}
            </th>
            <th scope="col" className="py-2 text-left font-medium">
              {MAP_DETAIL_COPY.observedAxisLabel}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => {
            const active = row.tahun === activeTahun;
            const prevalence = row.observed?.y1Prevalence ?? null;
            return (
              <tr
                key={row.tahun}
                className={cn(active && "bg-surface-muted/40")}
              >
                <td className="py-2 font-mono tabular-nums">{row.tahun}</td>
                <td className="py-2 font-mono tabular-nums text-muted-foreground">
                  {prevalence !== null
                    ? `${prevalence.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
                    : "—"}
                </td>
                <td className="py-2">
                  {row.observed ? (
                    <Badge tone={CATEGORY_BADGE_TONE[row.observed.yCategory]}>
                      {row.observed.yCategory}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
