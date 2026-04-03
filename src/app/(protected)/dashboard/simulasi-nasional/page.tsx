/**
 * SimulasiNasionalPage — simulasi dampak perubahan variabel terhadap semua 34 provinsi.
 * User mengatur delta (perubahan) per variabel, lalu menjalankan simulasi sekaligus.
 */
"use client";

import { useState, useMemo, useCallback } from "react";
import { PredictionEngine } from "@/lib/prediction";
import { useProvinces } from "@/hooks/use-provinces";
import { usePredictorMeta } from "@/hooks/use-predictor-meta";
import {
  useAllCoefficients,
  useAllPredictorData,
} from "@/hooks/use-all-coefficients";
import { PredictionGauge } from "@/components/simulation";
import { DATA_YEARS, STUNTING_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { saveSimulation } from "@/app/(protected)/dashboard/simulasi/actions";
import type { PredictionResult, StuntingCategory } from "@/types/database";

const engine = new PredictionEngine();

interface ProvinceResult {
  id: number;
  name: string;
  before: PredictionResult;
  after: PredictionResult;
  changed: boolean;
}

export default function SimulasiNasionalPage() {
  const [selectedYear, setSelectedYear] = useState<number>(
    DATA_YEARS[DATA_YEARS.length - 1]
  );
  const [deltas, setDeltas] = useState<Record<string, number>>({});
  const [results, setResults] = useState<ProvinceResult[] | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { provinces } = useProvinces();
  const { predictorMeta, stdParams } = usePredictorMeta();
  const { coefficientsMap, isLoading: loadingCoeff } = useAllCoefficients(selectedYear);
  const { dataMap, isLoading: loadingData } = useAllPredictorData(selectedYear);

  const isDataReady =
    !loadingCoeff &&
    !loadingData &&
    !!coefficientsMap &&
    !!dataMap &&
    predictorMeta.length > 0;

  const activeDeltaCount = useMemo(
    () => Object.values(deltas).filter((d) => d !== 0).length,
    [deltas]
  );

  const setDelta = useCallback((code: string, value: number) => {
    setDeltas((prev) => ({ ...prev, [code]: value }));
  }, []);

  function runSimulation() {
    if (!coefficientsMap || !dataMap) return;
    setIsRunning(true);

    const provinceResults: ProvinceResult[] = [];

    for (const province of provinces) {
      const coeff = coefficientsMap.get(province.id);
      const originalValues = dataMap.get(province.id);
      if (!coeff || !originalValues) continue;

      // Before prediction (original values)
      const before = engine.predict(coeff, originalValues, stdParams);

      // After prediction (with deltas applied)
      const adjustedValues: Record<string, number> = {};
      for (const [key, val] of Object.entries(originalValues)) {
        adjustedValues[key] = val + (deltas[key] || 0);
      }
      const after = engine.predict(coeff, adjustedValues, stdParams);

      provinceResults.push({
        id: province.id,
        name: province.name,
        before,
        after,
        changed: before.predictedCategory !== after.predictedCategory,
      });
    }

    setResults(provinceResults);
    setIsRunning(false);
  }

  const changedCount = results?.filter((r) => r.changed).length ?? 0;

  async function handleSaveAll() {
    if (!results) return;
    setIsSaving(true);

    // Save as a single national simulation with aggregated results
    const aggregated: Record<string, number> = {};
    for (const [key, val] of Object.entries(deltas)) {
      if (val !== 0) aggregated[key] = val;
    }

    await saveSimulation({
      type: "national",
      provinceId: null,
      inputParams: aggregated,
      outputResults: {
        pRendah: 0,
        pSedang: 0,
        pTinggi: 0,
        predictedCategory: "Rendah",
      },
    });

    setIsSaving(false);
  }

  function getCategoryBadge(category: StuntingCategory) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
        style={{ backgroundColor: STUNTING_COLORS[category] }}
      >
        {category}
      </span>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Simulasi Nasional</h1>

      {/* Year selector */}
      <div className="mb-6 w-40">
        <label htmlFor="year" className="block text-sm font-medium mb-1">
          Tahun Basis
        </label>
        <select
          id="year"
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(Number(e.target.value));
            setResults(null);
          }}
          className="w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
        >
          {DATA_YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Delta inputs */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-foreground/60 uppercase tracking-wider mb-3">
          Perubahan Variabel (Delta)
        </h2>
        <p className="text-sm text-foreground/50 mb-4">
          Atur seberapa besar perubahan untuk setiap variabel. Nilai diterapkan secara seragam ke semua provinsi.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {predictorMeta.map((meta) => {
            const delta = deltas[meta.code] || 0;
            const range = (meta.maxValue ?? 100) - (meta.minValue ?? 0);
            const maxDelta = range * 0.3;

            return (
              <div
                key={meta.code}
                className={cn(
                  "rounded-lg border p-3",
                  delta !== 0
                    ? "border-primary-300 bg-primary-50/30"
                    : "border-primary-100 bg-white"
                )}
              >
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="font-medium truncate mr-2">{meta.nameId}</span>
                  <span className={cn(
                    "font-mono text-sm shrink-0",
                    delta > 0 ? "text-primary-700" : delta < 0 ? "text-accent-500" : "text-foreground/40"
                  )}>
                    {delta > 0 ? "+" : ""}{delta.toFixed(1)}
                    {meta.unit ? ` ${meta.unit}` : ""}
                  </span>
                </div>
                <input
                  type="range"
                  min={-maxDelta}
                  max={maxDelta}
                  step={maxDelta / 50}
                  value={delta}
                  onChange={(e) => setDelta(meta.code, parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-primary-100 accent-primary-600"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Run button */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={runSimulation}
          disabled={!isDataReady || activeDeltaCount === 0 || isRunning}
          type="button"
          className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning
            ? "Menghitung..."
            : !isDataReady
              ? "Memuat data..."
              : "Jalankan Simulasi"}
        </button>
        {results && (
          <>
            <button
              onClick={() => {
                setDeltas({});
                setResults(null);
              }}
              type="button"
              className="rounded-lg border border-primary-200 px-6 py-2.5 text-sm font-medium hover:bg-primary-50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              type="button"
              className="rounded-lg border border-primary-600 text-primary-600 px-6 py-2.5 text-sm font-medium hover:bg-primary-50 disabled:opacity-50 transition-colors"
            >
              {isSaving ? "Menyimpan..." : "Simpan Hasil"}
            </button>
          </>
        )}
      </div>

      {/* Results */}
      {results && (
        <div>
          {/* Summary */}
          <div className="rounded-xl border border-primary-200 bg-white p-5 mb-6">
            <h2 className="text-lg font-semibold mb-2">Ringkasan Hasil</h2>
            <p className="text-foreground/70">
              <span className="font-bold text-primary-600">{changedCount}</span>{" "}
              dari {results.length} provinsi berubah kategori stunting.
            </p>
          </div>

          {/* Results table */}
          <div className="overflow-x-auto rounded-xl border border-primary-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary-50 text-left">
                  <th className="px-4 py-3 font-medium">Provinsi</th>
                  <th className="px-4 py-3 font-medium">Sebelum</th>
                  <th className="px-4 py-3 font-medium">Sesudah</th>
                  <th className="px-4 py-3 font-medium">Perubahan</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr
                    key={r.id}
                    className={cn(
                      "border-t border-primary-100",
                      r.changed && "bg-primary-50/50"
                    )}
                  >
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3">
                      {getCategoryBadge(r.before.predictedCategory)}
                    </td>
                    <td className="px-4 py-3">
                      {getCategoryBadge(r.after.predictedCategory)}
                    </td>
                    <td className="px-4 py-3">
                      {r.changed ? (
                        <span className="text-primary-600 font-medium">Berubah</span>
                      ) : (
                        <span className="text-foreground/40">Tetap</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
