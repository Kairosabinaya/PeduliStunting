"use client";

// Client tab switcher. The three sections are passed in as already server-
// rendered ReactNodes (so server-only pieces like the choropleth stay on the
// server); we only mount the ACTIVE panel's content, which both trims the DOM
// and lets charts measure correctly (Recharts can't size a display:none parent).

import { useId, useState, type ReactNode } from "react";
import { Brain, LineChart, SlidersHorizontal } from "lucide-react";

import {
  SegmentedControl,
  segmentedPanelProps,
  type SegmentedControlItem,
} from "@/components/primitives/segmented-control";
import { DASHBOARD_SECTIONS } from "@/config/dashboard";

type TabKey = "insight" | "model" | "simulator";

export interface DashboardTabsProps {
  readonly insight: ReactNode;
  readonly model: ReactNode;
  readonly simulator: ReactNode;
}

const TABS: readonly {
  readonly id: TabKey;
  readonly icon: typeof LineChart;
}[] = [
  { id: "insight", icon: LineChart },
  { id: "model", icon: Brain },
  { id: "simulator", icon: SlidersHorizontal },
];

const TAB_LABEL: Record<TabKey, string> = {
  insight: DASHBOARD_SECTIONS.insight.title,
  model: DASHBOARD_SECTIONS.model.title,
  simulator: DASHBOARD_SECTIONS.simulator.title,
};

export function DashboardTabs({
  insight,
  model,
  simulator,
}: DashboardTabsProps) {
  const [active, setActive] = useState<TabKey>("insight");
  const base = useId();
  const panels: Record<TabKey, ReactNode> = { insight, model, simulator };

  const items: readonly SegmentedControlItem<TabKey>[] = TABS.map(
    ({ id, icon: Icon }) => ({
      id,
      label: (
        <span className="flex items-center gap-2">
          <Icon size={16} aria-hidden />
          {TAB_LABEL[id]}
        </span>
      ),
    }),
  );

  return (
    <div className="space-y-8">
      <div className="sticky top-20 z-sticky -mx-1 rounded-2xl bg-background/70 px-1 py-2 backdrop-blur md:top-24">
        <SegmentedControl
          ariaLabel="Bagian dashboard"
          value={active}
          onValueChange={setActive}
          idBase={base}
          items={items}
          className="justify-start overflow-x-auto sm:justify-center"
        />
      </div>
      {TABS.map(({ id }) => (
        <div key={id} {...segmentedPanelProps(base, id, active === id)}>
          {active === id ? panels[id] : null}
        </div>
      ))}
    </div>
  );
}
