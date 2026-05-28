/**
 * Quiz result tiers (ACT 9). Thresholds picked so the lower tier feels
 * inviting (any reader makes it past zero), the middle tier acknowledges
 * partial knowledge, and the top tier rewards near-perfect mastery.
 */

import { QUIZ_TOTAL } from "./quiz-questions";

export type QuizTierId = "pemula" | "pembelajar" | "pejuang";

export interface QuizTier {
  readonly id: QuizTierId;
  /** Inclusive lower bound (correct answers). */
  readonly min: number;
  /** Inclusive upper bound (correct answers). */
  readonly max: number;
  readonly title: string;
  readonly description: string;
  /** Token-aligned visual tone — maps to badge variants in the result card. */
  readonly tone: "primary" | "success" | "warm";
}

export const QUIZ_TIERS: readonly QuizTier[] = [
  {
    id: "pemula",
    min: 0,
    max: 4,
    title: "Pemula Semangat",
    description:
      "Wawasan Anda baru di permulaan, dan itu langkah yang bagus. Mulai dari konsep 1.000 HPK lalu kunjungi posyandu terdekat untuk pendampingan.",
    tone: "warm",
  },
  {
    id: "pembelajar",
    min: 5,
    max: 7,
    title: "Pembelajar Aktif",
    description:
      "Anda sudah paham banyak hal. Tinggal beberapa miskonsepsi yang perlu diluruskan — pelajari kembali Mitos vs Fakta untuk melengkapinya.",
    tone: "primary",
  },
  {
    id: "pejuang",
    min: 8,
    max: QUIZ_TOTAL,
    title: "Pejuang Gizi",
    description:
      "Anda sangat memahami pencegahan stunting. Bagikan pengetahuan ini ke keluarga, tetangga, dan komunitas — itulah cara mengubah angka prevalensi di daerah Anda.",
    tone: "success",
  },
] as const;

/**
 * Resolve a tier from a raw correct-answer count. Returns `null` only when
 * the count is out of range (negative or beyond the question pool) — the
 * caller can treat that as a programming error.
 */
export function resolveQuizTier(correct: number): QuizTier | null {
  if (correct < 0 || correct > QUIZ_TOTAL) return null;
  return (
    QUIZ_TIERS.find((tier) => correct >= tier.min && correct <= tier.max) ??
    null
  );
}
