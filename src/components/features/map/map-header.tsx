"use client";

/**
 * `/map`-specific floating header.
 *
 * The pill is a single morphing surface: collapsed state shows logo
 * wordmark + primary nav + theme + search icon + avatar; expanded
 * (search active) shows back arrow + icon logo + search input + avatar.
 * Width animates from collapsed to expanded so the user sees the bar
 * physically widen instead of snapping.
 *
 * Desktop avatar opens a hover-with-delay dropdown (Profil + Keluar);
 * mobile avatar dispatches `onAccountClick` to the parent, which expands
 * the bottom sheet into account-menu mode.
 *
 * Year picker chips dock under the search bar on mobile only; desktop
 * keeps a horizontal row in the bottom-left cluster (parent owns that).
 */

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { RegionDto } from "@/application/region/dtos";
import { Avatar } from "@/components/primitives/avatar";
import { Button } from "@/components/primitives/button";
import { SignOutConfirmModal } from "@/components/navigation/sign-out-confirm-modal";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { APP_NAME } from "@/config/app";
import { YEAR_RAIL_COPY } from "@/config/map";
import { HEADER_HOVER_CLOSE_DELAY_MS, PRIMARY_NAV } from "@/config/navigation";
import {
  SUPPORTED_YEARS,
  isSupportedYear,
  type SupportedYear,
} from "@/config/years";
import { cn } from "@/lib/cn";
import { useMediaQuery } from "@/lib/use-media-query";

import { MapSearch } from "./map-search";
import { useMapState } from "./map-state-context";

