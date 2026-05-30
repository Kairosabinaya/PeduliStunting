"use client";

import { useState } from "react";

import type {
  PregnancyDto,
  PregnancyEventDto,
} from "@/application/pregnancy/dtos";
import { cn } from "@/lib/cn";
import { PREGNANCY_PAGE_COPY } from "@/config/tracker";
import type { PregnancyOverview } from "@/domain/pregnancy/services/pregnancy-status";

import { PregnancyAncTab } from "./pregnancy-anc-tab";
import { PregnancyFetalTab } from "./pregnancy-fetal-tab";
import { PregnancyProfileForm } from "./pregnancy-profile-form";
import { PregnancyTtdTab } from "./pregnancy-ttd-tab";
import { PregnancyWeightTab } from "./pregnancy-weight-tab";

export type PregnancyTabKey = "profile" | "anc" | "ttd" | "weight" | "fetal";

const TAB_ORDER: readonly PregnancyTabKey[] = [
  "profile",
  "anc",
  "ttd",
  "weight",
  "fetal",
];

export interface PregnancyTabsProps {
  readonly pregnancy: PregnancyDto;
  readonly overview: PregnancyOverview;
  readonly events: readonly PregnancyEventDto[];
}

export function PregnancyTabs({
  pregnancy,
  overview,
  events,
}: PregnancyTabsProps) {
  const [active, setActive] = useState<PregnancyTabKey>("profile");

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label={PREGNANCY_PAGE_COPY.title}
        className="flex flex-wrap gap-2"
      >
        {TAB_ORDER.map((key) => (
          <TabButton
            key={key}
            tabKey={key}
            label={PREGNANCY_PAGE_COPY.tabs[key]}
            active={active === key}
            onSelect={setActive}
          />
        ))}
      </div>
      <div role="tabpanel" className="space-y-4">
        {active === "profile" ? (
          <PregnancyProfileForm pregnancy={pregnancy} />
        ) : null}
        {active === "anc" ? (
          <PregnancyAncTab pregnancyId={pregnancy.id} events={events} />
        ) : null}
        {active === "ttd" ? (
          <PregnancyTtdTab pregnancyId={pregnancy.id} events={events} />
        ) : null}
        {active === "weight" ? (
          <PregnancyWeightTab
            pregnancyId={pregnancy.id}
            initialWeightKg={pregnancy.initialWeightKg}
            heightCm={pregnancy.heightCm}
            events={events}
          />
        ) : null}
        {active === "fetal" ? (
          <PregnancyFetalTab weeks={overview.gestational.weeks} />
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
  readonly tabKey: PregnancyTabKey;
  readonly label: string;
  readonly active: boolean;
  readonly onSelect: (key: PregnancyTabKey) => void;
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
