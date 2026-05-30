"use client";

import { useState } from "react";

import { cn } from "@/lib/cn";
import type { NutritionEventDto } from "@/application/health-plan/dtos";
import { NUTRITION_PAGE_COPY } from "@/config/tracker";

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
 * terikat ke `recordNutritionEvent` / `deleteNutritionEvent`.
 *
 * Tab aktif default = `asi` (paling sering disentuh oleh orang tua bayi
 * baru); ditambah sentinel di URL `?tab=` jika di kemudian hari ingin
 * deep-link, tapi untuk Phase 5 cukup local state.
 */
export function NutritionTabs({
  childId,
  childAgeMonths,
  events,
}: NutritionTabsProps) {
  const [active, setActive] = useState<NutritionTabKey>("asi");

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label={NUTRITION_PAGE_COPY.title}
        className="flex flex-wrap gap-2"
      >
        {TAB_ORDER.map((key) => (
          <TabButton
            key={key}
            tabKey={key}
            label={NUTRITION_PAGE_COPY.tabs[key]}
            active={active === key}
            onSelect={setActive}
          />
        ))}
      </div>
      <div role="tabpanel" className="space-y-4">
        {active === "asi" ? (
          <NutritionAsiTab
            childId={childId}
            childAgeMonths={childAgeMonths}
            events={events}
          />
        ) : null}
        {active === "mpasi" ? (
          <NutritionMpasiTab
            childId={childId}
            childAgeMonths={childAgeMonths}
            events={events}
          />
        ) : null}
        {active === "vitA" ? (
          <NutritionVitaminATab
            childId={childId}
            childAgeMonths={childAgeMonths}
            events={events}
          />
        ) : null}
        {active === "cacing" ? (
          <NutritionDewormingTab
            childId={childId}
            childAgeMonths={childAgeMonths}
            events={events}
          />
        ) : null}
      </div>
    </div>
  );
}

function TabButton({
  tabKey,
  label,
  active,
  onSelect,
}: {
  readonly tabKey: NutritionTabKey;
  readonly label: string;
  readonly active: boolean;
  readonly onSelect: (key: NutritionTabKey) => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => onSelect(tabKey)}
      className={cn(
        "rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-surface-muted text-foreground hover:bg-surface",
      )}
    >
      {label}
    </button>
  );
}
