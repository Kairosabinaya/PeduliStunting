/**
 * Right-hand panel that shows the selected region's metadata, current-year
 * indicators, predicted category, and year-over-year observed/predicted
 * trend. Pure Server Component — all interactive behaviour (close, change
 * source) is delegated to URL links so the panel itself is zero JS.
 */

import Link from "next/link";

import type { ModelPredictionDto } from "@/application/model/dtos";
import type {
  RegionDto,
  RegionIndicatorsDto,
} from "@/application/region/dtos";
import {
  CATEGORY_BADGE_TONE,
  MAP_COPY,
  MAP_SELECTION_PARAM,
  type MapSource,
} from "@/config/map";
import { SUPPORTED_YEARS } from "@/config/years";
import type { StuntingCategory } from "@/domain/region/value-objects/stunting-category";
import { Badge, EmptyState } from "@/components/primitives";
import { cn } from "@/lib/cn";

import { buildMapHref } from "./map-search-params";

export interface RegionDetailPanelProps {
  readonly region: RegionDto | null;
  readonly tahun: number;
  readonly source: MapSource;
  /** Observed indicator for the active year, when present. */
  readonly currentIndicator: RegionIndicatorsDto | null;
  /** Predicted row for the active year, when present. */
  readonly currentPrediction: ModelPredictionDto | null;
  /** Full observed history (any number of years). */
  readonly history: readonly RegionIndicatorsDto[];
  /** Full prediction history for the default model version. */
  readonly predictionHistory: readonly ModelPredictionDto[];
  /** Current URL search params so the close-link can rebuild without selection. */
  readonly currentSearch: string;
  readonly className?: string;
}

export function RegionDetailPanel(props: RegionDetailPanelProps) {
  const { region, className } = props;
  if (!region) {
    return (
      <aside
        aria-labelledby="region-detail-empty-title"
        className={cn("flex h-full flex-col", className)}
      >
        <EmptyState
          title={MAP_COPY.selectionEmptyTitle}
          description={MAP_COPY.selectionEmptyDescription}
          className="h-full"
        />
      </aside>
    );
  }

  return <PopulatedPanel {...props} region={region} />;
}

