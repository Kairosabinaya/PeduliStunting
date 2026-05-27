import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { APP_NAME } from "@/config/app";
import { AUTH_BRAND_PANEL, AUTH_LABELS } from "@/config/auth";

interface AuthLayoutProps {
  readonly children: ReactNode;
}

/**
 * Two-column layout shared by sign-in, sign-up, reset, and update flows.
 * The brand panel collapses below `lg`, replaced by a compact back-to-home
 * link so mobile and tablet keep the full viewport for the form itself.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-[1.05fr_1fr]">
      <aside
        aria-label={`${APP_NAME} - panel sambutan`}
        className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-500 to-brand-300 p-10 text-primary-foreground lg:flex"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-accent/20 blur-3xl"
        />
        <Link
          href="/"
          aria-label={`${APP_NAME} - beranda`}
          className="relative inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
        >
          <Image
            src={AUTH_BRAND_PANEL.logo.src}
            alt={AUTH_BRAND_PANEL.logo.alt}
            width={AUTH_BRAND_PANEL.logo.width}
            height={AUTH_BRAND_PANEL.logo.height}
            priority
            sizes="(max-width: 1280px) 120px, 160px"
            className="h-24 w-auto"
          />
        </Link>
        <div className="relative space-y-4">
          <p className="max-w-md text-balance text-2xl font-semibold leading-snug">
            {AUTH_BRAND_PANEL.headline}
          </p>
          <p className="max-w-md text-pretty text-sm text-white/85">
            {AUTH_BRAND_PANEL.body}
          </p>
        </div>
        <p className="relative text-xs text-white/75">
          {AUTH_BRAND_PANEL.source}
        </p>
      </aside>
      <main className="flex flex-col px-4 py-8 sm:px-10 sm:py-10 lg:px-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:rounded-md lg:hidden"
        >
          <span aria-hidden>&larr;</span> {AUTH_LABELS.backToHome}
        </Link>
        <div className="mx-auto mt-8 w-full max-w-md flex-1 sm:mt-10">
          {children}
        </div>
      </main>
    </div>
  );
}
