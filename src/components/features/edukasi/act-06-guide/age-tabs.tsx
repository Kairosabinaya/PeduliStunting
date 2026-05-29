"use client";

// ACT 6 — Tabs untuk panduan per usia. Desktop: header tab horizontal +
// content swap. Mobile (<md): native accordion (semua tab terbuka tapi
// di-collapse satu per satu). Keyboard support: Left/Right untuk pindah
// tab, plus aria-controls / aria-selected per WAI-ARIA tablist pattern.

import { useId, useState, useCallback, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/cn";
import { GUIDE_COPY } from "@/config/edukasi";
import { GUIDE_TABS, type GuideTab } from "@/data/edukasi/guide-content";

const CALLOUT_TONE_CLASS = {
  warning: "border-edu-flag/40 bg-edu-flag/8 text-foreground",
  success: "border-accent/40 bg-accent/10 text-foreground",
  info: "border-primary/40 bg-primary/8 text-foreground",
} as const;

function GuideTabContent({ tab }: { readonly tab: GuideTab }) {
  return (
    <div>
      <h3 className="text-2xl font-bold text-foreground sm:text-3xl">
        {tab.headline}
      </h3>
      <p className="mt-3 max-w-3xl text-base text-muted-foreground sm:text-lg">
        {tab.lead}
      </p>
      {tab.callouts.length > 0 ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {tab.callouts.map((callout) => (
            <aside
              key={callout.title}
              className={cn(
                "rounded-xl border p-4",
                CALLOUT_TONE_CLASS[callout.tone],
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {callout.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed">{callout.body}</p>
            </aside>
          ))}
        </div>
      ) : null}
      {/* Each column wraps as its own card. Previous layout had four bare
          columns side-by-side at lg+, which under variable content lengths
          read as a wall of bullets with no visual containment — "berantakan".
          A 2-column grid with bordered cards gives clean groupings, breath,
          and consistent rhythm regardless of list length. */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {tab.columns.map((column) => (
          <div
            key={column.heading}
            className="rounded-2xl border border-border bg-surface/60 p-5 sm:p-6"
          >
            <h4 className="text-sm font-bold tracking-tight text-foreground">
              {column.heading}
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-foreground/85">
              {column.items.map((item) => (
                <li key={item} className="grid grid-cols-[1rem_1fr] gap-2">
                  <span
                    aria-hidden="true"
                    className="leading-relaxed text-primary"
                  >
                    •
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-8 text-xs text-muted-foreground">
        {GUIDE_COPY.sourceLabel}: {tab.sourceLabel}
      </p>
    </div>
  );
}

export function AgeTabs() {
  const [activeId, setActiveId] = useState<string>(GUIDE_TABS[0]?.id ?? "");
  const reduceMotion = useReducedMotion();
  const tablistId = useId();
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex =
        (currentIndex + delta + GUIDE_TABS.length) % GUIDE_TABS.length;
      const nextTab = GUIDE_TABS[nextIndex];
      if (!nextTab) return;
      setActiveId(nextTab.id);
      tabRefs.current.get(nextTab.id)?.focus();
    },
    [],
  );

  const firstTab = GUIDE_TABS[0];
  const activeTab = GUIDE_TABS.find((t) => t.id === activeId) ?? firstTab;
  if (!activeTab) return null;

  return (
    <div>
      <div
        role="tablist"
        aria-label={GUIDE_COPY.tablistAriaLabel}
        id={tablistId}
        className="flex flex-wrap gap-2 border-b border-border pb-3"
      >
        {GUIDE_TABS.map((tab, index) => {
          const active = activeId === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current.set(tab.id, el);
                else tabRefs.current.delete(tab.id);
              }}
              role="tab"
              type="button"
              aria-selected={active}
              aria-controls={`${tablistId}-panel-${tab.id}`}
              id={`${tablistId}-tab-${tab.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => setActiveId(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-surface text-foreground hover:bg-surface-muted",
              )}
            >
              <span>{tab.label}</span>
              <span className="ml-2 hidden text-xs font-medium uppercase tracking-wider opacity-70 sm:inline">
                {tab.subLabel}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${tablistId}-panel-${activeTab.id}`}
        aria-labelledby={`${tablistId}-tab-${activeTab.id}`}
        className="mt-8"
      >
        <motion.div
          key={activeTab.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.15, ease: [0.2, 0, 0, 1] }
          }
        >
          <GuideTabContent tab={activeTab} />
        </motion.div>
      </div>
    </div>
  );
}
