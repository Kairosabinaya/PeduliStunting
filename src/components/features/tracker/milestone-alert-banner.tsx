import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { MILESTONE_ALERT_COPY } from "@/config/tracker";

export interface MilestoneAlertBannerProps {
  readonly delayedCount: number;
}

/**
 * Banner peringatan yang muncul di atas halaman Perkembangan ketika ada
 * satu atau lebih milestone dalam rentang usia anak ditandai terlambat.
 *
 * Mengikuti aturan Buku KIA 2024: satu jawaban "Tidak" pada rentang usia
 * saat ini sudah cukup untuk rujukan ke Puskesmas/posyandu. Tone tetap
 * lembut (warning oranye, bukan merah pekat) supaya orang tua tidak panik.
 */
export function MilestoneAlertBanner({
  delayedCount,
}: MilestoneAlertBannerProps) {
  if (delayedCount <= 0) return null;
  return (
    <section
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 p-4"
    >
      <span
        aria-hidden
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning/20 text-warning"
      >
        <AlertTriangle size={18} />
      </span>
      <div className="flex-1 space-y-1.5">
        <p className="text-sm font-semibold text-foreground">
          {MILESTONE_ALERT_COPY.title}
        </p>
        <p className="text-sm text-muted-foreground">
          {MILESTONE_ALERT_COPY.bodyFormat(delayedCount)}
        </p>
        <Link
          href={MILESTONE_ALERT_COPY.ctaHref}
          className="text-xs text-primary hover:underline"
        >
          {MILESTONE_ALERT_COPY.ctaLabel}
        </Link>
      </div>
    </section>
  );
}
