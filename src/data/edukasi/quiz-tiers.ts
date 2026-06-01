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
    title: "Kurang Paham",
    description:
      "Tidak apa-apa, ini langkah awal yang baik. Mulai dari memahami 1.000 hari pertama kehidupan, lalu gunakan posyandu sebagai tempat bertanya dan memantau tumbuh kembang anak.",
    tone: "warm",
  },
  {
    id: "pembelajar",
    min: 5,
    max: 7,
    title: "Cukup Paham",
    description:
      "Kamu sudah memahami banyak hal penting tentang pencegahan stunting. Tinggal beberapa miskonsepsi yang perlu diluruskan agar keputusan sehari-hari makin tepat.",
    tone: "primary",
  },
  {
    id: "pejuang",
    min: 8,
    max: QUIZ_TOTAL,
    title: "Sangat Paham",
    description:
      "Pemahamanmu sudah kuat. Pengetahuan ini bisa membantu keluarga, tetangga, dan komunitas mengambil langkah kecil yang berdampak besar bagi tumbuh kembang anak.",
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
