"use client";

import { useMemo, useState } from "react";

import type {
  ChildImmunizationDto,
  ImmunizationDto,
} from "@/application/health-plan/dtos";
import { EmptyState } from "@/components/primitives/empty-state";
import {
  IMMUNIZATION_TIMELINE_COPY,
  TRACKER_DASHBOARD_COPY,
} from "@/config/tracker";
import { computeImmunizationCellStatus } from "@/domain/health-plan/services/immunization-status";

import { ImmunizationCell } from "./immunization-cell";
import { ImmunizationDetailSheet } from "./immunization-detail-sheet";

export interface ImmunizationTimelineProps {
  readonly childId: string;
  readonly childBirthDate: string;
  readonly childAgeMonths: number;
  readonly schedule: readonly ImmunizationDto[];
  readonly records: readonly ChildImmunizationDto[];
}

interface ColumnGroup {
  readonly ageMonths: number;
  readonly items: readonly ImmunizationDto[];
}

function groupByAge(
  schedule: readonly ImmunizationDto[],
): readonly ColumnGroup[] {
  const map = new Map<number, ImmunizationDto[]>();
  for (const item of schedule) {
    const age = item.recommendedAgeMonths ?? -1;
    const arr = map.get(age) ?? [];
    arr.push(item);
    map.set(age, arr);
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([ageMonths, items]) => ({
      ageMonths,
      items: items.sort((a, b) => a.displayOrder - b.displayOrder),
    }));
}

/**
 * Timeline imunisasi: kolom per titik usia rekomendasi, isi sel per vaksin
 * yang jatuh tempo pada usia tersebut. Mobile-first horizontal scroll
 * dengan scroll-snap; di `md+` kolom muat semua dalam viewport tanpa scroll
 * untuk anak usia 0-18 bulan.
 *
 * Setiap sel adalah tombol; klik membuka `ImmunizationDetailSheet` yang
 * memuat penjelasan "mencegah apa" + tombol "tandai sudah".
 */
export function ImmunizationTimeline({
  childId,
  childBirthDate,
  childAgeMonths,
  schedule,
  records,
}: ImmunizationTimelineProps) {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const recordByCode = useMemo(() => {
    const map = new Map<string, ChildImmunizationDto>();
    for (const record of records) {
      map.set(record.immunizationCode, record);
    }
    return map;
  }, [records]);

  const columns = useMemo(() => groupByAge(schedule), [schedule]);

  if (columns.length === 0) {
    return (
      <EmptyState
        title={IMMUNIZATION_TIMELINE_COPY.emptyTitle}
        description={IMMUNIZATION_TIMELINE_COPY.emptyDescription}
      />
    );
  }

  const selectedItem =
    selectedCode === null
      ? null
      : (schedule.find((entry) => entry.code === selectedCode) ?? null);
  const selectedRecord =
    selectedCode === null ? null : (recordByCode.get(selectedCode) ?? null);

  return (
    <div className="space-y-3">
      <div className="-mx-1 snap-x snap-mandatory overflow-x-auto pb-2">
        <ul
          aria-label={IMMUNIZATION_TIMELINE_COPY.title}
          className="flex min-w-max gap-3 px-1"
        >
          {columns.map((column) => (
            <li
              key={column.ageMonths}
              className="flex w-32 snap-start flex-col gap-2"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {column.ageMonths >= 0
                  ? IMMUNIZATION_TIMELINE_COPY.ageColumnLabel(column.ageMonths)
                  : TRACKER_DASHBOARD_COPY.immunization.noSchedule}
              </p>
              {column.items.map((item) => {
                const record = recordByCode.get(item.code);
                const status = computeImmunizationCellStatus({
                  recommendedAgeMonths: item.recommendedAgeMonths,
                  childAgeMonths,
                  recordStatus: record?.status ?? null,
                });
                const ageHint =
                  item.recommendedAgeMonths !== null
                    ? TRACKER_DASHBOARD_COPY.immunization.ageFormat(
                        item.recommendedAgeMonths,
                      )
                    : TRACKER_DASHBOARD_COPY.immunization.noSchedule.toLowerCase();
                return (
                  <ImmunizationCell
                    key={item.code}
                    label={item.code}
                    status={status}
                    ariaLabel={`${item.name} (rekomendasi ${ageHint})`}
                    onClick={() => setSelectedCode(item.code)}
                  />
                );
              })}
            </li>
          ))}
        </ul>
      </div>
      <ImmunizationDetailSheet
        childId={childId}
        childBirthDate={childBirthDate}
        item={selectedItem}
        record={selectedRecord}
        onClose={() => setSelectedCode(null)}
      />
    </div>
  );
}
