"use client";

/**
 * Account menu panel rendered inside the mobile bottom sheet (when the
 * user taps the avatar in the `/map` header). Mirrors the Google Maps
 * "switch account / settings" sheet pattern: prominent identity block at
 * the top, primary nav links underneath, sign-out at the bottom.
 *
 * Pure presentational — parent owns the open/close state and the active
 * sheet snap so dismissal behaviour stays predictable.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "@/app/(auth)/actions";
import { PRIMARY_NAV } from "@/config/navigation";
import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/cn";

export interface AccountMenuPanelProps {
  readonly displayName: string | null;
  readonly email: string | null;
  readonly onItemSelected: () => void;
}

export function AccountMenuPanel({
  displayName,
  email,
  onItemSelected,
}: AccountMenuPanelProps) {
  const pathname = usePathname();
  const { resolvedTheme, toggle } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="space-y-4">
      <header className="flex flex-col items-center gap-2 text-center">
        {email ? (
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        ) : null}
        {displayName ? (
          <p className="text-lg font-semibold text-foreground">
            Halo, {displayName}!
          </p>
        ) : null}
        <Link
          href="/account"
          onClick={onItemSelected}
          className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-medium text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          Kelola Akun
        </Link>
      </header>

      <nav aria-label="Navigasi aplikasi" className="space-y-1">
        <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Menu
        </p>
        {PRIMARY_NAV.map((item) => {
          const active =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemSelected}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-11 flex-col justify-center rounded-xl px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-surface-muted",
              )}
            >
              <span className="font-medium">{item.label}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {item.description}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Tema card: the WHOLE surface is a button so tapping anywhere on
          the row toggles between light and dark. The earlier layout only
          made the small sun/moon icon clickable, which was a fiddly tap
          target on mobile. */}
      <button
        type="button"
        onClick={toggle}
        aria-label={isDark ? "Aktifkan tema terang" : "Aktifkan tema gelap"}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface-muted/30 p-3 text-left transition-colors hover:bg-surface-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <span className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">Tema</span>
          <span className="text-xs text-muted-foreground">
            Ganti antara terang dan gelap.
          </span>
        </span>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0 text-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isDark ? (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </>
          ) : (
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          )}
        </svg>
      </button>

      <form action={signOut}>
        <button
          type="submit"
          className="flex min-h-11 w-full items-center justify-center rounded-xl bg-danger/10 px-3 text-sm font-medium text-danger hover:bg-danger/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          Keluar
        </button>
      </form>
    </div>
  );
}
