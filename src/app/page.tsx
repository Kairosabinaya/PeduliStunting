import Image from "next/image";
import Link from "next/link";

import { APP_NAME } from "@/config/app";
import {
  LANDING_CTA_BANNER,
  LANDING_FOOTER,
  LANDING_HERO,
  LANDING_LOGO,
  LANDING_MODEL_SNAPSHOT,
  LANDING_PILLARS,
  LANDING_PILLARS_HEADER,
  LANDING_TRUST_HEADER,
  LANDING_TRUST_POINTS,
  type LandingPillarTone,
} from "@/config/landing";
import { buttonVariants } from "@/components/primitives/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/cn";

const PILLAR_TONE_CLASSES: Readonly<
  Record<
    LandingPillarTone,
    { accent: string; bullet: string; badge: string }
  >
> = {
  primary: {
    accent: "text-primary",
    bullet: "bg-primary",
    badge: "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-100",
  },
  "primary-soft": {
    accent: "text-primary-soft",
    bullet: "bg-primary-soft",
    badge:
      "bg-brand-100 text-brand-700 dark:bg-brand-800 dark:text-brand-100",
  },
  accent: {
    accent: "text-accent",
    bullet: "bg-accent",
    badge: "bg-accent-soft text-accent-foreground",
  },
};

const FACT_EMPHASIS_CLASSES = {
  neutral: "bg-surface-muted text-foreground",
  primary: "bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-100",
  accent: "bg-accent-soft text-accent-foreground",
} as const;

