"use client";

/**
 * Always-visible tabbed info card. Replaces the older "ⓘ" popover trigger
 * by rendering the same two surfaces (Kategori stunting + Panduan peta)
 * inline, so the user does not need to open anything to read them.
 *
 * Two tabs are kept (rather than stacking both lists vertically) so the
 * card stays compact and does not crowd the bottom-left corner.
 */

import { useState } from "react";

import { COPYRIGHT_NOTICE } from "@/config/app";
import {
  CATEGORY_BG_CLASS,
  CATEGORY_ORDER,
  STUNTING_CATEGORY_THRESHOLDS,
  STUNTING_INFO_COPY,
} from "@/config/map";
import { cn } from "@/lib/cn";

const PANDUAN_ITEMS: readonly string[] = [
  "Klik wilayah untuk membuka detail prevalensi.",
  "Pilih tahun untuk membandingkan periode.",
  "Hover wilayah untuk pratinjau cepat tanpa membuka detail.",
  "Klik laut untuk menutup detail dan kembali ke tampilan Indonesia.",
];

type Tab = "kategori" | "panduan";

const TAB_COPY: Record<Tab, string> = {
  kategori: "Kategori stunting",
  panduan: "Panduan peta",
};

export type MapInfoCardVariant = "floating" | "inline";

export interface MapInfoCardProps {
  /**
   * `floating` renders the standalone glass card used on desktop (bottom-
   * left of `/map`). `inline` removes the chrome so the card slots
   * naturally into the mobile bottom-sheet content area without nesting
   * `glass-panel` inside `glass-panel`.
   */
  readonly variant?: MapInfoCardVariant;
  readonly className?: string;
}

export function MapInfoCard({
  variant = "floating",
  className,
}: MapInfoCardProps) {
  const [tab, setTab] = useState<Tab>("kategori");
  const isInline = variant === "inline";

  return (
    <section
      aria-label="Informasi peta"
      className={cn(
        isInline
          ? "w-full"
          : "glass-panel w-[min(20rem,calc(100vw-1.5rem))] rounded-2xl p-3 shadow-md",
        className,
      )}
    >
      <div
        role="tablist"
        aria-label="Tab informasi peta"
        className="mb-3 flex items-center gap-1 rounded-xl bg-surface-muted p-1"
      >
        {(Object.keys(TAB_COPY) as Tab[]).map((key) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(key)}
              className={cn(
                "flex min-h-11 flex-1 items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                active
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {TAB_COPY[key]}
            </button>
          );
        })}
      </div>

      <div>{tab === "kategori" ? <KategoriPanel /> : <PanduanPanel />}</div>

      {/* `/map` is a full-bleed surface with no room for a footer, so the
          site-wide copyright rides at the bottom of this always-visible info
          card instead. */}
      <p className="mt-3 border-t border-border pt-2 text-center text-xs text-muted-foreground">
        {COPYRIGHT_NOTICE}
      </p>
    </section>
  );
}

function KategoriPanel() {
  return (
    <ul className="space-y-2 text-sm">
      {CATEGORY_ORDER.map((category) => {
        const copy = STUNTING_INFO_COPY.categories[category];
        return (
          <li
            key={category}
            className="flex items-center justify-between gap-3"
          >
            <span className="flex items-center gap-2.5">
              <span
                aria-hidden
                className={cn(
                  "inline-block h-3 w-3 shrink-0 rounded-full",
                  CATEGORY_BG_CLASS[category],
                )}
              />
              <span className="font-semibold text-foreground">
                {copy.headline}
              </span>
            </span>
            <span className="font-mono text-xs tabular-nums text-muted-foreground">
              {STUNTING_CATEGORY_THRESHOLDS[category].label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function PanduanPanel() {
  return (
    <ol className="space-y-2 text-sm">
      {PANDUAN_ITEMS.map((text, idx) => (
        <li key={text} className="flex gap-2.5">
          <span
            aria-hidden
            className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary"
          >
            {idx + 1}
          </span>
          <span className="text-foreground">{text}</span>
        </li>
      ))}
    </ol>
  );
}
