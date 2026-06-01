/**
 * Copy for ACT 9 — the interactive quiz. Question data and tier thresholds
 * live in `src/data/edukasi/quiz-questions.ts` and `quiz-tiers.ts`.
 */

export const QUIZ_COPY = {
  eyebrow: "PERIKSA KESIAPANMU",
  headlineLead: "Seberapa",
  headlineHighlight: { value: "sigap", variant: "white" as const },
  headlineTail: "Anda mencegah stunting?",
  intro:
    "Jawab 10 pertanyaan singkat untuk melihat sejauh mana kamu memahami pencegahan stunting.",
  startCta: "Mulai kuis",
  progressTemplate: (current: number, total: number): string =>
    `Soal ${current} dari ${total}`,
  optionMitos: "Ini mitos",
  optionFakta: "Ini fakta",
  feedbackCorrectLabel: "Tepat",
  feedbackWrongLabel: "Belum tepat",
  correctAnswerLabel: "Jawaban tepat",
  feedbackSourceLabel: "Sumber",
  prevQuestionLabel: "Soal sebelumnya",
  nextQuestionLabel: "Soal berikutnya",
  viewResultLabel: "Lihat hasil",
  tapToContinueHint: "Ketuk penjelasan untuk lanjut",
  resultEyebrow: "Hasil Anda",
  resultScoreTemplate: (correct: number, total: number): string =>
    `${correct} dari ${total} benar`,
  retryCta: "Ulangi kuis",
  shareCta: "Bagikan kuis",
  shareUnsupportedNote:
    "Browser belum mendukung berbagi langsung. Salin tautan halaman ini untuk dibagikan.",
  shareCopiedNote: "Tautan halaman tersalin.",
} as const;
