/** Hook to fetch all 34 provinces (without geojson column for performance). */
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface ProvinceOption {
  id: number;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
}

export function useProvinces() {
  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchProvinces() {
      const { data, error: err } = await supabase
        .from("provinces")
        .select("id, name, slug, latitude, longitude")
        .order("name");

      if (err) {
        setError(err.message);
      } else {
        setProvinces(data ?? []);
      }
      setIsLoading(false);
    }

    fetchProvinces();
  }, []);

  return { provinces, isLoading, error };
}