export interface MapHeaderProps {
  readonly regions: readonly RegionDto[];
  readonly displayName: string | null;
  readonly email: string | null;
  /** Profile avatar URL. Null falls the avatar back to initials. */
  readonly avatarUrl: string | null;
  /** Avatar tap handler on mobile — opens the sheet menu. Ignored on desktop. */
  readonly onAccountClick: () => void;
  /** Mirrors the avatar's `aria-expanded` (sheet menu open state on mobile). */
  readonly accountOpen?: boolean;
  /** Hide the horizontal year chip row (desktop hides it; its parent renders its own). */
  readonly hideYearRow?: boolean;
}

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MapHeader({
  regions,
  displayName,
  email,
  avatarUrl,
  onAccountClick,
  accountOpen = false,
  hideYearRow = false,
}: MapHeaderProps) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [searchExpanded, setSearchExpanded] = useState<boolean>(false);
  // Tracks whether the search-results overlay is up. On mobile we use
  // this to hide the year chip row underneath so it doesn't bleed
  // through the listbox.
  const [searchResultsOpen, setSearchResultsOpen] = useState<boolean>(false);
  const headerRef = useRef<HTMLElement | null>(null);

  // Compact = search-bar layout. Mobile always; desktop on user request.
  const isCompact = !isDesktop || searchExpanded;

  // Esc collapses the expanded desktop search.
  useEffect(() => {
    if (!searchExpanded) return;
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setSearchExpanded(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [searchExpanded]);

  // Clicking anywhere outside the header (typically the map canvas, but
  // also the bottom-left info card or any non-header surface) collapses
  // the expanded desktop search row back to its default state. The
  // dropdown listbox is rendered as a descendant of `<header>` via
  // `MapSearch`, so clicks on suggestions are inside the ref and don't
  // trigger a collapse. Scoped to `searchExpanded` for efficiency.
  useEffect(() => {
    if (!searchExpanded) return;
    const onDocMouseDown = (event: MouseEvent): void => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (headerRef.current?.contains(target)) return;
      setSearchExpanded(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [searchExpanded]);

  // Increased top padding (pt-safe-4 instead of pt-safe-3) gives extra
  // breathing room above the pill on phones whose URL bar overlaps the
  // safe-area-inset-top region. The `safe-x` keeps the pill clear of the
  // notch corners when held in landscape.
  return (
    <header
      ref={headerRef}
      className="pt-safe-4 safe-x pointer-events-none fixed inset-x-0 top-0 z-header px-3 md:px-6"
    >
      <div
        className={cn(
          "pointer-events-auto mx-auto flex w-full flex-col items-center gap-2",
        )}
      >
        {/* The pill itself owns the width morph. We pick fixed pixel
            widths so CSS can actually transition between them — `w-fit`
            ↔ pixel value is not animatable. */}
        <div
          style={{
            // Mobile: stretch within the viewport (clamped to max-width).
            // Desktop default: narrow pill. Desktop expanded: wider pill.
            width: isCompact ? "min(48rem, 100%)" : "min(44rem, 100%)",
          }}
          className={cn(
            "glass-panel relative flex items-center gap-2 rounded-full p-2",
            "transition-[width] duration-slow ease-emphasized",
            "motion-reduce:transition-none",
          )}
        >
          {isCompact ? (
            <CompactSearchRow
              regions={regions}
              displayName={displayName}
              email={email}
              avatarUrl={avatarUrl}
              accountOpen={accountOpen}
              onAccountClick={onAccountClick}
              onCollapse={isDesktop ? () => setSearchExpanded(false) : null}
              autoFocusSearch={searchExpanded}
              isDesktop={isDesktop}
              onSearchResultsOpenChange={setSearchResultsOpen}
            />
          ) : (
            <DesktopDefaultRow
              displayName={displayName}
              email={email}
              avatarUrl={avatarUrl}
              onSearchClick={() => setSearchExpanded(true)}
            />
          )}
        </div>

        {/* Year chips: mobile only. Hides while the search results
            overlay is up so it doesn't peek through. */}
        {!hideYearRow && !isDesktop && !searchResultsOpen ? (
          <YearChips className="w-full max-w-md" />
        ) : null}
      </div>
    </header>
  );
}

interface CompactSearchRowProps {
  readonly regions: readonly RegionDto[];
  readonly displayName: string | null;
  readonly email: string | null;
  readonly avatarUrl: string | null;
  readonly accountOpen: boolean;
  readonly onAccountClick: () => void;
  readonly onCollapse: (() => void) | null;
  readonly autoFocusSearch: boolean;
  readonly isDesktop: boolean;
  readonly onSearchResultsOpenChange: (open: boolean) => void;
}

function CompactSearchRow({
  regions,
  displayName,
  email,
  avatarUrl,
  accountOpen,
  onAccountClick,
  onCollapse,
  autoFocusSearch,
  isDesktop,
  onSearchResultsOpenChange,
}: CompactSearchRowProps) {
  return (
    <div className="flex w-full animate-fade-in items-center gap-2">
      {onCollapse ? (
        <button
          type="button"
          aria-label="Tutup pencarian"
          onClick={onCollapse}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
      ) : (
        <Link
          href="/"
          aria-label={`${APP_NAME} – beranda`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <Image
            src="/brand/icon-color.png"
            alt={APP_NAME}
            width={32}
            height={32}
            priority
            className="h-8 w-8 dark:hidden"
          />
          <Image
            src="/brand/icon-white.png"
            alt={APP_NAME}
            width={32}
            height={32}
            priority
            className="hidden h-8 w-8 dark:block"
          />
        </Link>
      )}

      <MapSearch
        regions={regions}
        className="flex-1"
        autoFocus={autoFocusSearch}
        onOpenChange={onSearchResultsOpenChange}
      />

      {isDesktop ? (
        <AvatarDropdown
          displayName={displayName}
          email={email}
          avatarUrl={avatarUrl}
        />
      ) : (
        <button
          type="button"
          aria-label={displayName ?? email ?? "Akun pengguna"}
          aria-haspopup="menu"
          aria-expanded={accountOpen}
          onClick={onAccountClick}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-sm transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Avatar
            src={avatarUrl}
            displayName={displayName}
            email={email}
            size="lg"
            aria-hidden
          />
        </button>
      )}
    </div>
  );
}

interface DesktopDefaultRowProps {
  readonly displayName: string | null;
  readonly email: string | null;
  readonly avatarUrl: string | null;
  readonly onSearchClick: () => void;
}

function DesktopDefaultRow({
  displayName,
  email,
  avatarUrl,
  onSearchClick,
}: DesktopDefaultRowProps) {
  const pathname = usePathname();

  return (
    <div className="flex w-full animate-fade-in items-center gap-3 px-2">
      <Link
        href="/"
        aria-label={`${APP_NAME} – beranda`}
        className="flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <Image
          src="/brand/logo-horizontal-color.png"
          alt={APP_NAME}
          width={160}
          height={40}
          priority
          className="block h-10 w-auto dark:hidden"
        />
        <Image
          src="/brand/logo-horizontal-white.png"
          alt={APP_NAME}
          width={160}
          height={40}
          priority
          className="hidden h-10 w-auto dark:block"
        />
      </Link>

      <nav
        aria-label="Navigasi utama"
        className="flex flex-1 items-center justify-center gap-1"
      >
        {PRIMARY_NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Buka pencarian wilayah"
          onClick={onSearchClick}
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx={11} cy={11} r={7} />
            <path d="M20 20l-3.5-3.5" />
          </svg>
        </Button>
        <ThemeToggle />
        <AvatarDropdown
          displayName={displayName}
          email={email}
          avatarUrl={avatarUrl}
        />
      </div>
    </div>
  );
}

/**
 * Desktop avatar trigger + dropdown menu. Opens on click OR on hover
 * (with a short close-delay so the user can travel from avatar to menu
 * without it snapping shut). Reuses the menu shape from the original
 * `FloatingHeader` so the visual language stays consistent across the
 * `/map` and non-`/map` headers.
 */
interface AvatarDropdownProps {
  readonly displayName: string | null;
  readonly email: string | null;
  readonly avatarUrl: string | null;
}

function AvatarDropdown({
  displayName,
  email,
  avatarUrl,
}: AvatarDropdownProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const cancelCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, HEADER_HOVER_CLOSE_DELAY_MS);
  }, [cancelCloseTimer]);

  useEffect(() => () => cancelCloseTimer(), [cancelCloseTimer]);

  // Click outside + Escape close. Scoped to `open` for cycle efficiency.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent): void => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (wrapperRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseEnter={() => {
        cancelCloseTimer();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        aria-label={displayName ?? email ?? "Akun pengguna"}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full shadow-sm transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Avatar
          src={avatarUrl}
          displayName={displayName}
          email={email}
          size="lg"
          aria-hidden
        />
      </button>
      {open ? (
        <div
          role="menu"
          aria-label="Menu akun"
          className="glass-panel absolute right-0 top-full z-popover mt-2 w-[min(16rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl p-1.5 shadow-md"
        >
          <div className="px-3 py-2">
            {displayName ? (
              <p className="truncate text-sm font-semibold text-foreground">
                {displayName}
              </p>
            ) : null}
            {email ? (
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            ) : null}
          </div>
          <div className="my-1 border-t border-border" />
          <Link
            href="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            Profil
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              cancelCloseTimer();
              setOpen(false);
              setConfirmOpen(true);
            }}
            className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm font-medium text-danger hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            Keluar
          </button>
        </div>
      ) : null}
      <SignOutConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  );
}

