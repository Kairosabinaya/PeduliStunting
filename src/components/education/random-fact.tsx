/** RandomFact — reusable "Tahukah kamu?" card that fetches a random stunting fact. */
"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface RandomFactProps {
  provinceId?: number;
  className?: string;
}

interface FactData {
  id: string;
  content: string;
  source: string | null;
}

export function RandomFact({ provinceId, className }: RandomFactProps) {
  const [facts, setFacts] = useState<FactData[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchFacts() {
      let query = supabase
        .from("facts")
        .select("id, content, source")
        .eq("is_active", true);

      if (provinceId) {
        query = query.or(`province_id.eq.${provinceId},province_id.is.null`);
      }

      const { data } = await query;
      if (data && data.length > 0) {
        setFacts(data);
        setCurrentIdx(Math.floor(Math.random() * data.length));
      }
      setIsLoading(false);
    }

    fetchFacts();
  }, [provinceId]);

  const nextFact = useCallback(() => {
    if (facts.length <= 1) return;
    setCurrentIdx((prev) => (prev + 1) % facts.length);
  }, [facts.length]);

  if (isLoading) {
    return (
      <div className={`rounded-xl bg-primary-50 border border-primary-200 p-6 animate-pulse ${className ?? ""}`}>
        <div className="h-4 w-24 bg-primary-200 rounded mb-3" />
        <div className="h-4 w-full bg-primary-200 rounded mb-2" />
        <div className="h-4 w-3/4 bg-primary-200 rounded" />
      </div>
    );
  }

  if (facts.length === 0) return null;

  const fact = facts[currentIdx];

  return (
    <div className={`rounded-xl bg-primary-50 border border-primary-200 p-6 ${className ?? ""}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 mb-2">
        Tahukah kamu?
      </p>
      <p className="text-foreground leading-relaxed">{fact.content}</p>
      {fact.source && (
        <p className="text-xs text-foreground/40 mt-3">Sumber: {fact.source}</p>
      )}
      {facts.length > 1 && (
        <button
          onClick={nextFact}
          type="button"
          className="mt-3 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          Fakta lain &rarr;
        </button>
      )}
    </div>
  );
}
