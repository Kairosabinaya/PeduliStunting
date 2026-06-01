"use client";

import { useMemo, useState } from "react";
import {
  Brush,
  HeartHandshake,
  MessageCircle,
  PersonStanding,
} from "lucide-react";

import type {
  ChildMilestoneDto,
  MilestoneDto,
} from "@/application/health-plan/dtos";
import { EmptyState } from "@/components/primitives/empty-state";
import { MILESTONE_COPY, MILESTONE_DOMAIN_LABEL } from "@/config/tracker";
import {
  MILESTONE_DOMAINS,
  type MilestoneDomain,
} from "@/domain/health-plan/entities/milestone";
import { filterMilestonesByMode } from "@/domain/health-plan/services/milestone-status";

import { MilestoneCard } from "./milestone-card";
import {
  MilestoneRangeFilter,
  type MilestoneRangeMode,
} from "./milestone-range-filter";

const DOMAIN_ICON_MAP: Record<MilestoneDomain, typeof PersonStanding> = {
  gross_motor: PersonStanding,
  fine_motor: Brush,
  language: MessageCircle,
  social: HeartHandshake,
};

export interface MilestoneChecklistProps {
  readonly childId: string;
  readonly childBirthDate: string;
  readonly childAgeMonths: number;
  readonly catalog: readonly MilestoneDto[];
  readonly records: readonly ChildMilestoneDto[];
}

function indexByMilestoneId(
  records: readonly ChildMilestoneDto[],
): ReadonlyMap<string, ChildMilestoneDto> {
  const map = new Map<string, ChildMilestoneDto>();
  for (const record of records) {
    map.set(record.milestoneId, record);
  }
  return map;
}

function groupByDomain(
  catalog: readonly MilestoneDto[],
): ReadonlyMap<MilestoneDomain, readonly MilestoneDto[]> {
  const groups = new Map<MilestoneDomain, MilestoneDto[]>();
  for (const domain of MILESTONE_DOMAINS) {
    groups.set(domain, []);
  }
  for (const item of catalog) {
    const bucket = groups.get(item.domain);
    if (!bucket) continue;
    bucket.push(item);
  }
  for (const [domain, items] of groups) {
    items.sort((a, b) => {
      if (a.minAgeMonths !== b.minAgeMonths)
        return a.minAgeMonths - b.minAgeMonths;
      return a.displayOrder - b.displayOrder;
    });
    groups.set(domain, items);
  }
  return groups;
}

/**
 * Render katalog SDIDTK sebagai grid `MilestoneCard` yang dikelompokkan per
 * domain perkembangan. Pengguna dapat memfilter mode "rentang anak saat ini"
 * (default) atau "semua rentang".
 *
 * Tiap card mengelola `useActionState`-nya sendiri agar simpan satu kartu
 * tidak mereset card lain (lihat `MilestoneCard`).
 */
export function MilestoneChecklist({
  childId,
  childBirthDate,
  childAgeMonths,
  catalog,
  records,
}: MilestoneChecklistProps) {
  const [mode, setMode] = useState<MilestoneRangeMode>("current");

  const filtered = useMemo(
    () => filterMilestonesByMode(catalog, childAgeMonths, mode),
    [catalog, childAgeMonths, mode],
  );

  const byMilestoneId = useMemo(() => indexByMilestoneId(records), [records]);
  const groups = useMemo(() => groupByDomain(filtered), [filtered]);

  if (catalog.length === 0) {
    return (
      <EmptyState
        title={MILESTONE_COPY.emptyTitle}
        description={MILESTONE_COPY.emptyDescription}
      />
    );
  }

  return (
    <div className="space-y-6">
      <MilestoneRangeFilter
        value={mode}
        onChange={setMode}
        childAgeMonths={childAgeMonths}
      />
      {MILESTONE_DOMAINS.map((domain) => {
        const items = groups.get(domain) ?? [];
        if (items.length === 0) return null;
        const Icon = DOMAIN_ICON_MAP[domain];
        return (
          <section key={domain} className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Icon size={16} aria-hidden className="text-primary" />
              {MILESTONE_DOMAIN_LABEL[domain]}
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {items.map((item) => (
                <MilestoneCard
                  key={item.id}
                  childId={childId}
                  childBirthDate={childBirthDate}
                  milestone={item}
                  record={byMilestoneId.get(item.id)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
