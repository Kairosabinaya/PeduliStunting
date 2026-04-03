/** Halaman Harga — pricing 3 tier: Free, Profesional, Institusi. */
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Harga",
  description: "Pilih paket yang sesuai dengan kebutuhan Anda.",
};

const TIERS = [
  {
    name: "Free",
    price: "Gratis",
    period: "",
    description: "Untuk mulai menjelajahi data stunting Indonesia.",
    features: [
      "Peta interaktif stunting",
      "Simulasi per-provinsi (3x/hari)",
      "Simulasi nasional",
      "Akses artikel edukasi",
      "Aktivitas interaktif",
    ],
    limitations: ["Tanpa report PDF", "Tanpa upload dataset"],
    cta: "Mulai Gratis",
    href: "/login",
    highlighted: false,
  },
  {
    name: "Profesional",
    price: "Rp49.000",
    period: "/bulan",
    description: "Untuk peneliti dan praktisi kesehatan.",
    features: [
      "Semua fitur Free",
      "Simulasi tanpa batas",
      "Report PDF profesional (10/bulan)",
      "Interpretasi AI hasil simulasi",
      "Upload dataset custom",
      "Riwayat simulasi lengkap",
    ],
    limitations: [],
    cta: "Langganan Sekarang",
    href: "/dashboard/akun",
    highlighted: true,
    tier: "profesional" as const,
    amount: 49000,
  },
  {
    name: "Institusi",
    price: "Rp149.000",
    period: "/bulan",
    description: "Untuk dinas kesehatan dan lembaga riset.",
    features: [
      "Semua fitur Profesional",
      "Report PDF tanpa batas",
      "Prioritas processing dataset",
      "Dukungan teknis prioritas",
    ],
    limitations: [],
    cta: "Langganan Sekarang",
    href: "/dashboard/akun",
    highlighted: false,
    tier: "institusi" as const,
    amount: 149000,
  },
] as const;

export default function HargaPage() {
  return (
    <>
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Pilih Paket Anda
          </h1>
          <p className="text-lg text-foreground/60 max-w-xl mx-auto">
            Akses fitur simulasi kebijakan stunting sesuai kebutuhan Anda.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-xl border p-6 flex flex-col ${
                tier.highlighted
                  ? "border-primary-500 bg-white shadow-lg ring-2 ring-primary-500/20"
                  : "border-primary-200 bg-white"
              }`}
            >
              {tier.highlighted && (
                <span className="self-start bg-primary-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  Paling Populer
                </span>
              )}
              <h2 className="text-xl font-bold text-foreground">{tier.name}</h2>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold text-foreground">{tier.price}</span>
                {tier.period && (
                  <span className="text-foreground/50">{tier.period}</span>
                )}
              </div>
              <p className="text-sm text-foreground/60 mb-6">{tier.description}</p>

              <ul className="space-y-2.5 mb-8 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <svg className="w-4 h-4 text-primary-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
                {tier.limitations.map((l) => (
                  <li key={l} className="flex items-start gap-2 text-sm text-foreground/40">
                    <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {l}
                  </li>
                ))}
              </ul>

              <Link
                href={tier.href}
                className={`block text-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  tier.highlighted
                    ? "bg-primary-600 text-white hover:bg-primary-700"
                    : "border border-primary-300 text-primary-700 hover:bg-primary-50"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
