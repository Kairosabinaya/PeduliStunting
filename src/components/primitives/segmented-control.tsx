"use client";

import Link from "next/link";
import { useId, type ReactNode } from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/cn";

/**
 * Shared segmented-control styling for the two switching patterns used across
 * the app: route navigation (a row of links, active by URL) and in-page tabs
 * (a row of pills, active by local state). Both share one visual language so
 * `ChildNav`, `IndicatorTabs`, `NutritionTabs`, `PregnancyTabs`, etc. stop
 * diverging (see the tracker UI audit). Active is always
 * `bg-primary text-primary-foreground`; targets are ≥44px; the list scrolls
 * horizontally on narrow screens.
 */

const segmentedListVariants = cva("flex gap-1", {
  variants: {
    variant: {
      // Bordered container for route navigation (replaces the old ChildNav).
      nav: "scrollbar-hide -mx-1 overflow-x-auto rounded-xl border border-border bg-surface p-1",
      // Free-flowing pills for in-page tab state.
      pills: "flex-wrap",
    },
  },
  defaultVariants: { variant: "pills" },
});

const segmentedItemVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        nav: "rounded-lg px-3",
        pills: "rounded-full px-3 py-1.5",
      },
      active: { true: "", false: "" },
    },
    compoundVariants: [
      {
        active: true,
        class: "bg-primary text-primary-foreground",
      },
      {
        variant: "nav",
        active: false,
        class:
          "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
      },
      {
        variant: "pills",
        active: false,
        class: "bg-surface-muted text-foreground hover:bg-surface",
      },
    ],
    defaultVariants: { variant: "pills", active: false },
  },
);

/* ─────────────────────────── Route navigation ──────────────────────────── */

export interface SegmentedNavItem {
  readonly href: string;
  readonly label: string;
  /** Whether this item matches the current route (consumer computes it). */
  readonly active: boolean;
}

export interface SegmentedNavProps {
  readonly items: readonly SegmentedNavItem[];
  readonly ariaLabel: string;
  readonly className?: string;
}

/**
 * Segmented route navigation — a bordered row of links, one per sub-route, the
 * active one highlighted. Use inside a layout to switch between sibling pages.
 *
 * @example
 * ```tsx
 * <SegmentedNav
 *   ariaLabel="Navigasi detail anak"
 *   items={[
 *     { href: "/tracker/anak/1", label: "Ringkasan", active: true },
 *     { href: "/tracker/anak/1/pengukuran", label: "Pengukuran", active: false },
 *   ]}
 * />
 * ```
 */
export function SegmentedNav({
  items,
  ariaLabel,
  className,
}: SegmentedNavProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn(segmentedListVariants({ variant: "nav" }), className)}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? "page" : undefined}
          className={segmentedItemVariants({
            variant: "nav",
            active: item.active,
          })}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

/* ───────────────────────────── In-page tabs ────────────────────────────── */

export interface SegmentedControlItem<T extends string> {
  readonly id: T;
  readonly label: ReactNode;
  /**
   * Optional trailing content (e.g. a status badge). A function form receives
   * the active state so the consumer can adapt styling to the active pill.
   */
  readonly trailing?: ReactNode | ((active: boolean) => ReactNode);
}

export interface SegmentedControlProps<T extends string> {
  readonly items: readonly SegmentedControlItem<T>[];
  readonly value: T;
  readonly onValueChange: (next: T) => void;
  readonly ariaLabel: string;
  /**
   * Stable base for the tab/panel ids. When omitted a `useId()` is generated;
   * pass an explicit base when the consumer renders matching panels via
   * {@link segmentedPanelProps}.
   */
  readonly idBase?: string;
  readonly className?: string;
}

/**
 * Segmented in-page tabs — a row of pills bound to local state. Pair the panel
 * containers with {@link segmentedPanelProps} for correct `tabpanel` wiring.
 *
 * @example
 * ```tsx
 * const [tab, setTab] = useState<"asi" | "mpasi">("asi");
 * <SegmentedControl
 *   ariaLabel="Sub-modul gizi"
 *   value={tab}
 *   onValueChange={setTab}
 *   items={[{ id: "asi", label: "ASI" }, { id: "mpasi", label: "MPASI" }]}
 * />
 * ```
 */
export function SegmentedControl<T extends string>({
  items,
  value,
  onValueChange,
  ariaLabel,
  idBase,
  className,
}: SegmentedControlProps<T>) {
  const autoId = useId();
  const base = idBase ?? autoId;
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(segmentedListVariants({ variant: "pills" }), className)}
    >
      {items.map((item) => {
        const active = item.id === value;
        const trailing =
          typeof item.trailing === "function"
            ? item.trailing(active)
            : item.trailing;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`${base}-${item.id}-tab`}
            aria-selected={active}
            // `aria-controls` must reference an element that exists in the
            // DOM (axe `aria-valid-attr-value`). Only consumers that pass an
            // explicit `idBase` render matching panels via
            // `segmentedPanelProps`; auto-id consumers filter content
            // in place and have no discrete panel element to point at.
            aria-controls={
              idBase !== undefined ? `${base}-${item.id}-panel` : undefined
            }
            onClick={() => onValueChange(item.id)}
            className={segmentedItemVariants({ variant: "pills", active })}
          >
            <span>{item.label}</span>
            {trailing ?? null}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Props for a tab panel that pairs with {@link SegmentedControl}. Spread onto
 * the panel container so screen readers associate it with its tab and hide the
 * inactive panels.
 *
 * @example
 * ```tsx
 * <div {...segmentedPanelProps(base, "asi", tab === "asi")}>…</div>
 * ```
 */
export function segmentedPanelProps(
  idBase: string,
  id: string,
  active: boolean,
): {
  readonly id: string;
  readonly role: "tabpanel";
  readonly "aria-labelledby": string;
  readonly hidden: boolean;
} {
  return {
    id: `${idBase}-${id}-panel`,
    role: "tabpanel",
    "aria-labelledby": `${idBase}-${id}-tab`,
    hidden: !active,
  };
}
