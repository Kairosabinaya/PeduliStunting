import Image from "next/image";
import Link from "next/link";

import { APP_NAME } from "@/config/app";
import { AUTH_EYEBROW } from "@/config/auth";

/**
 * Compact brand strip rendered above the form column on viewports
 * smaller than `lg`. The desktop brand panel is hidden at those sizes,
 * so this strip carries the visual brand identity (logo + eyebrow) into
 * the form column without sacrificing form real estate.
 *
 * Logo links back to landing — same affordance as the desktop logo.
 */
export function AuthMobileBrandStrip() {
  return (
    <div className="flex items-center gap-3 lg:hidden">
      <Link
        href="/"
        aria-label={`${APP_NAME} – beranda`}
        className="inline-flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <Image
          src="/brand/logo-horizontal-color.png"
          alt={APP_NAME}
          width={160}
          height={40}
          priority
          sizes="(max-width: 640px) 120px, 140px"
          className="block h-8 w-auto dark:hidden sm:h-9"
        />
        <Image
          src="/brand/logo-horizontal-white.png"
          alt={APP_NAME}
          width={160}
          height={40}
          priority
          sizes="(max-width: 640px) 120px, 140px"
          className="hidden h-8 w-auto dark:block sm:h-9"
        />
      </Link>
      <span className="eyebrow truncate">{AUTH_EYEBROW}</span>
    </div>
  );
}
