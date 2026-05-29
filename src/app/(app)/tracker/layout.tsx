import type { ReactNode } from "react";

import { CekCepatBanner } from "@/components/features/tracker/cek-cepat-banner";

interface TrackerLayoutProps {
  readonly children: ReactNode;
}

/**
 * Tracker-scoped layout. Renders the global "Cek Cepat" floating widget
 * alongside the route subtree so it is present on /tracker, /tracker/anak/*,
 * and every nested page without leaking onto /map or /edukasi.
 *
 * Auth + chrome (FloatingHeader) are handled by the parent `(app)` layout —
 * this layer is purely the tracker-specific overlay.
 */
export default function TrackerLayout({ children }: TrackerLayoutProps) {
  return (
    <>
      {children}
      <CekCepatBanner />
    </>
  );
}
