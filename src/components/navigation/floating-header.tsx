"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { HEADER_HOVER_CLOSE_DELAY_MS, PRIMARY_NAV } from "@/config/navigation";
import { APP_NAME } from "@/config/app";
import { SIGN_IN_ROUTE } from "@/config/routes";
import { Avatar } from "@/components/primitives/avatar";
import { Button, buttonVariants } from "@/components/primitives/button";
import { SignOutConfirmModal } from "@/components/navigation/sign-out-confirm-modal";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/cn";

/**
 * Identity bundle for the header. `null` means the visitor is signed out —
 * the header renders sign-in / sign-up CTAs instead of the avatar dropdown.
 * Resolving identity in the parent Server Component (and passing it down)
 * avoids a client-side auth waterfall + flash on every navigation.
 */
export interface FloatingHeaderSession {
  readonly displayName: string | null;
  readonly email: string | null;
  readonly avatarUrl: string | null;
  readonly isAdmin: boolean;
}

interface FloatingHeaderProps {
  readonly session: FloatingHeaderSession | null;
}

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * SSR-safe subscription to `prefers-reduced-motion`. `useSyncExternalStore`
 * does the subscribe/snapshot dance without a setState-in-effect dance
 * that the React lint flags.
 */
function useReducedMotionPreference(): boolean {
  return useSyncExternalStore(
    (callback) => {
      if (typeof window === "undefined") return () => {};
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      mq.addEventListener("change", callback);
      return () => mq.removeEventListener("change", callback);
    },
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/**
 * Hide the header when the user scrolls down (`delta > 8px`) past the
 * 100px mark, reveal it on any scroll-up. Returning to the very top
 * always reveals. When `reducedMotion` is true the listener stays
 * off and the header remains visible — derived in the return value
 * to keep the effect body free of synchronous setState.
 */
function useAutoHideOnScroll(reducedMotion: boolean): boolean {
  const [visible, setVisible] = useState(true);
  const lastYRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (reducedMotion) return;
    lastYRef.current = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastYRef.current;
      if (currentY <= 100) {
        setVisible(true);
      } else if (delta > 8) {
        setVisible(false);
      } else if (delta < -4) {
        setVisible(true);
      }
      lastYRef.current = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reducedMotion]);

  return reducedMotion ? true : visible;
}

/**
 * App shell header. Pinned at the top with a glassy backdrop so it floats
 * above content on every breakpoint. Desktop shows the full nav inline;
 * narrow viewports collapse it into a slide-down panel triggered by the
 * menu button. Only mounted inside the protected `(app)` route group.
 *
 * Auto-hide: header slides out of view when the user scrolls down past
 * 100px and reveals as soon as they scroll up. This stops the pill from
 * overlapping section headings on long-scroll pages like /edukasi.
 * Reduced-motion users keep the header permanently visible (sliding the
 * header without easing would be jarring for that audience).
 */
