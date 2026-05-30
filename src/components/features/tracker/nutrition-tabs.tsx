"use client";

import { useId, useState } from "react";

import type { NutritionEventDto } from "@/application/health-plan/dtos";
import { NUTRITION_PAGE_COPY } from "@/config/tracker";
import {
  SegmentedControl,
  segmentedPanelProps,
  type SegmentedControlItem,
} from "@/components/primitives/segmented-control";

import { NutritionAsiTab } from "./nutrition-asi-tab";
import { NutritionDewormingTab } from "./nutrition-deworming-tab";
import { NutritionMpasiTab } from "./nutrition-mpasi-tab";
import { NutritionVitaminATab } from "./nutrition-vitamin-a-tab";

export type NutritionTabKey = "asi" | "mpasi" | "vitA" | "cacing";

const TAB_ORDER: readonly NutritionTabKey[] = [
  "asi",
  "mpasi",
  "vitA",
  "cacing",
];

export interface NutritionTabsProps {
  readonly childId: string;
  readonly childAgeMonths: number;
  readonly events: readonly NutritionEventDto[];
}

/**
 * Tab navigator untuk modul Gizi. Empat tab — ASI, MPASI, Vitamin A, Obat
 * cacing — masing-masing pure Client Component dengan `useActionState`
 * terikat ke `recordNutritionEvent` / `deleteNutritionEvent`. Memakai
 * primitive {@link SegmentedControl} bersama agar gaya tab konsisten dengan
 * modul lain. Tab aktif default = `asi` (paling sering disentuh orang tua
 * bayi baru).
 */
export function NutritionTabs({
  childId,
  childAgeMonths,
  events,
}: NutritionTabsProps) {
  const [active, setActive] = useState<NutritionTabKey>("asi");
  const base = useId();

  const items: readonly SegmentedControlItem<NutritionTabKey>[] = TAB_ORDER.map(
    (key) => ({ id: key, label: NUTRITION_PAGE_COPY.tabs[key] }),
  );

  return (
    <div className="space-y-4">
      <SegmentedControl
        ariaLabel={NUTRITION_PAGE_COPY.title}
        value={active}
        onValueChange={setActive}
        idBase={base}
        items={items}
      />
      {active === "asi" ? (
        <div {...segmentedPanelProps(base, "asi", true)} className="space-y-4">
          <NutritionAsiTab
            childId={childId}
            childAgeMonths={childAgeMonths}
            events={events}
          />
        </div>
      ) : null}
      {active === "mpasi" ? (
        <div
          {...segmentedPanelProps(base, "mpasi", true)}
          className="space-y-4"
        >
          <NutritionMpasiTab
            childId={childId}
            childAgeMonths={childAgeMonths}
            events={events}
          />
        </div>
      ) : null}
      {active === "vitA" ? (
        <div {...segmentedPanelProps(base, "vitA", true)} className="space-y-4">
          <NutritionVitaminATab
            childId={childId}
            childAgeMonths={childAgeMonths}
            events={events}
          />
        </div>
      ) : null}
      {active === "cacing" ? (
        <div
          {...segmentedPanelProps(base, "cacing", true)}
          className="space-y-4"
        >
          <NutritionDewormingTab
            childId={childId}
            childAgeMonths={childAgeMonths}
            events={events}
          />
        </div>
      ) : null}
    </div>
  );
}
