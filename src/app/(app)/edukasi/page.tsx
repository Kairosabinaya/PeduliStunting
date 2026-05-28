import type { Metadata } from "next";

import { EDUKASI_METADATA } from "@/config/edukasi";
import { FootnoteList } from "@/components/features/edukasi/primitives";
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

export const metadata: Metadata = EDUKASI_METADATA;

// Phase 2 of the scrollytelling rewrite. Lihat docs/adr/0007. Sebelas
// ACT mengikuti arc STAKES → BLUEPRINT → ACTION sesuai spec v2:
//   ACT 1  Hero            — cold open + per-word reveal
//   ACT 2  Stakes          — pinned 3-frame synapse + brain dev cards
//   ACT 3  History         — line chart 2013–2024 + target 2029/2045
//   ACT 4  Determinant     — 5 concentric rings + quintile chart
//   ACT 5  Timeline (HPK)  — pinned 6-frame morph + day counter
//   ACT 6  Guide           — tabs panduan per usia
//   ACT 7  Myths           — 10 flip card mitos vs fakta
//   ACT 8  Posyandu        — 4 layanan + imunisasi modal
//   ACT 9  Quiz            — state machine 10 soal + tier
//   ACT 10 Map bridge      — provinsi highlight + CTA ke /map
//   ACT 11 Closing         — penutup + footnotes
export default function EdukasiPage() {
  return (
    <>
      <HeroSection />
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
      <FootnoteList />
    </>
  );
}
