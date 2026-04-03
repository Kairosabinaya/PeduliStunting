/** Halaman Aktivitas Interaktif — kuis Mitos vs Fakta tentang stunting. */
import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MitosFakta, RandomFact } from "@/components/education";

export const metadata: Metadata = {
  title: "Aktivitas Interaktif — Mitos vs Fakta Stunting",
  description:
    "Uji pemahamanmu tentang stunting melalui kuis interaktif Mitos vs Fakta.",
};

export default function AktivitasPage() {
  return (
    <>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-semibold mb-2">Aktivitas Interaktif</h1>
        <p className="text-foreground/60 mb-8">
          Uji pemahamanmu tentang stunting melalui kuis interaktif berikut.
          Tentukan apakah pernyataan di bawah ini adalah mitos atau fakta!
        </p>

        <MitosFakta className="mb-8" />

        <RandomFact className="mt-8" />
      </main>
      <Footer />
    </>
  );
}
