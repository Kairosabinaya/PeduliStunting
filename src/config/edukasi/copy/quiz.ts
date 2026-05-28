/**
 * Copy for ACT 9 — the interactive quiz. Question data and tier thresholds
 * live in `src/data/edukasi/quiz-questions.ts` and `quiz-tiers.ts`.
 */

export const QUIZ_COPY = {
  eyebrow: "Quiz interaktif",
  headlineLead: "Seberapa",
  headlineHighlight: { value: "sigap", variant: "white" as const },
  headlineTail: "Anda mencegah stunting?",
  intro:
    "10 pertanyaan singkat. Tidak ada nilai — hanya peta pengetahuan Anda. Jawaban dibandingkan dengan Buku KIA 2024.",
  startCta: "Mulai kuis",
  progressTemplate: (current: number, total: number): string =>
    `Soal ${current} dari ${total}`,
  optionMitos: "Ini mitos",
  optionFakta: "Ini fakta",
  feedbackCorrectLabel: "Tepat",
  feedbackWrongLabel: "Belum tepat",
  feedbackSourceLabel: "Sumber",
  nextQuestionCta: "Lanjut",
  finishCta: "Lihat hasil",
  resultEyebrow: "Hasil Anda",
  resultScoreTemplate: (correct: number, total: number): string =>
    `${correct} dari ${total} benar`,
  retryCta: "Ulangi kuis",
  shareCta: "Bagikan hasil",
  shareUnsupportedNote:
    "Browser belum mendukung berbagi langsung. Salin tautan halaman ini untuk dibagikan.",
  shareCopiedNote: "Tautan halaman tersalin.",
} as const;
