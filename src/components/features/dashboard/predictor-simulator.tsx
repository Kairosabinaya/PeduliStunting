"use client";

// Client component: recomputes the prediction synchronously on every slider
// drag and fetches a region-year's local fit on selection (useTransition).

import { RotateCcw } from "lucide-react";
import { useMemo, useState, useTransition, type ReactNode } from "react";

import type { RegionFitDto } from "@/application/model/dtos";
import type { IndicatorDefinitionDto } from "@/application/region/dtos";
import { Badge } from "@/components/primitives/badge";
import { Button } from "@/components/primitives/button";
import { Card } from "@/components/primitives/card";
import { EmptyState } from "@/components/primitives/empty-state";
import { ErrorState } from "@/components/primitives/error-state";
import { PageHeader } from "@/components/primitives/page-header";
import {
  SegmentedControl,
  type SegmentedControlItem,
} from "@/components/primitives/segmented-control";
import {
  DASHBOARD_SIMULATOR,
  SIMULATOR_DIMENSION_GROUPS,
  SIMULATOR_EQUATION,
} from "@/config/dashboard";
import {
  predictOrdinal,
  type PredictorMetaPoint,
} from "@/domain/model/services/ordinal-predictor";
import { cn } from "@/lib/cn";

import { loadRegionFit } from "@/app/(public)/prediksi/actions";
import { ModelEquationFit } from "./model-equation-fit";
import { RegionCombobox } from "./region-combobox";
import {
  PredictionResult,
  PREDICTION_BADGE_TONE,
  PREDICTION_BAR_CLASS,
} from "./prediction-result";
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
  /** Page-header copy; the region/year controls render in the header actions. */
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  /** Server-rendered KaTeX general equation, shown in the equation section. */
  readonly generalEquation: ReactNode;
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

