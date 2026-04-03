/**
 * SimulasiPage — Boundary class untuk halaman simulasi per-provinsi.
 * Sesuai dengan class SimulasiPage (<<boundary>>) di Class Diagram.
 */
"use client";

import { useState } from "react";
import { useProvinces } from "@/hooks/use-provinces";
import { useSimulation } from "@/hooks/use-simulation";
import { VariableCard, PredictionGauge } from "@/components/simulation";
import { DATA_YEARS, MAX_FREE_SIMULATIONS_PER_DAY } from "@/lib/constants";

export default function SimulasiPage() {
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(DATA_YEARS[DATA_YEARS.length - 1]);

  const { provinces, isLoading: loadingProvinces } = useProvinces();
  const {
    values,
    originalValues,
    prediction,
    isDirty,
    isReady,
    isLoading,
    isSaving,
    todayCount,
    predictorMeta,
    setValue,
    resetAll,
    saveSimulation,
  } = useSimulation(selectedProvinceId, selectedYear);

  const [saveMessage, setSaveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSave() {
    setSaveMessage(null);
    const result = await saveSimulation();
    if (result?.success) {
      setSaveMessage({ type: "success", text: "Simulasi berhasil disimpan!" });
    } else if (result?.error) {
      setSaveMessage({ type: "error", text: result.error });
    }
    setTimeout(() => setSaveMessage(null), 4000);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Simulasi Per-Provinsi</h1>

      {/* Selectors */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label htmlFor="province" className="block text-sm font-medium mb-1">
            Provinsi
          </label>
          <select
            id="province"
            value={selectedProvinceId ?? ""}
            onChange={(e) =>
              setSelectedProvinceId(e.target.value ? Number(e.target.value) : null)
            }
            disabled={loadingProvinces}
            className="w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          >
            <option value="">Pilih provinsi...</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-40">
          <label htmlFor="year" className="block text-sm font-medium mb-1">
            Tahun Basis
          </label>
          <select
            id="year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          >
            {DATA_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Empty state */}
      {!selectedProvinceId && (
        <div className="text-center py-16 text-foreground/50">
          <p className="text-lg">Pilih provinsi dan tahun untuk memulai simulasi.</p>
          <p className="mt-2 text-sm">
            Geser slider variabel untuk melihat prediksi perubahan kategori stunting secara real-time.
          </p>
        </div>
      )}

      {/* Loading state */}
      {selectedProvinceId && isLoading && (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="mt-4 text-foreground/50">Memuat data simulasi...</p>
        </div>
      )}

      {/* No data state */}
      {selectedProvinceId && !isLoading && !isReady && (
        <div className="text-center py-16 text-foreground/50">
          <p className="text-lg">Data tidak tersedia untuk kombinasi ini.</p>
          <p className="mt-2 text-sm">Coba pilih provinsi atau tahun yang berbeda.</p>
        </div>
      )}

      {/* Main content: prediction panel + sliders */}
      {isReady && originalValues && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sliders */}
          <div className="flex-1 order-2 lg:order-1">
            <h2 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider mb-4">
              Variabel Prediktor
            </h2>
            <div className="grid gap-3">
              {predictorMeta.map((meta) => {
                const val = values[meta.code];
                const orig = originalValues[meta.code];
                if (val === undefined || orig === undefined) return null;
                return (
                  <VariableCard
                    key={meta.code}
                    meta={meta}
                    value={val}
                    originalValue={orig}
                    onChange={setValue}
                  />
                );
              })}
            </div>
          </div>

          {/* Prediction panel (sticky) */}
          <div className="lg:w-80 order-1 lg:order-2">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="rounded-xl border border-primary-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider mb-4">
                  Prediksi Kategori Stunting
                </h2>
                <PredictionGauge prediction={prediction} />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={resetAll}
                  disabled={!isDirty}
                  type="button"
                  className="flex-1 rounded-lg border border-primary-200 px-4 py-2 text-sm font-medium hover:bg-primary-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !prediction}
                  type="button"
                  className="flex-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>

              {/* Daily count */}
              <p className="text-xs text-center text-foreground/50">
                {todayCount}/{MAX_FREE_SIMULATIONS_PER_DAY} simulasi hari ini
              </p>

              {/* Save message */}
              {saveMessage && (
                <div
                  className={`rounded-lg p-3 text-sm ${
                    saveMessage.type === "success"
                      ? "bg-primary-50 text-primary-700"
                      : "bg-accent-50 text-accent-600"
                  }`}
                >
                  {saveMessage.text}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
