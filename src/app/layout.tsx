import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";

import "@/styles/globals.css";
import { APP_NAME, APP_LOCALE } from "@/config/app";
import { BROWSER_THEME_COLOR } from "@/config/theme";
import { Toaster } from "@/components/primitives/toaster";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeScript } from "@/components/theme/theme-script";

// Plus Jakarta Sans — Indonesian-origin sans by Tokotype. Loaded with display
// "swap" so first paint is never blocked, and only the weights we actually use
// are downloaded. Exposed as `--font-sans` so `tailwind.config.ts#fontFamily`
// picks it up everywhere without per-file edits.
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Peduli Stunting menghubungkan data stunting nasional, edukasi Buku KIA, dan pemantauan pertumbuhan anak dalam satu aplikasi.",
  icons: {
    icon: "/brand/icon-color.png",
    apple: "/brand/icon-color.png",
  },
  openGraph: {
    title: APP_NAME,
    locale: APP_LOCALE,
    type: "website",
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

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={plusJakartaSans.variable}
    >
      <head>
        <ThemeScript />
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
