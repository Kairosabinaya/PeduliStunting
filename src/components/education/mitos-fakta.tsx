/** MitosFakta — Interactive quiz: classify stunting statements as Mitos or Fakta. */
"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface QuizItem {
  id: number;
  statement: string;
  answer: "mitos" | "fakta";
  explanation: string;
}

const QUIZ_DATA: QuizItem[] = [
  {
    id: 1,
    statement: "Stunting hanya masalah tinggi badan pendek.",
    answer: "mitos",
    explanation:
      "Stunting bukan hanya soal tinggi badan. Anak yang mengalami stunting juga mengalami gangguan perkembangan otak, daya tahan tubuh lemah, dan risiko penyakit kronis di masa dewasa.",
  },
  {
    id: 2,
    statement: "ASI eksklusif selama 6 bulan pertama membantu mencegah stunting.",
    answer: "fakta",
    explanation:
      "ASI eksklusif memberikan nutrisi optimal dan antibodi yang melindungi bayi dari infeksi, faktor penting pencegahan stunting.",
  },
  {
    id: 3,
    statement: "Anak pendek pasti karena keturunan atau genetik.",
    answer: "mitos",
    explanation:
      "Genetik hanya menyumbang sebagian kecil. Stunting terutama disebabkan oleh kekurangan gizi kronis dan infeksi berulang, bukan genetik.",
  },
  {
    id: 4,
    statement: "1.000 hari pertama kehidupan adalah periode kritis untuk mencegah stunting.",
    answer: "fakta",
    explanation:
      "Periode sejak kehamilan hingga usia 2 tahun (1.000 hari pertama) adalah window of opportunity untuk mencegah stunting secara permanen.",
  },
  {
    id: 5,
    statement: "Stunting hanya terjadi di daerah pedesaan.",
    answer: "mitos",
    explanation:
      "Stunting juga terjadi di perkotaan. Penyebabnya kompleks: pola makan buruk, sanitasi tidak memadai, dan akses kesehatan terbatas dapat terjadi di mana saja.",
  },
  {
    id: 6,
    statement: "Sanitasi dan akses air bersih berpengaruh terhadap stunting.",
    answer: "fakta",
    explanation:
      "Sanitasi buruk menyebabkan infeksi berulang pada anak, mengganggu penyerapan nutrisi, dan berkontribusi langsung terhadap stunting.",
  },
  {
    id: 7,
    statement: "Stunting bisa disembuhkan sepenuhnya setelah usia 5 tahun.",
    answer: "mitos",
    explanation:
      "Setelah usia 2-3 tahun, dampak stunting sulit dipulihkan sepenuhnya. Intervensi paling efektif dilakukan pada 1.000 hari pertama.",
  },
  {
    id: 8,
    statement: "Imunisasi dasar lengkap membantu mencegah stunting.",
    answer: "fakta",
    explanation:
      "Imunisasi melindungi anak dari penyakit infeksi yang dapat mengganggu pertumbuhan dan penyerapan nutrisi.",
  },
  {
    id: 9,
    statement: "Memberikan banyak nasi saja sudah cukup untuk mencegah stunting.",
    answer: "mitos",
    explanation:
      "Pencegahan stunting membutuhkan gizi seimbang: protein, lemak, vitamin, dan mineral. Karbohidrat saja tidak cukup untuk tumbuh kembang optimal.",
  },
  {
    id: 10,
    statement: "Prevalensi stunting di Indonesia telah menurun dalam 5 tahun terakhir.",
    answer: "fakta",
    explanation:
      "Prevalensi stunting di Indonesia menurun dari 27.7% (2019) menjadi 21.5% (2023), namun masih di atas target WHO di bawah 20%.",
  },
];

export function MitosFakta({ className }: { className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState<"mitos" | "fakta" | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const currentItem = QUIZ_DATA[currentIndex];
  const isCorrect = userAnswer === currentItem?.answer;
  const showExplanation = userAnswer !== null;

  const handleAnswer = useCallback(
    (answer: "mitos" | "fakta") => {
      if (userAnswer !== null) return;
      setUserAnswer(answer);
      if (answer === currentItem.answer) {
        setScore((s) => s + 1);
      }
    },
    [userAnswer, currentItem]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < QUIZ_DATA.length - 1) {
      setCurrentIndex((i) => i + 1);
      setUserAnswer(null);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex]);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setUserAnswer(null);
    setScore(0);
    setIsComplete(false);
  }, []);

  if (isComplete) {
    const pct = Math.round((score / QUIZ_DATA.length) * 100);
    return (
      <div className={cn("rounded-xl border border-primary-200 bg-white p-8 text-center", className)}>
        <h3 className="text-2xl font-bold text-primary-700 mb-2">Kuis Selesai!</h3>
        <p className="text-5xl font-bold text-primary-600 my-6">
          {score}/{QUIZ_DATA.length}
        </p>
        <p className="text-foreground/60 mb-2">Skor kamu: {pct}%</p>
        <p className="text-foreground/60 mb-8">
          {pct >= 80
            ? "Luar biasa! Kamu sudah sangat paham tentang stunting."
            : pct >= 50
              ? "Bagus! Terus pelajari lebih lanjut tentang stunting."
              : "Jangan menyerah! Pelajari lebih lanjut tentang stunting di halaman Edukasi kami."}
        </p>
        <button
          onClick={handleRestart}
          type="button"
          className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        >
          Ulangi Kuis
        </button>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-primary-200 bg-white overflow-hidden", className)}>
      {/* Progress */}
      <div className="bg-primary-50 px-6 py-3 flex items-center justify-between text-sm">
        <span className="text-foreground/50">
          Pertanyaan {currentIndex + 1} dari {QUIZ_DATA.length}
        </span>
        <span className="font-medium text-primary-600">Skor: {score}</span>
      </div>

      <div className="p-6 md:p-8">
        {/* Statement */}
        <p className="text-lg md:text-xl font-medium text-foreground text-center mb-8 min-h-[4rem]">
          &ldquo;{currentItem.statement}&rdquo;
        </p>

        {/* Answer buttons */}
        {!showExplanation && (
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleAnswer("mitos")}
              type="button"
              className="flex-1 max-w-[200px] rounded-lg border-2 border-accent-300 bg-accent-50 px-6 py-3 font-semibold text-accent-600 hover:bg-accent-100 transition-colors"
            >
              MITOS
            </button>
            <button
              onClick={() => handleAnswer("fakta")}
              type="button"
              className="flex-1 max-w-[200px] rounded-lg border-2 border-stunting-rendah/50 bg-green-50 px-6 py-3 font-semibold text-green-700 hover:bg-green-100 transition-colors"
            >
              FAKTA
            </button>
          </div>
        )}

        {/* Explanation */}
        {showExplanation && (
          <div className="space-y-4">
            <div
              className={cn(
                "rounded-lg p-4 text-center font-semibold",
                isCorrect
                  ? "bg-green-50 text-green-700"
                  : "bg-accent-50 text-accent-600"
              )}
            >
              {isCorrect ? "Benar!" : "Kurang tepat."} Jawabannya adalah{" "}
              <span className="uppercase">{currentItem.answer}</span>.
            </div>
            <p className="text-foreground/70 leading-relaxed">{currentItem.explanation}</p>
            <div className="text-center pt-2">
              <button
                onClick={handleNext}
                type="button"
                className="rounded-lg bg-primary-600 px-8 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
              >
                {currentIndex < QUIZ_DATA.length - 1 ? "Lanjut" : "Lihat Skor"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
