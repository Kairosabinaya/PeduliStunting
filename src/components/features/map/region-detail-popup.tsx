"use client";

/**
 * Client-rendered detail panel. Shows immediately on selection with data
 * already in memory (region, current-year indicator, prediction, ranking
 * — all passed in as props from the in-process dataset). The longitudinal
 * history (chart + table) loads asynchronously via
 * `/api/region/[kodeBps]/history` so the panel feels instant even before
 * the chart renders.
 *
 * The fetched history is cached in a per-instance Map keyed by kode_bps,
 * so re-selecting a previously-viewed region is genuinely instant.
 */

import { useEffect, useRef, useState } from "react";

import type { ModelPredictionDto } from "@/application/model/dtos";
import type {
  RegionDto,
  RegionIndicatorsDto,
} from "@/application/region/dtos";
import { Badge } from "@/components/primitives/badge";
import { Skeleton } from "@/components/primitives/skeleton";
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
import {
  MiniHistoryChart,
  type HistoryPoint,
} from "./mini-history-chart";

export interface RegionDetailPopupProps {
  readonly region: RegionDto;
  readonly tahun: number;
  readonly source: MapSource;
  readonly predictedAvailable: boolean;
  readonly currentIndicator: RegionIndicatorsDto | null;
  readonly currentPrediction: ModelPredictionDto | null;
  readonly ranking: RegionRanking | null;
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

interface HistoryPayload {
  readonly history: readonly RegionIndicatorsDto[];
  readonly predictionHistory: readonly ModelPredictionDto[];
}

// Per-session LRU-ish cache so re-clicking a region is instant.
const historyCache = new Map<string, HistoryPayload>();

export function RegionDetailPopup({
  region,
  tahun,
  source,
  predictedAvailable,
  currentIndicator,
  currentPrediction,
  ranking,
  isHistoricalFallback = false,
  originalSelection,
  className,
}: RegionDetailPopupProps) {
  const { setWilayah, setSumber } = useMapState();
  const [historyState, setHistoryState] = useState<{
    readonly kodeBps: string;
    readonly data: HistoryPayload | null;
    readonly error: string | null;
  }>(() => ({
    kodeBps: region.kodeBps,
    data: historyCache.get(region.kodeBps) ?? null,
    error: null,
  }));
  const abortRef = useRef<AbortController | null>(null);

  // Lazy-load (or read from cache) the historical series for the active
  // region. Aborts in-flight requests when the user clicks a different
  // region quickly — the race condition that previously surfaced wrong
  // data when clicks landed within ~500 ms of each other.
  useEffect(() => {
    abortRef.current?.abort();
    const cached = historyCache.get(region.kodeBps);
    // Effect-driven state sync: when the active region changes we either
    // hydrate from the per-session cache (instant) or push the panel into
    // a loading state while we fetch. Cannot be a render-derived value
    // because we also start a side-effect HTTP request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistoryState({
      kodeBps: region.kodeBps,
      data: cached ?? null,
      error: null,
    });
    if (cached) return;
    const controller = new AbortController();
    abortRef.current = controller;
    fetch(`/api/region/${region.kodeBps}/history`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as HistoryPayload & {
          readonly kodeBps: string;
        };
        const payload: HistoryPayload = {
          history: json.history,
          predictionHistory: json.predictionHistory,
        };
        historyCache.set(region.kodeBps, payload);
        setHistoryState({
          kodeBps: region.kodeBps,
          data: payload,
          error: null,
        });
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        const message =
          err instanceof Error ? err.message : "Gagal memuat riwayat.";
        setHistoryState((prev) =>
          prev.kodeBps === region.kodeBps
            ? { ...prev, error: message }
            : prev,
        );
      });
    return () => controller.abort();
  }, [region.kodeBps]);

  const history = historyState.data?.history ?? [];
  const predictionHistory = historyState.data?.predictionHistory ?? [];
  const historyLoaded = historyState.data !== null;

  const category =
    source === "predicted"
      ? (currentPrediction?.predictedCategory ?? null)
      : (currentIndicator?.yCategory ?? null);
  const prevalence = currentIndicator?.y1Prevalence ?? null;

  const rows = mergeYearlyRows(history, predictionHistory);
  const points: HistoryPoint[] = rows.map((row) => ({
    tahun: row.tahun,
    observed: row.observed?.y1Prevalence ?? null,
    observedCategory: row.observed?.yCategory ?? null,
    predictedCategory: row.predicted?.predictedCategory ?? null,
  }));

  return (
    <article
      className={cn(
        "glass-panel max-h-[calc(100dvh-7rem)] space-y-5 overflow-y-auto rounded-2xl p-5",
        className,
      )}
    >
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

      <section className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            {MAP_DETAIL_COPY.prevalenceLabel}, {tahun}
          </p>
          <p
            className={cn(
              "stat-number mt-1 text-4xl font-semibold",
              category
                ? CATEGORY_TEXT_CLASS[category]
                : "text-muted-foreground",
            )}
          >
            {prevalence !== null
              ? `${prevalence.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
              : "—"}
          </p>
        </div>
        <button
          type="button"
          disabled={!predictedAvailable && source !== "predicted"}
          onClick={() => setSumber(source === "predicted" ? "actual" : "predicted")}
          className={cn(
            "inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {source === "predicted"
            ? MAP_DETAIL_COPY.showObservedLabel
            : MAP_DETAIL_COPY.showPredictionLabel}
        </button>
      </section>

      <dl className="grid grid-cols-3 gap-3 text-sm">
        <StatTile
          label={MAP_DETAIL_COPY.rankLabel}
          value={
            ranking
              ? `#${ranking.rank}`
              : MAP_DETAIL_COPY.rankUnavailable
          }
          {...(ranking ? { hint: `dari ${ranking.total}` } : {})}
        />
        <StatTile label={MAP_DETAIL_COPY.typeLabel} value={region.tipe} />
        <StatTile
          label={MAP_DETAIL_COPY.codeLabel}
          value={region.kodeBps}
          mono
        />
      </dl>

      {historyLoaded ? (
        <>
          <MiniHistoryChart points={points} activeTahun={tahun} />
          <HistoryTable rows={rows} activeTahun={tahun} />
          {predictedAvailable && rows.some((r) => r.predicted) ? (
            <PredictionPanel
              currentPrediction={currentPrediction}
            />
          ) : null}
        </>
      ) : historyState.error ? (
        <p className="rounded-xl border border-dashed border-border bg-surface-muted/40 p-3 text-xs text-muted-foreground">
          Gagal memuat riwayat: {historyState.error}
        </p>
      ) : (
        <div className="space-y-2" aria-busy="true">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      )}
    </article>
  );
}

