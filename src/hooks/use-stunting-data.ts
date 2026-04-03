/** Hook to fetch stunting data for a given year, returned as a Map for O(1) lookup. */
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { StuntingCategory } from "@/types/database";

interface StuntingEntry {
  prevalenceRate: number;
  category: StuntingCategory;
}

export function useStuntingData(year: number) {
  const [stuntingMap, setStuntingMap] = useState<Map<number, StuntingEntry>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      setIsLoading(true);
      const { data, error: err } = await supabase
        .from("stunting_data")
        .select("province_id, prevalence_rate, category")
        .eq("year", year);

      if (err) {
        setError(err.message);
      } else {
        const map = new Map<number, StuntingEntry>();
        for (const row of data ?? []) {
          map.set(row.province_id, {
            prevalenceRate: row.prevalence_rate,
            category: row.category as StuntingCategory,
          });
        }
        setStuntingMap(map);
      }
      setIsLoading(false);
    }

    fetchData();
  }, [year]);

  return { stuntingMap, isLoading, error };
}
