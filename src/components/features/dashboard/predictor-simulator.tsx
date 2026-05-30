"use client";

// Client component: recomputes the prediction synchronously on every slider
// drag and fetches a region-year's local fit on selection (useTransition).

import { useMemo, useState, useTransition } from "react";

import type { RegionFitDto } from "@/application/model/dtos";
import type { IndicatorDefinitionDto } from "@/application/region/dtos";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { Select } from "@/components/primitives/select";
import {
  SegmentedControl,
  type SegmentedControlItem,
} from "@/components/primitives/segmented-control";
import { DASHBOARD_SIMULATOR } from "@/config/dashboard";
import { CATEGORY_BADGE_TONE } from "@/config/map";
import { MODEL_DIMENSIONS } from "@/domain/region/entities/indicator-definition";
import {
  predictOrdinal,
  type PredictorMetaPoint,
} from "@/domain/model/services/ordinal-predictor";
import { cn } from "@/lib/cn";

import { loadRegionFit } from "@/app/(public)/dashboard/actions";
import { PredictionResult } from "./prediction-result";
import {
  PredictorSliderGroup,
  type SimulatorSlider,
} from "./predictor-slider-group";

export interface SimulatorRegionOption {
  readonly kodeBps: string;
  readonly kabupatenKota: string;
  readonly provinsi: string;
  readonly years: readonly number[];
}

export interface PredictorSimulatorProps {
  /** The 20 predictors, pre-sorted by display order (X1..X20). */
  readonly predictors: readonly IndicatorDefinitionDto[];
  readonly etaSign: number;
  readonly regions: readonly SimulatorRegionOption[];
  readonly initial: {
    readonly kodeBps: string;
    readonly tahun: number;
    readonly fit: RegionFitDto;
  };
}

const NUMBER_FORMAT = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 2,
});
const NUMBER_FORMAT_SMALL = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 3,
});

function formatMetric(value: number, unit: string | null): string {
  const formatted =
    Math.abs(value) >= 1
      ? NUMBER_FORMAT.format(value)
      : NUMBER_FORMAT_SMALL.format(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

function stepFor(min: number, max: number): number {
  const range = max - min;
  return range > 0 ? range / 200 : 1;
}

function regionsByProvince(
  regions: readonly SimulatorRegionOption[],
): readonly {
  readonly provinsi: string;
  readonly items: readonly SimulatorRegionOption[];
}[] {
  const groups = new Map<string, SimulatorRegionOption[]>();
  for (const region of regions) {
    const bucket = groups.get(region.provinsi);
    if (bucket) bucket.push(region);
    else groups.set(region.provinsi, [region]);
  }
  return [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], "id"))
    .map(([provinsi, items]) => ({ provinsi, items }));
}

