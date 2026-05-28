import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { AuthMapPreview } from "@/app/(auth)/_components/auth-map-preview";
import { AuthMobileBrandStrip } from "@/app/(auth)/_components/auth-mobile-brand-strip";
import { AuthStats } from "@/app/(auth)/_components/auth-stats";
import { TrustSignals } from "@/app/(auth)/_components/trust-signals";
import { APP_NAME } from "@/config/app";
import { AUTH_BRAND_PANEL, AUTH_EYEBROW, AUTH_LABELS } from "@/config/auth";

interface AuthLayoutProps {
  readonly children: ReactNode;
}

/**
 * Two-column layout shared by sign-in, sign-up, reset, and update flows.
 * Desktop (`lg+`) shows the brand panel (kiri) with display-size
 * headline, stats, product preview map card, dan trust signals. Mobile
 * & tablet (`< lg`) keep the form column and gain a compact brand strip
 * sehingga identitas visual tidak hilang.
 *
 * Visual layering di brand panel:
 *   1. Gradient base (brand-700 → brand-300)
 *   2. `.auth-aurora` radial overlay (CSS-only, palette-locked)
 *   3. `auth-blob-a` / `auth-blob-b` decorative halos
 *   4. Konten (logo, headline, stats, map preview, trust signals)
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-[1.05fr_1fr]">
      <aside
        aria-label={`${APP_NAME} - panel sambutan`}
        className="relative hidden flex-col overflow-hidden bg-gradient-to-br from-brand-700 via-brand-500 to-brand-300 p-10 text-primary-foreground lg:flex"
      >
        {/* Aurora overlay (palette-locked) di belakang blobs */}
        <div
          aria-hidden
          className="auth-aurora pointer-events-none absolute inset-0"
        />
        <div
          aria-hidden
          className="auth-blob-a pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="auth-blob-b pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-accent/20 blur-3xl"
        />

        {/* Konten panel — flex column, didistribusi vertikal */}
        <div className="relative flex h-full flex-col gap-8">
          <Link
            href="/"
            aria-label={`${APP_NAME} - beranda`}
            className="inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600"
          >
            <Image
              src={AUTH_BRAND_PANEL.logo.src}
              alt={AUTH_BRAND_PANEL.logo.alt}
              width={AUTH_BRAND_PANEL.logo.width}
              height={AUTH_BRAND_PANEL.logo.height}
              priority
              sizes="(max-width: 1280px) 120px, 160px"
              className="h-20 w-auto"
            />
          </Link>

          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
              {AUTH_EYEBROW}
            </p>
            <h2 className="auth-headline max-w-md text-balance text-white">
              {AUTH_BRAND_PANEL.headline}
            </h2>
            <p className="max-w-md text-pretty text-sm leading-relaxed text-white/85">
              {AUTH_BRAND_PANEL.body}
            </p>
          </div>

          <AuthStats />

          <div className="mt-2">
            <AuthMapPreview />
          </div>

          <div className="mt-auto space-y-4">
            <TrustSignals />
            <p className="text-xs text-white/70">{AUTH_BRAND_PANEL.source}</p>
          </div>
        </div>
      </aside>

      <main className="flex flex-col px-4 py-8 sm:px-10 sm:py-10 lg:px-14">
        {/* Mobile / tablet brand strip — menggantikan brand panel desktop */}
        <div className="flex items-center justify-between gap-3 lg:hidden">
          <AuthMobileBrandStrip />
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <span aria-hidden>&larr;</span> {AUTH_LABELS.backToHome}
          </Link>
        </div>

        {/* `max-w-md` at every breakpoint suits the 4-field sign-in / reset /
            update flows. The sign-up form, which adds the avatar uploader as
            a side column, opts into a wider lane via its own page layout. */}
        <div className="mx-auto mt-8 w-full max-w-md flex-1 sm:mt-10 [&:has([data-auth-wide])]:max-w-2xl">
          {children}
        </div>
      </main>
    </div>
  );
}
