import Link from "next/link";
import { Lightbulb } from "lucide-react";

import { IMMUNIZATION_EDUCATION_COPY } from "@/config/tracker";

/**
 * Edukasi banner kecil di atas timeline imunisasi. Menjelaskan kaitan
 * imunisasi tidak lengkap dengan risiko stunting (sumber Buku KIA 2024)
 * dan menautkan ke halaman `/edukasi`.
 *
 * Bukan komponen interaktif beyond link — sengaja ringan tanpa motion
 * supaya tidak menahan jalur baca utama (progress ring + timeline).
 */
export function ImmunizationEducationCard() {
  return (
    <aside className="flex flex-col gap-2 rounded-xl border border-accent/40 bg-accent/10 p-4 sm:flex-row sm:items-start sm:gap-3">
      <span
        aria-hidden
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground"
      >
        <Lightbulb size={16} />
      </span>
      <div className="flex-1 space-y-1.5">
        <p className="text-sm font-semibold text-foreground">
          {IMMUNIZATION_EDUCATION_COPY.title}
        </p>
        <p className="text-sm text-muted-foreground">
          {IMMUNIZATION_EDUCATION_COPY.body}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Link
            href={IMMUNIZATION_EDUCATION_COPY.ctaHref}
            className="text-primary hover:underline"
          >
            {IMMUNIZATION_EDUCATION_COPY.ctaLabel}
          </Link>
          <span aria-hidden>·</span>
          <span>{IMMUNIZATION_EDUCATION_COPY.sourceLabel}</span>
        </div>
      </div>
    </aside>
  );
}