export function PredictorSimulator({
  predictors,
  etaSign,
  regions,
  initial,
}: PredictorSimulatorProps) {
  const [selectedKode, setSelectedKode] = useState(initial.kodeBps);
  const [selectedYear, setSelectedYear] = useState(initial.tahun);
  const [fit, setFit] = useState<RegionFitDto | null>(initial.fit);
  const [values, setValues] = useState<readonly number[]>(initial.fit.defaults);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const metaPoints = useMemo<readonly PredictorMetaPoint[]>(
    () =>
      predictors.map((predictor) => ({
        transform: predictor.model.transform ?? "none",
        stdMean: predictor.model.stdMean ?? 0,
        stdSd: predictor.model.stdSd ?? 1,
      })),
    [predictors],
  );

  const provinceGroups = useMemo(() => regionsByProvince(regions), [regions]);
  const selectedRegion = regions.find((r) => r.kodeBps === selectedKode);
  const availableYears = selectedRegion?.years ?? [];

  const sliderGroups = useMemo(() => {
    const beta = fit?.beta ?? [];
    return MODEL_DIMENSIONS.map((dimension) => ({
      dimension,
      sliders: predictors
        .map((predictor, index): SimulatorSlider | null => {
          if (predictor.model.modelDimension !== dimension) return null;
          const min = predictor.model.origMin ?? 0;
          const max = predictor.model.origMax ?? min + 1;
          return {
            index,
            code: predictor.code,
            name: predictor.name,
            unit: predictor.unit,
            min,
            max,
            step: stepFor(min, max),
            inactive: (beta[index] ?? 0) === 0,
          };
        })
        .filter((slider): slider is SimulatorSlider => slider !== null),
    }));
  }, [predictors, fit]);

  const prediction = useMemo(() => {
    if (fit === null) return null;
    return predictOrdinal(
      values,
      metaPoints,
      { alfa1: fit.alfa1, alfa2: fit.alfa2, beta: fit.beta },
      etaSign,
    );
  }, [fit, values, metaPoints, etaSign]);

  const isChanged = useMemo(() => {
    if (fit === null) return false;
    return values.some(
      (value, index) => Math.abs(value - (fit.defaults[index] ?? 0)) > 1e-6,
    );
  }, [fit, values]);

  function load(kodeBps: string, tahun: number): void {
    setSelectedKode(kodeBps);
    setSelectedYear(tahun);
    startTransition(async () => {
      const result = await loadRegionFit({ kodeBps, tahun });
      if (!result.ok) {
        setErrorMessage(result.message);
        return;
      }
      setErrorMessage(null);
      setFit(result.fit);
      if (result.fit !== null) setValues(result.fit.defaults);
    });
  }

  function handleRegionChange(kodeBps: string): void {
    const region = regions.find((r) => r.kodeBps === kodeBps);
    const years = region?.years ?? [];
    const tahun = years.includes(selectedYear)
      ? selectedYear
      : Math.max(...years);
    load(kodeBps, tahun);
  }

  const yearItems: readonly SegmentedControlItem<string>[] = availableYears.map(
    (year) => ({ id: String(year), label: String(year) }),
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1.5 text-sm">
          <span className="font-medium text-foreground">
            {DASHBOARD_SIMULATOR.regionLabel}
          </span>
          <Select
            value={selectedKode}
            onChange={(event) => handleRegionChange(event.target.value)}
          >
            {provinceGroups.map((group) => (
              <optgroup key={group.provinsi} label={group.provinsi}>
                {group.items.map((region) => (
                  <option key={region.kodeBps} value={region.kodeBps}>
                    {region.kabupatenKota}
                  </option>
                ))}
              </optgroup>
            ))}
          </Select>
        </label>
        <div className="space-y-1.5 text-sm">
          <span className="font-medium text-foreground">
            {DASHBOARD_SIMULATOR.yearLabel}
          </span>
          <SegmentedControl
            ariaLabel={DASHBOARD_SIMULATOR.yearLabel}
            value={String(selectedYear)}
            onValueChange={(id) => load(selectedKode, Number(id))}
            items={yearItems}
          />
        </div>
      </div>

      {errorMessage !== null ? (
        <ErrorState
          title={DASHBOARD_SIMULATOR.loadError}
          description={errorMessage}
        />
      ) : fit === null ? (
        <EmptyState
          title={DASHBOARD_SIMULATOR.noFitTitle}
          description={DASHBOARD_SIMULATOR.noFitDescription}
        />
      ) : (
        <div
          className={cn(
            "grid gap-8 pb-24 transition-opacity lg:grid-cols-[1fr_22rem] lg:items-start lg:pb-0",
            isPending && "pointer-events-none opacity-60",
          )}
          aria-busy={isPending}
        >
          {/* Sliders (left on desktop) */}
          <div className="space-y-8 lg:order-1">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                {DASHBOARD_SIMULATOR.slidersTitle}
              </h3>
              <p className="mt-1 max-w-prose text-sm text-muted-foreground">
                {DASHBOARD_SIMULATOR.slidersHint}
              </p>
            </div>
            {sliderGroups.map((group) => (
              <PredictorSliderGroup
                key={group.dimension}
                title={group.dimension}
                sliders={group.sliders}
                values={values}
                onValueChange={(index, value) =>
                  setValues((prev) => {
                    const next = [...prev];
                    next[index] = value;
                    return next;
                  })
                }
                formatValue={formatMetric}
              />
            ))}
            {!fit.converged ? (
              <p className="text-xs text-muted-foreground">
                {DASHBOARD_SIMULATOR.convergedNote}
              </p>
            ) : null}
          </div>

          {/* Result — sticky aside on desktop, fixed bottom bar on mobile */}
          <aside className="hidden lg:sticky lg:top-24 lg:order-2 lg:block">
            <div className="space-y-5 rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
              {prediction !== null ? (
                <PredictionResult
                  category={prediction.category}
                  probabilities={prediction.probabilities}
                  actualCategory={fit.actualCategory}
                />
              ) : null}
              <div className="space-y-2 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => {
                    if (fit !== null) setValues(fit.defaults);
                  }}
                  disabled={!isChanged}
                >
                  {DASHBOARD_SIMULATOR.resetLabel}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {isChanged
                    ? DASHBOARD_SIMULATOR.changedNote
                    : DASHBOARD_SIMULATOR.matchNote}
                </p>
              </div>
            </div>
          </aside>

          {prediction !== null ? (
            <div className="safe-bottom fixed inset-x-0 bottom-0 z-sticky border-t border-border bg-surface/95 px-4 py-3 shadow-lg backdrop-blur lg:hidden">
              <div className="mx-auto flex max-w-6xl items-center gap-3">
                <div className="shrink-0">
                  <p className="text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">
                    {DASHBOARD_SIMULATOR.predictedLabel}
                  </p>
                  <Badge tone={CATEGORY_BADGE_TONE[prediction.category]}>
                    {prediction.category}
                  </Badge>
                </div>
                <div className="flex h-2.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                  <span
                    className="bg-ordinal-rendah"
                    style={{
                      width: `${prediction.probabilities.rendah * 100}%`,
                    }}
                  />
                  <span
                    className="bg-ordinal-sedang"
                    style={{
                      width: `${prediction.probabilities.sedang * 100}%`,
                    }}
                  />
                  <span
                    className="bg-ordinal-tinggi"
                    style={{
                      width: `${prediction.probabilities.tinggi * 100}%`,
                    }}
                  />
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[0.625rem] font-semibold uppercase tracking-wide text-muted-foreground">
                    {DASHBOARD_SIMULATOR.actualLabel}
                  </p>
                  <span className="text-sm font-semibold text-foreground">
                    {fit.actualCategory}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
