/**
 * UploadPage — Boundary class untuk upload dataset custom.
 * uploadFile() → validate → store → create UploadJob sesuai SD-6.
 */
"use client";

import { useState, useRef } from "react";
import { uploadDataset } from "./actions";
import type { ModelType } from "@/types/database";
import { cn } from "@/lib/utils";
import { MAX_UPLOAD_FILE_SIZE_MB } from "@/lib/constants";

export default function UploadPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [modelType, setModelType] = useState<ModelType>("GTWENOLR");
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("modelType", modelType);

    const result = await uploadDataset(formData);

    if (result.success) {
      setMessage({
        type: "success",
        text: `Dataset berhasil diupload! Job ID: ${result.jobId}. Proses sedang berjalan.`,
      });
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = "";
    } else {
      setMessage({ type: "error", text: result.error ?? "Upload gagal." });
    }

    setIsUploading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-2">Upload Dataset</h1>
      <p className="text-foreground/60 mb-6">
        Upload dataset custom Anda untuk diproses dengan model GTWENOLR.
        Fitur ini tersedia untuk pengguna Premium.
      </p>

      {message && (
        <div className={cn(
          "rounded-lg p-4 mb-6 text-sm",
          message.type === "success" ? "bg-primary-50 text-primary-700" : "bg-accent-50 text-accent-600"
        )}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
        {/* File input */}
        <div>
          <label className="block text-sm font-medium mb-2">
            File Dataset (CSV atau Excel)
          </label>
          <div className="rounded-xl border-2 border-dashed border-primary-200 p-8 text-center hover:border-primary-400 transition-colors">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer">
              {selectedFile ? (
                <div>
                  <p className="font-medium text-primary-600">{selectedFile.name}</p>
                  <p className="text-sm text-foreground/50 mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <svg className="w-10 h-10 mx-auto text-primary-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-foreground/60">Klik untuk memilih file</p>
                  <p className="text-xs text-foreground/40 mt-1">
                    CSV atau Excel, maks {MAX_UPLOAD_FILE_SIZE_MB} MB
                  </p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Model type selector */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Tipe Model
          </label>
          <select
            value={modelType}
            onChange={(e) => setModelType(e.target.value as ModelType)}
            className="w-full rounded-lg border border-primary-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          >
            <option value="GTWENOLR">GTWENOLR (Spasial + Temporal)</option>
            <option value="GWENOLR">GWENOLR (Spasial, tanpa Temporal)</option>
            <option value="ENOLR">ENOLR (Global, tanpa Spasial/Temporal)</option>
          </select>
          <p className="text-xs text-foreground/40 mt-1">
            Model akan disesuaikan otomatis berdasarkan struktur dataset.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!selectedFile || isUploading}
          className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isUploading ? "Mengupload..." : "Upload & Proses"}
        </button>
      </form>
    </div>
  );
}
