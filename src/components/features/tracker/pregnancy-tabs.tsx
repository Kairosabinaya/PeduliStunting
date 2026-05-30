"use client";

import { useId, useState } from "react";

import type {
  PregnancyDto,
  PregnancyEventDto,
} from "@/application/pregnancy/dtos";
import { PREGNANCY_PAGE_COPY } from "@/config/tracker";
import {
  SegmentedControl,
  segmentedPanelProps,
  type SegmentedControlItem,
} from "@/components/primitives/segmented-control";
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

/**
 * Tab navigator untuk modul Kehamilan (Profil, ANC, TTD, Berat, Janin) di atas
 * primitive {@link SegmentedControl} bersama agar konsisten dengan modul lain.
 */
export function PregnancyTabs({
  pregnancy,
  overview,
  events,
}: PregnancyTabsProps) {
  const [active, setActive] = useState<PregnancyTabKey>("profile");
  const base = useId();

  const items: readonly SegmentedControlItem<PregnancyTabKey>[] = TAB_ORDER.map(
    (key) => ({ id: key, label: PREGNANCY_PAGE_COPY.tabs[key] }),
  );

  return (
    <div className="space-y-4">
      <SegmentedControl
        ariaLabel={PREGNANCY_PAGE_COPY.title}
        value={active}
        onValueChange={setActive}
        idBase={base}
        items={items}
      />
      {active === "profile" ? (
        <div
          {...segmentedPanelProps(base, "profile", true)}
          className="space-y-4"
        >
          <PregnancyProfileForm pregnancy={pregnancy} />
        </div>
      ) : null}
      {active === "anc" ? (
        <div {...segmentedPanelProps(base, "anc", true)} className="space-y-4">
          <PregnancyAncTab pregnancyId={pregnancy.id} events={events} />
        </div>
      ) : null}
      {active === "ttd" ? (
        <div {...segmentedPanelProps(base, "ttd", true)} className="space-y-4">
          <PregnancyTtdTab pregnancyId={pregnancy.id} events={events} />
        </div>
      ) : null}
      {active === "weight" ? (
        <div
          {...segmentedPanelProps(base, "weight", true)}
          className="space-y-4"
        >
          <PregnancyWeightTab
            pregnancyId={pregnancy.id}
            initialWeightKg={pregnancy.initialWeightKg}
            heightCm={pregnancy.heightCm}
            events={events}
          />
        </div>
      ) : null}
      {active === "fetal" ? (
        <div
          {...segmentedPanelProps(base, "fetal", true)}
          className="space-y-4"
        >
          <PregnancyFetalTab weeks={overview.gestational.weeks} />
        </div>
      ) : null}
    </div>
  );
}
