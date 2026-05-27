"use client";

/**
 * Map search input + results dropdown. Lives inside the `/map` header.
 *
 * Behaviour mirrors Google Maps' lightweight prompt: results show on type,
 * arrow keys cycle, Enter commits, Escape clears. Selecting a hit dispatches
 * to `useMapState.setWilayah` so the existing detail flow (sheet swap on
 * mobile, side panel on desktop) reacts without us having to coordinate
 * anything extra.
 *
 * The dropdown is **portaled to document.body** because the parent `<header>`
 * creates its own stacking context (position: fixed + z-index: header). The
 * mobile bottom sheet sits at a higher root-level z-index than the header,
 * so without the portal the dropdown was being painted *underneath* the
 * sheet even though its `z-popover` value was numerically higher. Portaling
 * lifts the dropdown into the root stacking context where `z-popover` (1200)
 * actually wins over `z-sheet` (960).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { RegionDto } from "@/application/region/dtos";
import { MAP_SEARCH_COPY, MAP_SEARCH_MAX_RESULTS } from "@/config/map";
import { cn } from "@/lib/cn";

import { useMapState } from "./map-state-context";
import { searchRegions } from "./region-fuzzy-search";

export interface MapSearchProps {
  readonly regions: readonly RegionDto[];
  /**
   * Auto-focuses the input once on mount. Wired by the desktop header
   * after the user clicks the search icon to expand the row, so the
   * cursor lands in the input without an extra tap.
   */
  readonly autoFocus?: boolean;
  /**
   * Fires whenever the dropdown's visibility changes. Parent uses this
   * (on mobile) to hide adjacent floating widgets — chiefly the year
   * chip row that would otherwise peek through the results overlay.
   */
  readonly onOpenChange?: (open: boolean) => void;
  readonly className?: string;
}

