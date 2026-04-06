/** Admin Dataset — upload data stunting baru, trigger import ke StuntingData + PredictorData (SD-7). */
"use client";

import { useState } from "react";
import { importDataset } from "../actions";
import { cn } from "@/lib/utils";

export default function AdminDatasetPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [jsonData, setJsonData] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    setIsImporting(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("year", String(year));
    formData.append("data", jsonData);

    const result = await importDataset(formData);

    if (result.success) {
      setMessage({ type: "success", text: "Data berhasil diimport! Stunting data dan predictor data telah diperbarui." });
      setJsonData("");
    } else {
      setMessage({ type: "error", text: result.error ?? "Import gagal." });
    }

    setIsImporting(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Manajemen Dataset</h1>
      <p className="text-foreground/60 mb-6 text-sm">
        Import data stunting dan predictor baru. Data dalam format JSON array sesuai struktur database.
      </p>

      {message && (
        <div className={cn(
          "rounded-lg p-4 mb-6 text-sm",
          message.type === "success" ? "bg-primary-50 text-primary-700" : "bg-accent-50 text-accent-600"
        )}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleImport} className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Tahun Data</label>
          <input
            type="number" value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            min={2019} max={2030}
            className="w-32 rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Data (JSON Array)
          </label>
          <textarea
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            rows={15}
            placeholder={`[
  {
    "province_id": 11,
    "prevalence_rate": 25.1,
    "category": "Tinggi",
    "x1_ikt": 65.3,
    "x2_sanitasi": 72.1,
    ...
  }
]`}
            className="w-full rounded-lg border border-primary-200 px-3 py-2 text-sm font-mono focus:border-primary-500 focus:outline-none"
          />
          <p className="text-xs text-foreground/40 mt-1">
            Setiap row harus memiliki province_id. Field prevalence_rate dan category untuk stunting_data,
            field x1_ikt sampai x20_pengeluaran untuk predictor_data. Upsert berdasarkan province_id + year.
          </p>
        </div>

        <button
          type="submit"
          disabled={isImporting || !jsonData.trim()}
          className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isImporting ? "Mengimport..." : "Import Data"}
        </button>
      </form>
    </div>
  );
}
