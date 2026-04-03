/** Hook to fetch model coefficients for a specific province and year. */
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Coefficients } from "@/types/database";

export function useCoefficients(
  provinceId: number | null,
  year: number | null
) {
  const [coefficients, setCoefficients] = useState<Coefficients | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!provinceId || !year) {
      setCoefficients(null);
      return;
    }

    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    async function fetchCoefficients() {
      const { data, error: err } = await supabase
        .from("model_coefficients")
        .select("alpha_1, alpha_2, beta_coefficients, significant_vars")
        .eq("province_id", provinceId!)
        .eq("year", year!)
        .single();

      if (err) {
        setError(err.message);
        setCoefficients(null);
      } else {
        setCoefficients({
          alpha1: data.alpha_1,
          alpha2: data.alpha_2,
          betaCoefficients: data.beta_coefficients as Record<string, number>,
          significantVars: data.significant_vars as string[],
        });
      }
      setIsLoading(false);
    }

    fetchCoefficients();
  }, [provinceId, year]);

  return { coefficients, isLoading, error };
}
