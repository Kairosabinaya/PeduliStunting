/**
 * 11-ACT scrollytelling composition. Single source of truth for the longform
 * edukasi narrative — rendered as-is by both `/` (unauthenticated landing-
 * before-login) and `/edukasi` (authenticated long-read). Both surfaces
 * stay linked: any edit to the ACT order, the section components, or this
 * file propagates to both routes automatically.
 *
 * Why share instead of duplicating: requirement gathering called for a
 * "linked" pair — kalau satu di-edit harus ke-edit dua-duanya (lihat ADR-
 * 0010 §"Catatan implementasi"). Maintaining two parallel arrangements
 * would inevitably drift.
 *
 * `LenisProvider` lives OUTSIDE this composer. `/edukasi/layout.tsx` wraps
 * children in Lenis for smooth-scroll; the landing wrapper opts out so it
 * does not fight the scroll-linked map filter inside `LandingMapBackground`.
 *
 * The `variant` prop tailors the few small differences between the two
 * surfaces (currently: whether the hero shows Masuk / Daftar CTAs). The
 * 11 ACT sections themselves are identical — variant only flows into the
 * sections that need to differ.
 */

import { HeroSection } from "@/components/features/edukasi/act-01-hero/hero-section";
import { StakesSection } from "@/components/features/edukasi/act-02-stakes/stakes-section";
import { HistorySection } from "@/components/features/edukasi/act-03-history/history-section";
import { DeterminantSection } from "@/components/features/edukasi/act-04-determinant/determinant-section";
import { TimelineSection } from "@/components/features/edukasi/act-05-timeline/timeline-section";
import { GuideSection } from "@/components/features/edukasi/act-06-guide/guide-section";
import { MythsSection } from "@/components/features/edukasi/act-07-myths/myths-section";
import { PosyanduSection } from "@/components/features/edukasi/act-08-posyandu/posyandu-section";
import { QuizSection } from "@/components/features/edukasi/act-09-quiz/quiz-section";
import { MapBridgeSection } from "@/components/features/edukasi/act-10-map-bridge/map-bridge-section";
import { ClosingSection } from "@/components/features/edukasi/act-11-closing/closing-section";

export interface EdukasiScrollytellingProps {
  /**
   * `"landing"` for the unauthenticated `/` surface (hero shows Masuk /
   * Daftar CTAs). `"edukasi"` (default) for the authenticated `/edukasi`
   * long-read.
   */
  readonly variant?: "landing" | "edukasi";
}

export function EdukasiScrollytelling({
  variant = "edukasi",
}: EdukasiScrollytellingProps = {}) {
  const isLanding = variant === "landing";
  return (
    <div className="snap-scrollytelling">
      <HeroSection showAuthCtas={isLanding} />
      <StakesSection />
      <HistorySection />
      <DeterminantSection />
      <TimelineSection />
      <GuideSection />
      <MythsSection />
      <PosyanduSection />
      <QuizSection />
      <MapBridgeSection />
      <ClosingSection />
    </div>
  );
}