export function MapSearch({
  regions,
  autoFocus = false,
  onOpenChange,
  className,
}: MapSearchProps) {
  const { setWilayah } = useMapState();
  const [query, setQuery] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const listboxRef = useRef<HTMLUListElement | null>(null);
  // Anchor rect tracks the search pill's position on viewport so the
  // portaled (and therefore body-relative) dropdown can position itself
  // exactly under the pill on desktop. Mobile renders the dropdown as a
  // full-bleed overlay so it ignores the rect.
  const [anchorRect, setAnchorRect] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  // `portalTarget` stays `null` until after mount so SSR markup and the
  // first client paint match. Once mounted, the portal target points at
  // document.body, lifting the dropdown out of the header's stacking
  // context (which is below the bottom sheet's stacking context).
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const listboxId = "map-search-listbox";

  useEffect(() => {
    // Sync portal target with the live DOM. This is one of the
    // legitimate setState-in-effect cases the rule warns about: we need
    // a one-shot client-only escape from SSR (where `document` is
    // undefined) and there's no derivable substitute.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot client-only init
    setPortalTarget(document.body);
  }, []);

  const hits = useMemo(
    () => searchRegions(regions, query, MAP_SEARCH_MAX_RESULTS),
    [query, regions],
  );

  // Pull focus into the input on mount when the parent requests it (e.g.
  // desktop header expanded the row). Mobile leaves this false to avoid
  // popping the on-screen keyboard the moment the page loads.
  useEffect(() => {
    if (!autoFocus) return;
    inputRef.current?.focus();
  }, [autoFocus]);

  // The dropdown is considered "visible" once the user has typed enough
  // to trigger a query. Propagate to the parent so it can hide adjacent
  // floating widgets while results are showing.
  const resultsVisible = open && query.length >= 2;
  useEffect(() => {
    onOpenChange?.(resultsVisible);
  }, [onOpenChange, resultsVisible]);

  // Measure the wrapper rect when the dropdown becomes visible (and on
  // window resize / scroll while visible). The portaled dropdown uses
  // this rect to anchor itself directly under the search pill on
  // desktop. On mobile the rect is unused — the dropdown is full-bleed.
  useEffect(() => {
    if (!resultsVisible) return;
    const update = (): void => {
      const el = wrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setAnchorRect({ top: rect.bottom, left: rect.left, width: rect.width });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [resultsVisible]);

  // Click outside the wrapper closes the listbox. Listener is scoped to
  // `open` so we don't waste cycles when the input isn't focused. Both
  // the wrapper (input + clear button) and the listbox (portaled, so it
  // sits outside the wrapper in the DOM tree) count as "inside" — a click
  // on a result row must NOT close the listbox before its own mousedown
  // handler can commit the selection.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent): void => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (wrapperRef.current?.contains(target)) return;
      if (listboxRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  // (no separate effect to reset `activeIndex` — we reset it inline whenever
  // the query changes; an effect that synchronises React state with itself
  // would just trigger an avoidable extra render.)

  const commit = useCallback(
    (region: RegionDto): void => {
      setWilayah(region.kodeBps);
      setQuery("");
      setOpen(false);
      inputRef.current?.blur();
    },
    [setWilayah],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>): void => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setOpen(true);
        setActiveIndex((i) => (hits.length === 0 ? 0 : (i + 1) % hits.length));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) =>
          hits.length === 0 ? 0 : (i - 1 + hits.length) % hits.length,
        );
      } else if (event.key === "Enter") {
        if (hits.length === 0) return;
        event.preventDefault();
        const hit = hits[activeIndex] ?? hits[0];
        if (hit) commit(hit.region);
      } else if (event.key === "Escape") {
        if (query.length > 0) {
          event.preventDefault();
          setQuery("");
        } else {
          setOpen(false);
          inputRef.current?.blur();
        }
      }
    },
    [activeIndex, commit, hits, query.length],
  );

  return (
    <div ref={wrapperRef} className={cn("relative w-full", className)}>
      {/* No focus ring on the wrapper at all. The blinking caret inside
          the input is the visible focus indicator (it appears on both
          mouse and keyboard focus). For keyboard-only users, the listbox
          opening provides additional non-color affordance. */}
      <div className="flex items-center gap-2 rounded-full bg-surface-muted px-3 py-2 ring-1 ring-border">
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx={11} cy={11} r={7} />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          ref={inputRef}
          /* `type="text"` with `inputMode="search"`: same on-screen
              keyboard hint as `type="search"`, but Chrome / Safari no
              longer paint a second native clear-X next to our custom
              one. */
          type="text"
          inputMode="search"
          autoComplete="off"
          role="combobox"
          aria-label={MAP_SEARCH_COPY.ariaLabel}
          aria-controls={listboxId}
          aria-expanded={open}
          aria-autocomplete="list"
          aria-activedescendant={
            open && hits[activeIndex]
              ? `map-search-option-${activeIndex}`
              : undefined
          }
          placeholder={MAP_SEARCH_COPY.placeholder}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          /* The global `:focus-visible` rule in globals.css adds a
              brand-blue offset ring to every focused element. For the
              search input that looked like an "ugly selection box" on
              glass — we explicitly null the ring + offset here, leaving
              only the blinking caret as the focus indicator (still a
              valid WCAG 2.4.7 cue). */
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {query.length > 0 ? (
          <button
            type="button"
            aria-label={MAP_SEARCH_COPY.clearLabel}
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            {/* Real SVG cross — `×` character is a non-symmetric glyph and
                sits slightly above the baseline in most sans-serif fonts,
                which made the X look "off-centre" inside its 28 px round
                container. The SVG is perfectly square and aligned. */}
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        ) : null}
      </div>

      {/* Listbox is portaled to document.body so it escapes the header's
          stacking context. Without the portal, the mobile bottom sheet
          (z-sheet=960 at the root) painted on top of the listbox even
          though its `z-popover=1200` was numerically higher — the higher
          value only matters within the same stacking context.

          Desktop anchoring uses the wrapper's bounding rect (set into
          inline style) because portaling moves the listbox out from
          under `relative` parents, so plain `top-full / lg:absolute`
          would no longer target the search pill. */}
      {resultsVisible && portalTarget
        ? createPortal(
            <ul
              ref={listboxRef}
              id={listboxId}
              role="listbox"
              aria-label={MAP_SEARCH_COPY.resultsAriaLabel}
              style={
                anchorRect &&
                typeof window !== "undefined" &&
                window.matchMedia("(min-width: 1024px)").matches
                  ? {
                      top: anchorRect.top + 8,
                      left: anchorRect.left,
                      width: anchorRect.width,
                    }
                  : undefined
              }
              className={cn(
                "scrollbar-hide fixed z-popover overflow-y-auto bg-surface p-2 shadow-lg",
                /* Mobile defaults: full-bleed from below header pill to
                    the bottom of the viewport. Solid surface so the map
                    and year chips never bleed through. */
                "inset-x-0 bottom-0 top-[calc(env(safe-area-inset-top)+5.5rem)]",
                /* Desktop overrides: drop the mobile full-bleed and let
                    the inline `style` rect own the position. */
                "lg:glass-panel lg:inset-auto lg:bottom-auto lg:max-h-80 lg:rounded-2xl lg:p-1",
              )}
            >
              {hits.length === 0 ? (
                <li className="px-3 py-3 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">
                    {MAP_SEARCH_COPY.emptyTitle}
                  </p>
                  <p>{MAP_SEARCH_COPY.emptyDescription}</p>
                </li>
              ) : (
                hits.map((hit, idx) => {
                  const active = idx === activeIndex;
                  return (
                    <li
                      key={hit.region.kodeBps}
                      id={`map-search-option-${idx}`}
                      role="option"
                      aria-selected={active}
                      onMouseDown={(event) => {
                        // Prevent the input blur firing before our click
                        // so the listbox doesn't unmount before we can
                        // read the row.
                        event.preventDefault();
                        commit(hit.region);
                      }}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm",
                        active
                          ? "bg-primary/10 text-foreground"
                          : "text-foreground",
                      )}
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate font-medium">
                          {hit.region.kabupatenKota}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {hit.region.provinsi}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-md bg-surface-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {hit.region.tipe}
                      </span>
                    </li>
                  );
                })
              )}
            </ul>,
            portalTarget,
          )
        : null}
    </div>
  );
}
