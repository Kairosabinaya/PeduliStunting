"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { signOut } from "@/app/(auth)/actions";
import { PRIMARY_NAV } from "@/config/navigation";
import { APP_NAME } from "@/config/app";
import { Button } from "@/components/primitives/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/cn";

interface FloatingHeaderProps {
  readonly displayName?: string | null | undefined;
  readonly email?: string | null | undefined;
}

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function initialsOf(name?: string | null, email?: string | null): string {
  // Two-letter avatar fallback. Prefer display name initials, then the first
  // two characters of the email's local part — never leaks PII beyond what
  // is already in the header.
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
    const joined = `${first}${last}`.toUpperCase();
    if (joined.length > 0) return joined;
  }
  if (email && email.length > 0) {
    return email.slice(0, 2).toUpperCase();
  }
  return "PS";
}

/**
 * App shell header. Pinned at the top with a glassy backdrop so it floats
 * above content on every breakpoint. Desktop shows the full nav inline;
 * narrow viewports collapse it into a slide-down panel triggered by the
 * menu button. Only mounted inside the protected `(app)` route group.
 */
export function FloatingHeader({ displayName, email }: FloatingHeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // `/map` owns its own header (`<MapHeader>`) so the global pill would
  // just double up at the top of the viewport. Bail out before any render
  // work so we don't fight the map header for the fixed-top region.
  if (pathname?.startsWith("/map")) {
    return null;
  }

  return (
    <header className="pt-safe-3 safe-x pointer-events-none fixed inset-x-0 top-0 z-header flex justify-center px-3 md:px-6">
      <div className="glass-panel pointer-events-auto flex w-fit max-w-full items-center gap-3 rounded-2xl px-3 py-2 md:px-4 md:py-2">
        <Link
          href="/map"
          aria-label={`${APP_NAME} – beranda`}
          className="flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          {/*
            Brand wordmark. Two `<Image>` variants are mounted simultaneously
            with theme-based visibility so the swap is instant on theme
            toggle (no flash). Heights are explicit to avoid layout shift
            during font / image load.
          */}
          <Image
            src="/brand/logo-horizontal-color.png"
            alt={APP_NAME}
            width={160}
            height={40}
            priority
            className="block h-8 w-auto dark:hidden sm:h-9 md:h-10"
          />
          <Image
            src="/brand/logo-horizontal-white.png"
            alt={APP_NAME}
            width={160}
            height={40}
            priority
            className="hidden h-8 w-auto dark:block sm:h-9 md:h-10"
          />
        </Link>

        <nav
          aria-label="Navigasi utama"
          className="hidden items-center justify-center gap-1 md:flex"
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
          <ThemeToggle />
          <AvatarMenu displayName={displayName ?? null} email={email ?? null} />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={mobileOpen}
            aria-controls="floating-header-mobile-nav"
            onClick={() => setMobileOpen((value) => !value)}
            className="md:hidden"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </Button>
        </div>
      </div>

      {mobileOpen ? (
        <nav
          id="floating-header-mobile-nav"
          aria-label="Navigasi utama"
          className="glass-panel pointer-events-auto mx-auto mt-2 flex w-full max-w-md flex-col gap-1 rounded-2xl p-2 md:hidden"
        >
          {PRIMARY_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex min-h-11 flex-col justify-center gap-0.5 rounded-lg px-3 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted",
                )}
              >
                <span>{item.label}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {item.description}
                </span>
              </Link>
            );
          })}
        </nav>
      ) : null}
    </header>
  );
}

/**
 * Circular avatar that opens a small dropdown with the user's name + email
 * and shortcuts to the profile page / sign-out action.
 *
 * Click-only by design — hover-to-open is unreliable on hybrid devices
 * (Surface, iPad with trackpad) and confusing on touch. Keyboard users
 * focus + Enter/Space. A document-level click-outside listener closes the
 * menu so it never gets stuck open after navigation.
 */
function AvatarMenu({
  displayName,
  email,
}: {
  readonly displayName: string | null;
  readonly email: string | null;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const initials = initialsOf(displayName, email);

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
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-label={displayName ?? email ?? "Akun pengguna"}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold uppercase tracking-wide text-primary-foreground shadow-sm transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        {initials}
      </button>
      {open ? (
        <div
          role="menu"
          aria-label="Menu akun"
          /* `right-0` keeps the dropdown anchored to the avatar; the
             `min/calc` width clamp prevents overflow on 360 px viewports
             where the header pill itself only has 1.5 rem of edge padding
             (px-3 × 2). Tokens, not magic values. */
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
          <form action={signOut}>
            <button
              type="submit"
              role="menuitem"
              className="flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm font-medium text-danger hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              Keluar
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
