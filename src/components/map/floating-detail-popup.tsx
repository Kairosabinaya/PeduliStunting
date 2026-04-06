/** FloatingDetailPopup — province detail card overlaid on map, replaces sidebar panel. */
"use client";

import Link from "next/link";
import { STUNTING_COLORS } from "@/lib/constants";
import type { StuntingCategory } from "@/types/database";

interface StuntingEntry {
  prevalenceRate: number;
  category: StuntingCategory;
}

interface FloatingDetailPopupProps {
  provinceName: string | null;
  entry: StuntingEntry | null;
  selectedYear: number;
  provinceId: number;
  onClose: () => void;
}

export function FloatingDetailPopup({
  provinceName,
  entry,
  selectedYear,
  provinceId,
  onClose,
}: FloatingDetailPopupProps) {
  if (!provinceName || !entry) return null;

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] max-md:top-auto max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:translate-x-0">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-5 w-80 max-w-[90vw] mx-auto max-md:rounded-b-none max-md:w-full max-md:max-w-full">
        {/* Close button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-foreground/50 hover:text-foreground/70 transition-colors"
          aria-label="Tutup"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Province name */}
        <h2 className="text-lg font-bold text-foreground pr-8 uppercase">
          {provinceName}
        </h2>

        <p className="text-xs text-foreground/40 mt-1">
          Tahun Data: {selectedYear}
        </p>

        {/* Prevalence */}
        <div className="mt-4">
          <p className="text-4xl font-bold text-foreground">
            {entry.prevalenceRate.toFixed(2)}
            <span className="text-base font-normal text-foreground/40 ml-1">
              %
            </span>
          </p>
          <p className="text-xs text-foreground/50 mt-0.5">
            Prevalensi Stunting
          </p>
        </div>

        {/* Category badge */}
        <div className="mt-3">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: STUNTING_COLORS[entry.category] }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-white/60"
            />
            {entry.category}
          </span>
        </div>

        {/* Action */}
        <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
          <Link
            href={`/dashboard/simulasi?province=${provinceId}&year=${selectedYear}`}
            className="block w-full text-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            Simulasikan Provinsi Ini
          </Link>
        </div>
      </div>
    </div>
  );
}
