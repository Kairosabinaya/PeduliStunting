"use client";

// ACT 6 — Tabs untuk panduan per usia. Desktop: header tab horizontal +
// content swap. Mobile (<md): native accordion (semua tab terbuka tapi
// di-collapse satu per satu). Keyboard support: Left/Right untuk pindah
// tab, plus aria-controls / aria-selected per WAI-ARIA tablist pattern.

import { useId, useState, useCallback, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/cn";
import { SegmentedControl } from "@/components/primitives/segmented-control";
import { GUIDE_COPY } from "@/config/edukasi";
import { GUIDE_TABS, type GuideTab } from "@/data/edukasi/guide-content";

const CALLOUT_TONE_CLASS = {
  warning: "border-edu-flag/40 bg-edu-flag/8 text-foreground",
  success: "border-accent/40 bg-accent/10 text-foreground",
  info: "border-primary/40 bg-primary/8 text-foreground",
} as const;

function GuideTabContent({ tab }: { readonly tab: GuideTab }) {
  // Mobile only: which advice category column is visible. Desktop (lg+) shows
  // all four side by side. GuideTabContent is keyed by phase in AgeTabs, so it
  // remounts on phase change and this resets to the first category.
  const [activeCategory, setActiveCategory] = useState("c0");
  const catBase = useId();
  const categoryItems = tab.columns.map((column, index) => ({
    id: `c${index}`,
    label: column.heading,
  }));

  return (
    <div>
      <h3 className="text-xl font-bold text-foreground sm:text-2xl">
        {tab.headline}
      </h3>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
        {tab.lead}
      </p>

      {tab.callouts.length > 0 ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {tab.callouts.map((callout) => (
            <aside
              key={callout.title}
              className={cn(
                "rounded-xl border p-3 transition-[transform,box-shadow] duration-fast hover:-translate-y-0.5 hover:shadow-sm motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                CALLOUT_TONE_CLASS[callout.tone],
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {callout.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed">{callout.body}</p>
            </aside>
          ))}
        </div>
      ) : null}

      {/* Mobile: a category switcher so only one column shows at a time,
          keeping each phase within one screen. Hidden on lg+ where the four
          columns sit side by side. */}
      <div className="mt-5 lg:hidden">
        <SegmentedControl
          idBase={catBase}
          ariaLabel={GUIDE_COPY.categorySelectLabel}
          value={activeCategory}
          onValueChange={setActiveCategory}
          items={categoryItems}
        />
      </div>

      {/* Four advice columns. No inner scroll — the column grows to fit its
          bullets; on desktop the `lg:grid-cols-4` grid stretches all four to
          the tallest so they stay equal height, with `.edu-guide-col` giving a
          min-height floor. On mobile only the active category shows. */}
      <div className="mt-4 grid gap-4 lg:mt-6 lg:grid-cols-4">
        {tab.columns.map((column, index) => {
          const categoryId = `c${index}`;
          const isActive = categoryId === activeCategory;
          return (
            <div
              key={column.heading}
              id={`${catBase}-${categoryId}-panel`}
              className={cn(
                "edu-guide-col rounded-2xl border border-border bg-surface/60 p-4 sm:p-5",
                !isActive && "hidden lg:block",
              )}
            >
              <h4 className="text-sm font-bold tracking-tight text-foreground">
                {column.heading}
              </h4>
              <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-foreground/85">
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
          );
        })}
      </div>

      <p className="mt-5 text-xs text-muted-foreground">
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
        // Single no-wrap line: all five phases fit on one row on desktop and
        // scroll horizontally on narrow phones (no two-line wrap).
        className="scrollbar-hide flex gap-2 overflow-x-auto border-b border-border pb-3"
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
                "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-surface text-foreground hover:bg-surface-muted",
              )}
            >
              {tab.label}
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
