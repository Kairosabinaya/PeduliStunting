/**
 * PetaPage — full-viewport interactive map with floating overlay panels.
 * Publik bisa melihat peta, tapi harus login untuk klik/interaksi detail.
 */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ProvinceMap,
  MapLegend,
  FloatingSummaryPanel,
  FloatingDetailPopup,
  YearTimeline,
  MapNavPills,
} from "@/components/map";
import { useStuntingData } from "@/hooks/use-stunting-data";
import { useProvinces } from "@/hooks/use-provinces";
import { DATA_YEARS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function PetaPage() {
  const [selectedYear, setSelectedYear] = useState<number>(
    DATA_YEARS[DATA_YEARS.length - 1]
  );
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(
    null
  );
  const [user, setUser] = useState<User | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const { stuntingMap, isLoading: stuntingLoading } = useStuntingData(selectedYear);
  const { provinces, isLoading: provincesLoading } = useProvinces();

  const isLoading = stuntingLoading || provincesLoading;

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

  function handleYearChange(year: number) {
    setSelectedYear(year);
    setSelectedProvinceId(null);
  }

  const selectedEntry = selectedProvinceId
    ? stuntingMap.get(selectedProvinceId)
    : null;

  const selectedProvinceName =
    provinces.find((p) => p.id === selectedProvinceId)?.name ?? null;

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Full-viewport map */}
      <div className="absolute inset-0">
        {isLoading ? (
          <div className="w-full h-full bg-gray-50 animate-pulse flex items-center justify-center">
            <p className="text-foreground/40">Memuat data peta...</p>
          </div>
        ) : (
          <ProvinceMap
            provinces={provinces}
            stuntingData={stuntingMap}
            selectedProvinceId={selectedProvinceId}
            onProvinceClick={handleProvinceClick}
            interactive={true}
          />
        )}
      </div>

      {/* Floating Summary Panel — top-left */}
      <div className="absolute top-4 left-4 z-[1000] max-md:top-2 max-md:left-2">
        <FloatingSummaryPanel
          stuntingData={stuntingMap}
          selectedYear={selectedYear}
          isLoading={isLoading}
        />
      </div>

      {/* Floating Nav Pills — top-right */}
      <div className="absolute top-4 right-4 z-[1000] max-md:top-2 max-md:right-2">
        <MapNavPills user={user} />
      </div>

      {/* Year Timeline — right-center */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] max-md:right-2">
        <YearTimeline
          years={DATA_YEARS}
          selectedYear={selectedYear}
          onYearChange={handleYearChange}
        />
      </div>

      {/* Map Legend — bottom-left */}
      <div className="absolute bottom-4 left-4 z-[1000] max-md:bottom-2 max-md:left-2">
        <MapLegend />
      </div>

      {/* Province Detail Popup — floating center */}
      {selectedProvinceId && selectedEntry && user && (
        <FloatingDetailPopup
          provinceName={selectedProvinceName}
          entry={selectedEntry}
          selectedYear={selectedYear}
          provinceId={selectedProvinceId}
          onClose={() => setSelectedProvinceId(null)}
        />
      )}

      {/* Login prompt modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/40">
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
    </div>
  );
}
