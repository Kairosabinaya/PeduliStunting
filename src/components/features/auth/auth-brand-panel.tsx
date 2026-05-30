import Image from "next/image";
import Link from "next/link";

import { LANDING_ROUTE } from "@/config/app";
import { AUTH_BRAND_PANEL, AUTH_LABELS } from "@/config/auth";

const TRUST_SIGNALS = [
  AUTH_LABELS.trustSignals.encrypted,
  AUTH_LABELS.trustSignals.free,
  AUTH_LABELS.trustSignals.official,
] as const;

/**
 * Editorial brand panel for the desktop auth split-screen. A blue-to-green
 * diagonal gradient (`from-brand-900 via-brand-700 to-accent`) carries the
 * white logo, an oversized tagline, three trust signals, and the data
 * attribution. The brand ladder is deliberately NOT re-themed in dark mode
 * (see globals.css), so the gradient and white copy keep their contrast in
 * both themes without a single conditional class.
 *
 * Decoration is two static, `aria-hidden` radial glows plus one low-opacity
 * growth-curve SVG that echoes the Buku KIA grafik pertumbuhan — all pure
 * CSS/SVG, so no WebGL, no raster beyond the logo, and nothing animates
 * (keeps the interaction budget clean on mid-range Android).
 *
 * Server Component: purely presentational, mounted only at `lg+` by
 * {@link AuthShell}.
 *
 * @example
 * ```tsx
 * <AuthBrandPanel />
 * ```
 */
export function AuthBrandPanel() {
  return (
    <section className="relative flex h-full flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-accent p-12 text-white xl:p-16">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-accent/30 blur-3xl"
      />
      <svg
        viewBox="0 0 600 600"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden
        focusable="false"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <path
          d="M0 560 C 140 540, 230 470, 320 360 C 400 265, 480 175, 600 90 L 600 600 L 0 600 Z"
          className="fill-white/5"
        />
        <path
          d="M0 560 C 140 540, 230 470, 320 360 C 400 265, 480 175, 600 90"
          className="stroke-white/25"
          fill="none"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle cx="600" cy="90" r="7" className="fill-white/80" />
      </svg>

      <div className="relative z-elevated flex items-center justify-between gap-4">
        <Image
          src={AUTH_BRAND_PANEL.logo.src}
          width={AUTH_BRAND_PANEL.logo.width}
          height={AUTH_BRAND_PANEL.logo.height}
          alt={AUTH_BRAND_PANEL.logo.alt}
          sizes="64px"
          priority
          className="h-16 w-16"
        />
        <Link
          href={LANDING_ROUTE}
          className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-4 text-sm text-white/90 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
        >
          {AUTH_LABELS.backToHome}
        </Link>
      </div>

      <div className="relative z-elevated max-w-md">
        <p className="auth-headline text-white">{AUTH_BRAND_PANEL.headline}</p>
        <p className="mt-6 text-lg leading-relaxed text-white/90">
          {AUTH_BRAND_PANEL.body}
        </p>
      </div>

      <ul className="relative z-elevated flex max-w-md flex-col gap-3 text-sm text-white/90">
        {TRUST_SIGNALS.map((label) => (
          <li key={label} className="flex items-center gap-3">
            <span
              aria-hidden
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
            />
            {label}
          </li>
        ))}
        <li className="mt-2 border-t border-white/15 pt-4 text-xs text-white/80">
          {AUTH_BRAND_PANEL.source}
        </li>
      </ul>
    </section>
  );
}
