"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { PRIMARY_NAV } from "@/config/navigation";
import { APP_NAME } from "@/config/app";
import { Button } from "@/components/primitives/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/cn";

interface FloatingHeaderProps {
  readonly displayName?: string | null | undefined;
}

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * App shell header. Pinned at the top with a glassy backdrop so it floats
 * above content on every breakpoint. Desktop shows the full nav inline;
 * narrow viewports collapse it into a slide-down panel triggered by the
 * menu button. Only mounted inside the protected `(app)` route group.
 */
export function FloatingHeader({ displayName }: FloatingHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 px-3 pt-3 md:px-6 md:pt-5">
      <div className="glass-panel pointer-events-auto mx-auto flex w-fit max-w-full items-center gap-3 rounded-2xl px-3 py-2 md:px-5 md:py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/map"
            className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            aria-label={`${APP_NAME} – beranda`}
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span aria-hidden className="text-sm font-semibold">
                PS
              </span>
            </span>
            <span className="hidden text-sm font-semibold text-foreground md:inline">
              {APP_NAME}
            </span>
          </Link>
        </div>

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
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
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
          {displayName ? (
            <span className="hidden max-w-[10rem] truncate text-sm text-muted-foreground md:inline">
              {displayName}
            </span>
          ) : null}
          <ThemeToggle />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            aria-controls="floating-header-mobile-nav"
            onClick={() => setOpen((value) => !value)}
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
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </Button>
        </div>
      </div>

      {open ? (
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
                onClick={() => setOpen(false)}
                className={cn(
                  "flex flex-col gap-0.5 rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
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
