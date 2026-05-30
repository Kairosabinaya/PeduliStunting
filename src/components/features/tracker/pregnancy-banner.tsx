import Link from "next/link";
import { Heart } from "lucide-react";

import { buttonVariants } from "@/components/primitives/button";
import { PREGNANCY_PAGE_COPY, PREGNANCY_ROUTE } from "@/config/tracker";

/**
 * Banner pengantar modul Kehamilan di halaman `/tracker`. Menampilkan
 * judul ringkas + CTA membuka halaman kehamilan. Sengaja menjadi banner
 * terpisah (bukan card di grid anak) karena persona ibu hamil belum
 * tentu memiliki profil anak.
 */
export function PregnancyBanner() {
  return (
    <aside className="flex flex-col gap-3 rounded-xl border border-accent/40 bg-accent/10 p-4 sm:flex-row sm:items-center">
      <span
        aria-hidden
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground"
      >
        <Heart size={18} />
      </span>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-semibold text-foreground">
          {PREGNANCY_PAGE_COPY.title}
        </p>
        <p className="text-sm text-muted-foreground">
          {PREGNANCY_PAGE_COPY.description}
        </p>
      </div>
      <Link
        href={PREGNANCY_ROUTE}
        className={buttonVariants({ variant: "primary", size: "sm" })}
      >
        Buka catatan kehamilan
      </Link>
    </aside>
  );
}
