"use client";

import dynamic from "next/dynamic";

import type {
  ChildDto,
  GrowthMeasurementDto,
} from "@/application/tracking/dtos";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/primitives/card";
import { Skeleton } from "@/components/primitives/skeleton";
import { CHILD_DETAIL_COPY } from "@/config/tracker";

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
 * Card wrapper that lazily loads the Recharts bundle only when the detail
 * page actually mounts. Keeps the initial JS payload of routes that do not
 * render a chart under the per-route budget (project guidelines §7).
 */
export function GrowthChartCard({ child, measurements }: GrowthChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{CHILD_DETAIL_COPY.chartCardTitle}</CardTitle>
        <CardDescription>
          {CHILD_DETAIL_COPY.chartCardDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <GrowthChart child={child} measurements={measurements} />
      </CardContent>
    </Card>
  );
}
