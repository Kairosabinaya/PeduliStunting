/** Hook to fetch predictor data for a specific province and year. */
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { predictorRowToRecord } from "@/lib/utils";

export function usePredictorData(
  provinceId: number | null,
  year: number | null
) {
  const [predictorValues, setPredictorValues] = useState<Record<
    string,
    number
  > | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!provinceId || !year) {
      setPredictorValues(null);
      return;
    }

    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    async function fetchData() {
      const { data, error: err } = await supabase
        .from("predictor_data")
        .select("*")
        .eq("province_id", provinceId!)
        .eq("year", year!)
        .single();

      if (err) {
        setError(err.message);
        setPredictorValues(null);
      } else {
        setPredictorValues(
          predictorRowToRecord(data as unknown as Record<string, unknown>)
        );
      }
      setIsLoading(false);
    }

    fetchData();
  }, [provinceId, year]);

  return { predictorValues, isLoading, error };
}
