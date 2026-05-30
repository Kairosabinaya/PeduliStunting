import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { APP_NAME, LANDING_ROUTE } from "@/config/app";
import { AUTH_LABELS } from "@/config/auth";

import { AuthBrandPanel } from "./auth-brand-panel";

interface AuthShellProps {
  readonly children: ReactNode;
}

/**
 * Shared split-screen shell for every auth surface (sign-in, sign-up,
 * reset-password, check-email, update-password). Rendered by BOTH the
 * `(auth)` and `(auth-fn)` group layouts so the five pages are visually
 * identical.
 *
 * Desktop (`lg+`): a 50/50 grid with the gradient {@link AuthBrandPanel} on
 * the left (sticky, full viewport) and a calm, card-less form column on the
 * right. Tablet and mobile collapse to the form column alone, with a compact
 * brand mark and a back-to-home link in a slim top bar — the panel is never
 * mounted below `lg`, so the heavier decoration never ships to small screens.
 *
 * The previous auth shell rendered a full MapLibre WebGL choropleth behind a
 * glass card; this redesign drops it entirely, so auth routes no longer carry
 * the map bundle (a meaningful win on mid-range Android per project guidelines Section 7).
 *
 * Server Component: the only interactive island is {@link ThemeToggle}.
 */
export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="grid min-h-dvh grid-cols-1 bg-background text-foreground lg:grid-cols-2">
      <aside className="relative hidden lg:block">
        <div className="sticky top-0 h-dvh">
          <AuthBrandPanel />
        </div>
      </aside>

      <main className="relative flex min-h-dvh flex-col">
        <div className="pt-safe-4 flex items-center gap-4 px-6 pb-2 sm:px-8 lg:px-12">
          <span className="flex items-center lg:hidden">
            <Image
              src="/brand/logo-stacked-color.png"
              width={40}
              height={40}
              alt={APP_NAME}
              sizes="40px"
              priority
              className="block h-10 w-10 dark:hidden"
            />
            <Image
              src="/brand/logo-stacked-white.png"
              width={40}
              height={40}
              alt={APP_NAME}
              sizes="40px"
              priority
              className="hidden h-10 w-10 dark:block"
            />
          </span>
          <div className="ml-auto flex items-center gap-1">
            <Link
              href={LANDING_ROUTE}
              className="inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus lg:hidden"
            >
              {AUTH_LABELS.backToHome}
            </Link>
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}
