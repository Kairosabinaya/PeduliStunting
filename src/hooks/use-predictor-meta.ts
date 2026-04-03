/** Hook to fetch predictor metadata and build standardization params. */
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PredictorMeta, StandardizationParams } from "@/types/database";

interface UsePredictorMetaResult {
  predictorMeta: PredictorMeta[];
  stdParams: Record<string, StandardizationParams>;
  isLoading: boolean;
  error: string | null;
}

export function usePredictorMeta(): UsePredictorMetaResult {
  const [predictorMeta, setPredictorMeta] = useState<PredictorMeta[]>([]);
  const [stdParams, setStdParams] = useState<
    Record<string, StandardizationParams>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchMeta() {
      const { data, error: err } = await supabase
        .from("predictor_meta")
        .select("*")
        .order("display_order");

      if (err) {
        setError(err.message);
        setIsLoading(false);
        return;
      }

      const mapped: PredictorMeta[] = (data ?? []).map((row) => ({
        id: row.id,
        code: row.code,
        nameId: row.name_id,
        nameEn: row.name_en,
        description: row.description,
        unit: row.unit,
        minValue: row.min_value,
        maxValue: row.max_value,
        meanValue: row.mean_value,
        stdValue: row.std_value,
        source: row.source,
        category: row.category,
        displayOrder: row.display_order,
      }));

      const params: Record<string, StandardizationParams> = {};
      for (const meta of mapped) {
        params[meta.code] = { mean: meta.meanValue, std: meta.stdValue };
      }

      setPredictorMeta(mapped);
      setStdParams(params);
      setIsLoading(false);
    }

    fetchMeta();
  }, []);

  return { predictorMeta, stdParams, isLoading, error };
}