export default function HomePage() {
  const currentYear = new Date().getFullYear();

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-overlay focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-md"
      >
        Lewati ke konten utama
      </a>

      <header className="sticky top-0 z-sticky border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-8 md:py-4">
          <Link
            href="/"
            aria-label={`${APP_NAME} - beranda`}
            className="inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Image
              src={LANDING_LOGO.light.src}
              alt={LANDING_LOGO.light.alt}
              width={LANDING_LOGO.light.width}
              height={LANDING_LOGO.light.height}
              priority
              sizes="(max-width: 768px) 144px, 192px"
              className="block h-9 w-auto md:h-10 dark:hidden"
            />
            <Image
              src={LANDING_LOGO.dark.src}
              alt={LANDING_LOGO.dark.alt}
              width={LANDING_LOGO.dark.width}
              height={LANDING_LOGO.dark.height}
              priority
              sizes="(max-width: 768px) 144px, 192px"
              className="hidden h-9 w-auto md:h-10 dark:block"
            />
          </Link>
          <nav aria-label="Aksi pengguna" className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Link
              href="/auth/sign-in"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "hidden sm:inline-flex",
              )}
            >
              Masuk
            </Link>
            <Link
              href="/auth/sign-up"
              className={cn(buttonVariants({ variant: "primary", size: "sm" }))}
            >
              Daftar
            </Link>
          </nav>
        </div>
      </header>

      <div id="main">
        <section
          aria-labelledby="hero-title"
          className="relative overflow-hidden"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-background to-accent-soft/30 dark:from-brand-900/30 dark:via-background dark:to-accent-soft/15"
          />
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 pb-16 pt-12 md:px-8 md:pt-20 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-16 lg:pb-24">
            <div className="space-y-6">
              <p className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 dark:bg-brand-900 dark:text-brand-100">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full bg-primary"
                />
                {LANDING_HERO.kicker}
              </p>
              <h1
                id="hero-title"
                className="text-balance text-4xl font-semibold leading-tight text-foreground md:text-5xl"
              >
                {LANDING_HERO.title}
              </h1>
              <p className="max-w-xl text-pretty text-base text-muted-foreground md:text-lg">
                {LANDING_HERO.description}
              </p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  href={LANDING_HERO.primaryCta.href}
                  className={cn(
                    buttonVariants({ variant: "primary", size: "lg" }),
                  )}
                >
                  {LANDING_HERO.primaryCta.label}
                </Link>
                <Link
                  href={LANDING_HERO.secondaryCta.href}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                  )}
                >
                  {LANDING_HERO.secondaryCta.label}
                </Link>
              </div>
            </div>

            <aside
              aria-label={LANDING_MODEL_SNAPSHOT.heading}
              className="relative hidden w-full max-w-md justify-self-center lg:block"
            >
              <div
                aria-hidden
                className="absolute -inset-x-2 -inset-y-3 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/15 via-primary-soft/10 to-accent/15 blur-xl"
              />
              <div className="rounded-3xl border border-border bg-surface p-7 shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {LANDING_MODEL_SNAPSHOT.heading}
                </p>
                <p className="mt-2 text-3xl font-semibold text-foreground">
                  {LANDING_MODEL_SNAPSHOT.name}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {LANDING_MODEL_SNAPSHOT.description}
                </p>
                <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  {LANDING_MODEL_SNAPSHOT.facts.map((fact) => {
                    const emphasisClass =
                      FACT_EMPHASIS_CLASSES[fact.emphasis ?? "neutral"];
                    return (
                      <div
                        key={fact.label}
                        className={cn(
                          "rounded-lg p-3",
                          emphasisClass,
                        )}
                      >
                        <dt className="text-xs opacity-80">{fact.label}</dt>
                        <dd className="mt-0.5 font-semibold">{fact.value}</dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            </aside>
          </div>
        </section>

        <section
          aria-labelledby="pillars-title"
          className="mx-auto w-full max-w-6xl px-4 py-16 md:px-8 md:py-20"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2
              id="pillars-title"
              className="text-3xl font-semibold text-foreground md:text-4xl"
            >
              {LANDING_PILLARS_HEADER.title}
            </h2>
            <p className="mt-3 text-base text-muted-foreground md:text-lg">
              {LANDING_PILLARS_HEADER.description}
            </p>
          </div>

          <ul
            role="list"
            className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {LANDING_PILLARS.map((pillar, index) => {
              const tone = PILLAR_TONE_CLASSES[pillar.tone];
              return (
                <li key={pillar.key} className="flex">
                  <article
                    aria-labelledby={`pillar-${pillar.key}-title`}
                    className="flex h-full w-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold",
                        tone.badge,
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3
                      id={`pillar-${pillar.key}-title`}
                      className={cn("mt-4 text-lg font-semibold", tone.accent)}
                    >
                      {pillar.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {pillar.description}
                    </p>
                    <ul
                      role="list"
                      className="mt-4 space-y-2 text-sm text-foreground"
                    >
                      {pillar.bullets.map((bullet) => (
                        <li key={bullet} className="flex gap-2">
                          <span
                            aria-hidden
                            className={cn(
                              "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                              tone.bullet,
                            )}
                          />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>

        <section
          aria-labelledby="trust-title"
          className="border-y border-border bg-surface-muted/40"
        >
          <div className="mx-auto w-full max-w-6xl px-4 py-14 md:px-8">
            <div className="max-w-3xl">
              <h2
                id="trust-title"
                className="text-2xl font-semibold text-foreground md:text-3xl"
              >
                {LANDING_TRUST_HEADER.title}
              </h2>
              <p className="mt-3 text-base text-muted-foreground">
                {LANDING_TRUST_HEADER.description}
              </p>
            </div>
            <ul role="list" className="mt-8 grid gap-5 md:grid-cols-3">
              {LANDING_TRUST_POINTS.map((point) => (
                <li
                  key={point.title}
                  className="rounded-xl border border-border bg-surface p-5"
                >
                  <p className="text-sm font-semibold text-primary">
                    {point.title}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {point.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          aria-labelledby="cta-title"
          className="mx-auto w-full max-w-6xl px-4 py-16 md:px-8 md:py-20"
        >
          <div className="rounded-3xl bg-gradient-to-br from-primary to-primary-soft px-6 py-10 text-primary-foreground shadow-lg md:px-12 md:py-14">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
              <div className="max-w-2xl space-y-3">
                <h2
                  id="cta-title"
                  className="text-2xl font-semibold md:text-3xl"
                >
                  {LANDING_CTA_BANNER.title}
                </h2>
                <p className="text-sm md:text-base">
                  {LANDING_CTA_BANNER.description}
                </p>
              </div>
              <Link
                href={LANDING_CTA_BANNER.cta.href}
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                  "shrink-0",
                )}
              >
                {LANDING_CTA_BANNER.cta.label}
              </Link>
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
          <p>
            &copy; {currentYear} {APP_NAME}. {LANDING_FOOTER.tagline}.
          </p>
          <p>
            {LANDING_FOOTER.note} &middot; {LANDING_FOOTER.locale}
          </p>
        </div>
      </footer>
    </main>
  );
}
