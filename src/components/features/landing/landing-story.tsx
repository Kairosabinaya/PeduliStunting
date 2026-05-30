/**
 * Landing-only narrative orchestrator. Re-sequences the shared edukasi ACT
 * sections into a four-act emotional arc and interleaves the landing-only
 * connective beats + the signature scrubbed choropleth. The authenticated
 * `/edukasi` route keeps its own linear 11-ACT order via
 * `EdukasiScrollytelling`; only the public landing uses this arrangement.
 *
 * Arc:
 *   I.  Jendela 1.000 Hari — Hero, Stakes, Timeline
 *   II. Beban yang Nyata   — History, Determinant, Guide
 *   III.Skala & Urgensi    — Choropleth (signature), Posyandu, Myths
 *   IV. Yang Bisa Berubah  — Quiz, Closing
 *
 * Server component: every child is server-rendered; client interactivity lives
 * inside the individual sections (scrubber, quiz, tabs, flip cards).
 */

import { CONNECTIVE_BEATS } from "@/config/landing-story";

import { HeroSection } from "@/components/features/edukasi/act-01-hero/hero-section";
import { StakesSection } from "@/components/features/edukasi/act-02-stakes/stakes-section";
import { HistorySection } from "@/components/features/edukasi/act-03-history/history-section";
import { DeterminantSection } from "@/components/features/edukasi/act-04-determinant/determinant-section";
import { TimelineSection } from "@/components/features/edukasi/act-05-timeline/timeline-section";
import { GuideSection } from "@/components/features/edukasi/act-06-guide/guide-section";
import { MythsSection } from "@/components/features/edukasi/act-07-myths/myths-section";
import { PosyanduSection } from "@/components/features/edukasi/act-08-posyandu/posyandu-section";
import { QuizSection } from "@/components/features/edukasi/act-09-quiz/quiz-section";
import { ClosingSection } from "@/components/features/edukasi/act-11-closing/closing-section";

import { ConnectiveBeat } from "./connective-beat";
import { ChoroplethStorySection } from "./scroll-choropleth/choropleth-story-section";

export function LandingStory() {
  return (
    <div className="snap-scrollytelling">
      {/* ACT I — Jendela 1.000 Hari */}
      <HeroSection />
      <ConnectiveBeat beat={CONNECTIVE_BEATS.humanCost} />
      <StakesSection />
      <TimelineSection />

      {/* ACT II — Beban yang Nyata */}
      <ConnectiveBeat beat={CONNECTIVE_BEATS.inequity} />
      <HistorySection />
      <DeterminantSection />
      <GuideSection />

      {/* ACT III — Skala & Urgensi */}
      <ChoroplethStorySection />
      <PosyanduSection />
      <MythsSection />

      {/* ACT IV — Yang Bisa Berubah */}
      <ConnectiveBeat beat={CONNECTIVE_BEATS.agency} />
      <QuizSection />
      <ClosingSection />
    </div>
  );
}