export function FloatingHeader({ session }: FloatingHeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const reducedMotion = useReducedMotionPreference();
  const visible = useAutoHideOnScroll(reducedMotion);

  // Authenticated `/map` owns its own header (`<MapHeader>`, which packs the
  // search input + year row that only make sense on the interactive surface)
  // so we suppress the global pill there to avoid stacking two glass pills
  // at the top. Unauthenticated `/map` is the landing-before-login surface
  // and has no MapHeader, so the global pill IS the header and must render.
  if (session && pathname?.startsWith("/map")) {
    return null;
  }

  // Mobile menu open should pin the header visible; otherwise honour the
  // scroll-driven `visible` state.
  const isHidden = !mobileOpen && !visible;

  return (
    <header
      className={cn(
        "pt-safe-4 safe-x pointer-events-none fixed inset-x-0 top-0 z-header px-3 transition-transform duration-300 ease-emphasized md:px-6",
        isHidden && "-translate-y-full",
      )}
    >
      {/* Centered wrapper holding a fixed-width pill so the header width is
          identical to the `/map` MapHeader on every page (the brief: one
          consistent pill width site-wide, minus the search affordance which
          this header never had). The pill owns its width via an inline
          `min(44rem, 100%)` — `w-fit` would size to content and drift per
          page. */}
      <div className="pointer-events-auto mx-auto flex w-full flex-col items-center gap-2">
        <div
          style={{ width: "min(44rem, 100%)" }}
          className="glass-panel relative flex w-full items-center gap-3 rounded-full p-2"
        >
          <Link
            href="/"
            aria-label={`${APP_NAME} – beranda`}
            className="flex shrink-0 items-center rounded-md pl-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            {/*
              Brand wordmark. Two `<Image>` variants are mounted simultaneously
              with theme-based visibility so the swap is instant on theme
              toggle (no flash). Heights are explicit to avoid layout shift
              during font / image load.
            */}
            <Image
              src="/brand/logo-horizontal-color.webp"
              alt={APP_NAME}
              // 108x40 matches the wordmark's intrinsic 960x356 aspect ratio
              // at the rendered 40 px height; a mismatched declared ratio
              // fails Lighthouse `image-aspect-ratio`.
              width={108}
              height={40}
              priority
              // Inline `width: auto` silences the Next/Image intrinsic-size
              // warning — Tailwind locks the *height* via className so width
              // must be left to scale from the aspect ratio. The previous
              // `height: auto` inline was overriding the class entirely and
              // rendering the wordmark at intrinsic 40 px.
              style={{ width: "auto" }}
              className="block h-10 dark:hidden"
            />
            <Image
              src="/brand/logo-horizontal-white.webp"
              alt={APP_NAME}
              width={108}
              height={40}
              priority
              style={{ width: "auto" }}
              className="hidden h-10 dark:block"
            />
          </Link>

          <nav
            aria-label="Navigasi utama"
            className="hidden flex-1 items-center justify-center gap-1 md:flex"
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

          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            {session ? (
              <AvatarMenu
                displayName={session.displayName}
                email={session.email}
                avatarUrl={session.avatarUrl}
                isAdmin={session.isAdmin}
              />
            ) : (
              <UnauthenticatedActions />
            )}
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
            className="glass-panel pointer-events-auto flex w-full max-w-md flex-col gap-1 rounded-2xl p-2 md:hidden"
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
      </div>
    </header>
  );
}

/**
 * Sign-in / sign-up CTA pair shown in place of the avatar when the visitor
 * is unauthenticated (landing-before-login at `/map`). Mobile keeps only the
 * sign-up button visible to preserve pill width; sign-in remains reachable
 * from the auth flow itself ("Sudah punya akun? Masuk" links).
 */
function UnauthenticatedActions() {
  return (
    <div className="flex items-center gap-1">
      <Link
        href={SIGN_IN_ROUTE}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "hidden sm:inline-flex",
        )}
      >
        Masuk
      </Link>
      <Link
        href="/auth/sign-up"
        className={buttonVariants({ variant: "primary", size: "sm" })}
      >
        Daftar
      </Link>
    </div>
  );
}

/**
 * Circular avatar that opens a small dropdown with the user's name + email
 * and shortcuts to the profile page / sign-out action.
 *
 * Opens on click OR on hover (with a short close-delay so the pointer can
 * travel from the avatar to the menu without it snapping shut), mirroring the
 * `/map` header so the account affordance behaves identically everywhere.
 * Keyboard users focus + Enter/Space. A document-level click-outside listener
 * plus Escape close the menu so it never gets stuck open after navigation.
 */
function AvatarMenu({
  displayName,
  email,
  avatarUrl,
  isAdmin,
}: {
  readonly displayName: string | null;
  readonly email: string | null;
  readonly avatarUrl: string | null;
  readonly isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
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
          {isAdmin ? (
            <Link
              href="/admin/users"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-primary hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus dark:hover:bg-brand-900"
            >
              Kelola pengguna
            </Link>
          ) : null}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
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
