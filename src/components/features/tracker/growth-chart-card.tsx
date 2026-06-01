"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import type {
  ChildDto,
  GrowthMeasurementDto,
} from "@/application/tracking/dtos";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { Skeleton } from "@/components/primitives/skeleton";
import { CHILD_DETAIL_COPY } from "@/config/tracker";
import { asDateOnly } from "@/domain/shared/date-only";
import { monthsBetween } from "@/domain/shared/age-months";
import { computeGrowthTrend } from "@/domain/tracking/services/growth-trend";
import type { GrowthIndicator } from "@/domain/tracking/value-objects/growth-indicator";
import { GROWTH_INDICATORS } from "@/domain/tracking/value-objects/growth-indicator";
import type { SdClass } from "@/domain/tracking/value-objects/sd-classification";
import { InfoDialog } from "@/components/primitives/info-dialog";

import { GrowthDetailSheet } from "./growth-detail-sheet";
import { GrowthTrendChip } from "./growth-trend-chip";
import { IndicatorTabs } from "./indicator-tabs";

const GrowthChart = dynamic(
  () => import("./growth-chart").then((m) => m.GrowthChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-72 w-full md:h-96" />,
  },
);

export interface GrowthChartCardProps {
  readonly child: ChildDto;
  readonly measurements: readonly GrowthMeasurementDto[];
}

/**
 * Phase 2 dashboard surface untuk modul Pertumbuhan. Mengomposisikan:
 *   - Header card (judul + deskripsi)
 *   - Trend chip (klasifikasi delta z dua pengukuran terbaru)
 *   - Indicator tabs (pengganti Select)
 *   - Kurva pertumbuhan dengan zona gradient + click-to-detail
 *   - Fun-size comparison card di sisi
 *   - Bottom sheet detail saat user mengetuk dot
 *
 * Recharts tetap dynamic-imported (ssr:false) untuk menjaga bundle initial
 * tetap di bawah budget (project guidelines §7).
 */
export function GrowthChartCard({ child, measurements }: GrowthChartCardProps) {
  const [indicator, setIndicator] = useState<GrowthIndicator>("TB_U");
  const [selectedMeasurement, setSelectedMeasurement] =
    useState<GrowthMeasurementDto | null>(null);

  const sortedByDate = useMemo(() => {
    return measurements
      .slice()
      .sort((a, b) => (a.measuredAt < b.measuredAt ? 1 : -1));
  }, [measurements]);

  const latestSdClass = useMemo<
    Partial<Record<GrowthIndicator, SdClass>>
  >(() => {
    const map: Partial<Record<GrowthIndicator, SdClass>> = {};
    for (const code of GROWTH_INDICATORS) {
      for (const m of sortedByDate) {
        const sd = m.sdClass[code] as SdClass | undefined;
        if (sd) {
          map[code] = sd;
          break;
        }
      }
    }
    return map;
  }, [sortedByDate]);

  const trend = useMemo(
    () => computeGrowthTrend(sortedByDate, indicator),
    [sortedByDate, indicator],
  );

  const selectedAgeMonths = useMemo(() => {
    if (!selectedMeasurement) return null;
    return monthsBetween(
      asDateOnly(child.birthDate),
      asDateOnly(selectedMeasurement.measuredAt),
    );
  }, [child.birthDate, selectedMeasurement]);

  return (
    <Card className="transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">
            {CHILD_DETAIL_COPY.chartCardTitle}
          </CardTitle>
          <InfoDialog
            title={CHILD_DETAIL_COPY.chartCardTitle}
            description={CHILD_DETAIL_COPY.chartCardDescription}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <IndicatorTabs
          value={indicator}
          onChange={setIndicator}
          latestSdClass={latestSdClass}
        />
        <GrowthTrendChip result={trend} />
        <GrowthChart
          child={child}
          measurements={sortedByDate}
          indicator={indicator}
          onSelectMeasurement={setSelectedMeasurement}
        />
      </CardContent>
      <GrowthDetailSheet
        measurement={selectedMeasurement}
        ageMonths={selectedAgeMonths}
        onClose={() => setSelectedMeasurement(null)}
      />
    </Card>
  );
}