function PopulatedPanel({
  region,
  tahun,
  source,
  currentIndicator,
  currentPrediction,
  history,
  predictionHistory,
  currentSearch,
  className,
}: RegionDetailPanelProps & { readonly region: RegionDto }) {
  const closeQuery = buildMapHref(new URLSearchParams(currentSearch), {
    [MAP_SELECTION_PARAM]: null,
  });
  const closeHref = closeQuery.length === 0 ? "?" : closeQuery;

  const rows = mergeYearlyRows(history, predictionHistory);

  return (
    <aside
      aria-labelledby="region-detail-title"
      className={cn(
        "flex h-full flex-col gap-4 rounded-xl border border-border bg-surface p-5 text-sm",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {region.provinsi}
          </p>
          <h2
            id="region-detail-title"
            className="break-words text-lg font-semibold text-foreground"
          >
            {region.kabupatenKota}
          </h2>
          <p className="text-xs text-muted-foreground">
            Kode BPS: <span className="font-mono">{region.kodeBps}</span>
          </p>
        </div>
        <Link
          href={closeHref}
          aria-label="Tutup detail wilayah"
          scroll={false}
          replace
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <span aria-hidden className="text-xl leading-none">
            ×
          </span>
        </Link>
      </header>

      <section
        aria-label={`Indikator tahun ${tahun}`}
        className="grid grid-cols-2 gap-3"
      >
        <Metric
          label={`Kategori observasi ${tahun}`}
          value={currentIndicator?.yCategory ?? null}
        />
        <Metric
          label={`Kategori prediksi ${tahun}`}
          value={currentPrediction?.predictedCategory ?? null}
        />
        <Metric
          label="Prevalensi (Y1)"
          value={formatPercent(currentIndicator?.y1Prevalence ?? null)}
          plain
        />
        <Metric
          label="Sumber aktif"
          value={source === "predicted" ? "Prediksi model" : "Observasi"}
          plain
        />
      </section>

      {source === "predicted" && currentPrediction ? (
        <ProbabilityBars prediction={currentPrediction} />
      ) : null}

      <section aria-labelledby="region-detail-history">
        <h3
          id="region-detail-history"
          className="text-sm font-semibold text-foreground"
        >
          Riwayat antar tahun
        </h3>
        {rows.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Belum ada data riwayat untuk wilayah ini.
          </p>
        ) : (
          <ul className="mt-2 flex flex-col divide-y divide-border overflow-hidden rounded-md border border-border">
            {rows.map((row) => (
              <li
                key={row.tahun}
                className="grid grid-cols-[3rem_1fr_1fr_5rem] items-center gap-2 px-3 py-2 text-xs"
              >
                <span className="font-mono tabular-nums text-foreground">
                  {row.tahun}
                </span>
                <CategoryCell label="Obs." category={row.observed} />
                <CategoryCell label="Pred." category={row.predicted} />
                <span className="text-right text-muted-foreground tabular-nums">
                  {formatPercent(row.prevalence)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}

interface MetricProps {
  readonly label: string;
  readonly value: string | StuntingCategory | null;
  readonly plain?: boolean;
}

function Metric({ label, value, plain }: MetricProps) {
  return (
    <div className="flex flex-col gap-1 rounded-md border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      {value === null ? (
        <p className="text-sm text-muted-foreground">Tidak tersedia</p>
      ) : plain || !isCategory(value) ? (
        <p className="text-base font-semibold text-foreground">{value}</p>
      ) : (
        <Badge tone={CATEGORY_BADGE_TONE[value]}>{value}</Badge>
      )}
    </div>
  );
}

function ProbabilityBars({ prediction }: { prediction: ModelPredictionDto }) {
  const bars: ReadonlyArray<{
    readonly key: StuntingCategory;
    readonly value: number | null;
  }> = [
    { key: "Rendah", value: prediction.probRendah },
    { key: "Sedang", value: prediction.probSedang },
    { key: "Tinggi", value: prediction.probTinggi },
  ];
  return (
    <section aria-labelledby="region-detail-probabilities">
      <h3
        id="region-detail-probabilities"
        className="text-sm font-semibold text-foreground"
      >
        Probabilitas model
      </h3>
      <ul className="mt-2 flex flex-col gap-2">
        {bars.map((bar) => {
          const ratio =
            bar.value !== null ? Math.max(0, Math.min(1, bar.value)) : 0;
          return (
            <li key={bar.key} className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-foreground">{bar.key}</span>
                <span className="font-mono tabular-nums text-muted-foreground">
                  {bar.value === null
                    ? "—"
                    : `${(bar.value * 100).toFixed(1)}%`}
                </span>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-label={`Probabilitas ${bar.key}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(ratio * 100)}
              >
                <div
                  className={cn(
                    "h-full",
                    bar.key === "Rendah" && "bg-ordinal-rendah",
                    bar.key === "Sedang" && "bg-ordinal-sedang",
                    bar.key === "Tinggi" && "bg-ordinal-tinggi",
                  )}
                  style={{ width: `${(ratio * 100).toFixed(1)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CategoryCell({
  label,
  category,
}: {
  readonly label: string;
  readonly category: StuntingCategory | null;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{label}</span>
      {category === null ? (
        <span className="text-muted-foreground">—</span>
      ) : (
        <Badge tone={CATEGORY_BADGE_TONE[category]}>{category}</Badge>
      )}
    </div>
  );
}

interface YearlyRow {
  readonly tahun: number;
  readonly observed: StuntingCategory | null;
  readonly predicted: StuntingCategory | null;
  readonly prevalence: number | null;
}

function mergeYearlyRows(
  history: readonly RegionIndicatorsDto[],
  predictions: readonly ModelPredictionDto[],
): readonly YearlyRow[] {
  const byYear = new Map<number, YearlyRow>();
  for (const indicator of history) {
    byYear.set(indicator.tahun, {
      tahun: indicator.tahun,
      observed: indicator.yCategory,
      predicted: null,
      prevalence: indicator.y1Prevalence,
    });
  }
  for (const prediction of predictions) {
    const existing = byYear.get(prediction.tahun);
    if (existing) {
      byYear.set(prediction.tahun, {
        ...existing,
        predicted: prediction.predictedCategory,
      });
    } else {
      byYear.set(prediction.tahun, {
        tahun: prediction.tahun,
        observed: null,
        predicted: prediction.predictedCategory,
        prevalence: null,
      });
    }
  }
  const ordered = [...SUPPORTED_YEARS].filter((year) => byYear.has(year));
  return ordered
    .map((year) => byYear.get(year))
    .filter((row): row is YearlyRow => row !== undefined);
}

function isCategory(value: string): value is StuntingCategory {
  return value === "Rendah" || value === "Sedang" || value === "Tinggi";
}

function formatPercent(value: number | null): string {
  if (value === null) return "Tidak tersedia";
  return `${value.toLocaleString("id-ID", { maximumFractionDigits: 2 })}%`;
}