interface YearChipsProps {
  readonly className?: string;
}

function YearChips({ className }: YearChipsProps) {
  const { tahun, setTahun } = useMapState();
  const years = useMemo(() => [...SUPPORTED_YEARS], []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>, index: number) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const nextIdx = (index + delta + years.length) % years.length;
      const nextYear = years[nextIdx];
      if (nextYear !== undefined) setTahun(nextYear);
    },
    [setTahun, years],
  );

  /**
   * `flex` (not inline-flex) + `flex-1` per chip distributes the four
   * years evenly across the pill width. Matches the screenshot the user
   * sent where 2021–2024 fill the entire available row instead of
   * clustering to the left.
   */
  return (
    <div
      role="radiogroup"
      aria-label={YEAR_RAIL_COPY.ariaLabel}
      aria-orientation="horizontal"
      className={cn(
        "glass-panel flex items-center gap-1 rounded-full p-1",
        className,
      )}
    >
      {years.map((year: SupportedYear, index) => {
        const active = year === tahun;
        return (
          <div
            key={year}
            role="radio"
            tabIndex={active ? 0 : -1}
            aria-checked={active}
            onClick={() => {
              if (isSupportedYear(year)) setTahun(year);
            }}
            onKeyDown={(event) => onKeyDown(event, index)}
            onKeyUp={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setTahun(year);
              }
            }}
            className={cn(
              "flex min-h-9 flex-1 cursor-pointer items-center justify-center rounded-full px-3 font-mono text-xs tabular-nums transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
              active
                ? "bg-primary font-semibold text-primary-foreground shadow-sm"
                : "text-foreground/70 hover:bg-surface-muted/60 hover:text-foreground",
            )}
          >
            {year}
          </div>
        );
      })}
    </div>
  );
}