export function PredictorSimulator({
  eyebrow,
  title,
  description,
  generalEquation,
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

  const selectedRegion = regions.find((r) => r.kodeBps === selectedKode);
  const availableYears = selectedRegion?.years ?? [];

  const sliderGroups = useMemo(() => {
    const beta = fit?.beta ?? [];
    const defaults = fit?.defaults ?? [];
    const buildSlider = (
      predictor: IndicatorDefinitionDto,
      index: number,
    ): SimulatorSlider => {
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
        defaultValue: defaults[index] ?? min,
        inactive: (beta[index] ?? 0) === 0,
      };
    };
    return SIMULATOR_DIMENSION_GROUPS.map((group) => ({
      title: group.title,
      column: group.column,
      roomy: group.roomy ?? false,
      sliders: predictors.flatMap((predictor, index) =>
        group.dimensions.includes(predictor.model.modelDimension ?? "")
          ? [buildSlider(predictor, index)]
          : [],
      ),
    }));
  }, [predictors, fit]);

  const leftGroups = sliderGroups.filter((group) => group.column === "left");
  const rightGroups = sliderGroups.filter((group) => group.column === "right");

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

  function handleSliderChange(index: number, value: number): void {
    setValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  const yearItems: readonly SegmentedControlItem<string>[] = availableYears.map(
    (year) => ({ id: String(year), label: String(year) }),
  );

  return (
    <div>
      {/* Control panel: title, region/year controls, and the prediction card.
          Sticky only on lg+ (desktop), where it pins below the floating header.
          On mobile/tablet it scrolls away normally — matching `lg:hidden` on the
          compact fixed summary bar below, which keeps the prediction in view. */}
      <div className="mb-6 rounded-2xl border border-border/50 bg-surface/95 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-surface/80 md:p-6 lg:sticky lg:top-0 lg:z-sticky">
        <PageHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          actions={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex items-center gap-3 text-sm sm:w-72">
                <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {DASHBOARD_SIMULATOR.regionShortLabel}
                </span>
                <RegionCombobox
                  regions={regions}
                  value={selectedKode}
                  onChange={handleRegionChange}
                  ariaLabel={DASHBOARD_SIMULATOR.regionLabel}
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
          }
        />

        {fit !== null && prediction !== null && errorMessage === null ? (
          <div className="mt-5">
            <Card elevation="sm" padding="md" className="shadow-sm">
              <PredictionResult
                category={prediction.category}
                probabilities={prediction.probabilities}
                actualCategory={fit.actualCategory}
                layout="split"
                action={
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (fit !== null) setValues(fit.defaults);
                    }}
                    disabled={!isChanged}
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden />
                    {DASHBOARD_SIMULATOR.resetLabel}
                  </Button>
                }
              />
            </Card>
          </div>
        ) : null}
      </div>

      <Card padding="lg">
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
              "pb-28 transition-opacity lg:pb-0",
              isPending && "pointer-events-none opacity-60",
            )}
            aria-busy={isPending}
          >
            {/* Model equations: Scrollable along with sliders */}
            <aside className="mb-5">
              <Card elevation="sm" padding="md" className="space-y-4">
                <section className="space-y-2">
                  {/* h2 (visually small): the only heading between the page
                      h1 and this card, so h3 skipped a level
                      (axe heading-order). */}
                  <h2 className="text-sm font-semibold text-foreground">
                    {SIMULATOR_EQUATION.generalTitle}
                  </h2>
                  {generalEquation}
                </section>
                <ModelEquationFit
                  regionName={fit.kabupatenKota}
                  tahun={fit.tahun}
                  alfa1={fit.alfa1}
                  alfa2={fit.alfa2}
                  beta={fit.beta}
                  nActive={fit.nActive}
                />
              </Card>
            </aside>

            {/* Sliders — two explicit columns so placement is deterministic:
              left holds Sosial-Ekonomi, Pendidikan, Gender; right holds
              Kesehatan and Konsumsi dan Ketahanan Pangan (with wider slider
              spacing so both columns end at roughly the same height). The full
              list is shown — no capped scroll box — so every predictor is
              visible without an inner scroll. */}
            <div>
              <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
                <div className="space-y-4">
                  {leftGroups.map((group) => (
                    <PredictorSliderGroup
                      key={group.title}
                      title={group.title}
                      sliders={group.sliders}
                      values={values}
                      onValueChange={handleSliderChange}
                      formatValue={formatMetric}
                      roomy={group.roomy}
                    />
                  ))}
                </div>
                <div className="space-y-4">
                  {rightGroups.map((group) => (
                    <PredictorSliderGroup
                      key={group.title}
                      title={group.title}
                      sliders={group.sliders}
                      values={values}
                      onValueChange={handleSliderChange}
                      formatValue={formatMetric}
                      roomy={group.roomy}
                    />
                  ))}
                </div>
              </div>
              {!fit.converged ? (
                <p className="mt-4 text-xs text-muted-foreground">
                  {DASHBOARD_SIMULATOR.convergedNote}
                </p>
              ) : null}
            </div>

            {prediction !== null ? (
              <div className="safe-bottom fixed inset-x-0 bottom-0 z-sticky border-t border-border bg-surface/95 px-4 py-3 shadow-lg backdrop-blur lg:hidden">
                <div className="mx-auto flex max-w-6xl items-center gap-3">
                  <div className="shrink-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {DASHBOARD_SIMULATOR.predictedLabel}
                    </p>
                    <Badge tone={PREDICTION_BADGE_TONE[prediction.category]}>
                      {prediction.category}
                    </Badge>
                  </div>
                  <div className="flex h-2.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                    <span
                      className={PREDICTION_BAR_CLASS.Rendah}
                      style={{
                        width: `${prediction.probabilities.rendah * 100}%`,
                      }}
                    />
                    <span
                      className={PREDICTION_BAR_CLASS.Sedang}
                      style={{
                        width: `${prediction.probabilities.sedang * 100}%`,
                      }}
                    />
                    <span
                      className={PREDICTION_BAR_CLASS.Tinggi}
                      style={{
                        width: `${prediction.probabilities.tinggi * 100}%`,
                      }}
                    />
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
      </Card>
    </div>
  );
}
