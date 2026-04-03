/** Hook to fetch ALL model coefficients for a given year (national simulation). */
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Coefficients } from "@/types/database";
import { predictorRowToRecord } from "@/lib/utils";

export function useAllCoefficients(year: number | null) {
  const [coefficientsMap, setCoefficientsMap] = useState<Map<
    number,
    Coefficients
  > | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!year) {
      setCoefficientsMap(null);
      return;
    }

    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    async function fetchAll() {
      const { data, error: err } = await supabase
        .from("model_coefficients")
        .select("province_id, alpha_1, alpha_2, beta_coefficients, significant_vars")
        .eq("year", year!);

      if (err) {
        setError(err.message);
        setCoefficientsMap(null);
      } else {
        const map = new Map<number, Coefficients>();
        for (const row of data ?? []) {
          map.set(row.province_id, {
            alpha1: row.alpha_1,
            alpha2: row.alpha_2,
            betaCoefficients: row.beta_coefficients as Record<string, number>,
            significantVars: row.significant_vars as string[],
          });
        }
        setCoefficientsMap(map);
      }
      setIsLoading(false);
    }

    fetchAll();
  }, [year]);

  return { coefficientsMap, isLoading, error };
}

/** Hook to fetch ALL predictor data for a given year (national simulation). */
export function useAllPredictorData(year: number | null) {
  const [dataMap, setDataMap] = useState<Map<
    number,
    Record<string, number>
  > | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!year) {
      setDataMap(null);
      return;
    }

    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    async function fetchAll() {
      const { data, error: err } = await supabase
        .from("predictor_data")
        .select("*")
        .eq("year", year!);

      if (err) {
        setError(err.message);
        setDataMap(null);
      } else {
        const map = new Map<number, Record<string, number>>();
        for (const row of data ?? []) {
          map.set(
            row.province_id,
            predictorRowToRecord(row as unknown as Record<string, unknown>)
          );
        }
        setDataMap(map);
      }
      setIsLoading(false);
    }

    fetchAll();
  }, [year]);

  return { dataMap, isLoading, error };
}