interface StatTileProps {
  readonly label: string;
  readonly value: string;
  readonly hint?: string;
  readonly mono?: boolean;
}

function StatTile({ label, value, hint, mono }: StatTileProps) {
  return (
    <div className="rounded-xl border border-border bg-surface-muted/30 p-3">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-1 text-base font-semibold text-foreground",
          mono && "font-mono tabular-nums",
        )}
      >
        {value}
      </dd>
      {hint ? (
        <p className="text-[11px] text-muted-foreground">{hint}</p>
      ) : null}
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
              {MAP_DETAIL_COPY.observedAxisLabel}
            </th>
            <th scope="col" className="py-2 text-left font-medium">
              {MAP_DETAIL_COPY.predictedAxisLabel}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => {
            const active = row.tahun === activeTahun;
            return (
              <tr
                key={row.tahun}
                className={cn(active && "bg-surface-muted/40")}
              >
                <td className="py-2 font-mono tabular-nums">{row.tahun}</td>
                <td className="py-2">
                  {row.observed ? (
                    <span className="flex items-center gap-2">
                      <Badge
                        tone={CATEGORY_BADGE_TONE[row.observed.yCategory]}
                      >
                        {row.observed.yCategory}
                      </Badge>
                      <span className="font-mono tabular-nums text-muted-foreground">
                        {row.observed.y1Prevalence !== null
                          ? `${row.observed.y1Prevalence.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
                          : "—"}
                      </span>
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="py-2">
                  {row.predicted ? (
                    <Badge
                      tone={CATEGORY_BADGE_TONE[row.predicted.predictedCategory]}
                    >
                      {row.predicted.predictedCategory}
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

function PredictionPanel({
  currentPrediction,
}: {
  readonly currentPrediction: ModelPredictionDto | null;
}) {
  if (!currentPrediction) return null;
  return (
    <section className="space-y-2 rounded-xl border border-border bg-surface-muted/30 p-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {MAP_DETAIL_COPY.predictionTitle}
      </h3>
      <ul className="space-y-1 text-xs">
        {(
          [
            ["Rendah", currentPrediction.probRendah],
            ["Sedang", currentPrediction.probSedang],
            ["Tinggi", currentPrediction.probTinggi],
          ] as const
        ).map(([label, value]) => (
          <li key={label} className="flex items-center justify-between gap-2">
            <span>{label}</span>
            <span className="font-mono tabular-nums">
              {value !== null && value !== undefined
                ? `${(value * 100).toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`
                : "—"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
