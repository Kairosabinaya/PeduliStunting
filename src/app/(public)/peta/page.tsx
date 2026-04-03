/**
 * PetaPage — halaman peta interaktif publik.
 * Publik bisa melihat peta, tapi harus login untuk klik/interaksi detail.
 */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProvinceMap } from "@/components/map";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useStuntingData } from "@/hooks/use-stunting-data";
import { DATA_YEARS, STUNTING_COLORS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { GeoJsonObject } from "geojson";
import type { User } from "@supabase/supabase-js";
import type { StuntingCategory } from "@/types/database";

export default function PetaPage() {
  const [selectedYear, setSelectedYear] = useState<number>(
    DATA_YEARS[DATA_YEARS.length - 1]
  );
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [geojsonData, setGeojsonData] = useState<GeoJsonObject | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const { stuntingMap, isLoading } = useStuntingData(selectedYear);

  // Load GeoJSON
  useEffect(() => {
    fetch("/geojson/indonesia-provinces.json")
      .then((res) => res.json())
      .then((data) => setGeojsonData(data))
      .catch(() => {});
  }, []);

  // Check auth
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
  }, []);

  function handleProvinceClick(provinceId: number) {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    setSelectedProvinceId(provinceId);
  }

  const selectedEntry = selectedProvinceId
    ? stuntingMap.get(selectedProvinceId)
    : null;

  // Find province name from GeoJSON
  const selectedProvinceName = geojsonData
    ? (
        (geojsonData as GeoJSON.FeatureCollection).features?.find(
          (f) => f.properties?.id === selectedProvinceId
        )?.properties?.name ?? null
      )
    : null;

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold">Peta Stunting Indonesia</h1>

            {/* Year selector */}
            <div className="flex gap-1">
              {DATA_YEARS.map((y) => (
                <button
                  key={y}
                  onClick={() => {
                    setSelectedYear(y);
                    setSelectedProvinceId(null);
                  }}
                  type="button"
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    selectedYear === y
                      ? "bg-primary-600 text-white"
                      : "bg-primary-50 text-primary-700 hover:bg-primary-100"
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Map */}
            <div className="flex-1 h-[500px] lg:h-[600px]">
              {isLoading ? (
                <div className="w-full h-full bg-primary-50 animate-pulse rounded-lg flex items-center justify-center">
                  <p className="text-foreground/40">Memuat data peta...</p>
                </div>
              ) : (
                <ProvinceMap
                  geojsonData={geojsonData}
                  stuntingData={stuntingMap}
                  selectedProvinceId={selectedProvinceId}
                  onProvinceClick={handleProvinceClick}
                  interactive={true}
                />
              )}
            </div>

            {/* Province detail panel */}
            {selectedProvinceId && selectedEntry && user && (
              <div className="lg:w-80 shrink-0">
                <div className="rounded-xl border border-primary-200 bg-white p-5 space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {selectedProvinceName}
                    </h2>
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white mt-2"
                      style={{
                        backgroundColor:
                          STUNTING_COLORS[selectedEntry.category],
                      }}
                    >
                      {selectedEntry.category}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-foreground/60">
                      Prevalensi Stunting
                    </p>
                    <p className="text-2xl font-bold">
                      {selectedEntry.prevalenceRate.toFixed(1)}%
                    </p>
                  </div>

                  <div className="text-sm text-foreground/60">
                    Tahun data: {selectedYear}
                  </div>

                  <Link
                    href={`/dashboard/simulasi?province=${selectedProvinceId}&year=${selectedYear}`}
                    className="block w-full text-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
                  >
                    Simulasikan Provinsi Ini
                  </Link>

                  <button
                    onClick={() => setSelectedProvinceId(null)}
                    type="button"
                    className="block w-full text-center rounded-lg border border-primary-200 px-4 py-2 text-sm hover:bg-primary-50 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Login prompt modal */}
        {showLoginPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-xl">
              <h3 className="text-lg font-semibold mb-2">Masuk Diperlukan</h3>
              <p className="text-sm text-foreground/60 mb-4">
                Masuk untuk melihat detail provinsi dan mengakses fitur simulasi.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/login?redirectTo=/peta"
                  className="flex-1 text-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
                >
                  Masuk
                </Link>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  type="button"
                  className="flex-1 rounded-lg border border-primary-200 px-4 py-2 text-sm font-medium hover:bg-primary-50 transition-colors"
                >
                  Nanti
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
