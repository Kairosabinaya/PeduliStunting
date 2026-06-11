import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { headers } from "next/headers";

import "@/styles/globals.css";
import "@/lib/zod-jitless";
import { APP_NAME, APP_LOCALE, APP_URL } from "@/config/app";
import { CSP_NONCE_HEADER } from "@/config/security";
import { APP_DESCRIPTION, FAVICONS, OG_IMAGE } from "@/config/seo";
import { BROWSER_THEME_COLOR } from "@/config/theme";
import { Toaster } from "@/components/primitives/toaster";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeScript } from "@/components/theme/theme-script";

// Plus Jakarta Sans — Indonesian-origin sans by Tokotype. Only the weights we
// actually use are downloaded. Exposed as `--font-sans` so
// `tailwind.config.ts#fontFamily` picks it up everywhere without per-file
// edits.
//
// display "optional" (deliberate deviation from project guidelines Section 7's
// "swap"): with swap, the late-arriving webfont repainted the largest text
// on every route under mobile throttling, re-issuing the LCP entry 3-5 s
// after first paint and capping Lighthouse mobile Performance in the 60s.
// "optional" keeps the metric-compatible fallback for the slow first visit
// (no FOIT, no swap-repaint, LCP locks at first paint) and uses the brand
// font from cache on every visit after.
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "optional",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  icons: {
    icon: [
      { url: FAVICONS.icon32, sizes: "32x32", type: "image/png" },
      { url: FAVICONS.icon192, sizes: "192x192", type: "image/png" },
    ],
    apple: FAVICONS.appleTouch,
  },
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    url: "/",
    siteName: APP_NAME,
    locale: APP_LOCALE,
    type: "website",
    images: [
      {
        url: OG_IMAGE.path,
        width: OG_IMAGE.width,
        height: OG_IMAGE.height,
        alt: OG_IMAGE.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESCRIPTION,
    images: [OG_IMAGE.path],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // `cover` lets content render under the iOS notch / Dynamic Island; pages
  // opt into `env(safe-area-inset-*)` padding where they need to avoid it.
  // Without this, safe-area utilities are silently no-ops on iOS.
  viewportFit: "cover",
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: BROWSER_THEME_COLOR.light,
    },
    { media: "(prefers-color-scheme: dark)", color: BROWSER_THEME_COLOR.dark },
  ],
};

export default async function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  // CSP nonce minted by the proxy; the inline theme script must carry it or
  // the nonce-based script-src would block it (project guidelines Section 6).
  const nonce = (await headers()).get(CSP_NONCE_HEADER) ?? undefined;
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={plusJakartaSans.variable}
    >
      <head>
        <ThemeScript nonce={nonce} />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
