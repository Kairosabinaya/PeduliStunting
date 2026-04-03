/** Orchestrator hook for province simulation — manages state, prediction, and save. */
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { PredictionEngine } from "@/lib/prediction";
import { useCoefficients } from "./use-coefficients";
import { usePredictorMeta } from "./use-predictor-meta";
import { usePredictorData } from "./use-predictor-data";
import type { PredictionResult } from "@/types/database";
import { saveSimulation, getSimulationCount } from "@/app/(protected)/dashboard/simulasi/actions";

const engine = new PredictionEngine();

export function useSimulation(
  provinceId: number | null,
  year: number | null
) {
  const { coefficients, isLoading: loadingCoeff } = useCoefficients(provinceId, year);
  const { predictorMeta, stdParams, isLoading: loadingMeta } = usePredictorMeta();
  const { predictorValues: originalValues, isLoading: loadingData } = usePredictorData(provinceId, year);

  const [values, setValues] = useState<Record<string, number>>({});
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [todayCount, setTodayCount] = useState(0);

  const isReady = !loadingCoeff && !loadingMeta && !loadingData
    && !!coefficients && !!originalValues && predictorMeta.length > 0;

  // Initialize values from original data when it loads
  useEffect(() => {
    if (originalValues) {
      setValues({ ...originalValues });
    } else {
      setValues({});
      setPrediction(null);
    }
  }, [originalValues]);

  // Recompute prediction whenever values or coefficients change
  useEffect(() => {
    if (!coefficients || Object.keys(values).length === 0 || Object.keys(stdParams).length === 0) {
      setPrediction(null);
      return;
    }
    const result = engine.predict(coefficients, values, stdParams);
    setPrediction(result);
  }, [coefficients, values, stdParams]);

  // Load today's simulation count on mount
  useEffect(() => {
    getSimulationCount().then(setTodayCount).catch(() => {});
  }, []);

  const isDirty = useMemo(() => {
    if (!originalValues) return false;
    return Object.keys(values).some(
      (key) => values[key] !== originalValues[key]
    );
  }, [values, originalValues]);

  const setValue = useCallback((code: string, value: number) => {
    setValues((prev) => ({ ...prev, [code]: value }));
  }, []);

  const resetAll = useCallback(() => {
    if (originalValues) {
      setValues({ ...originalValues });
    }
  }, [originalValues]);

  const handleSave = useCallback(async () => {
    if (!prediction || !provinceId) return;

    setIsSaving(true);
    const result = await saveSimulation({
      type: "province",
      provinceId,
      inputParams: values,
      outputResults: prediction,
    });

    if (result.success) {
      setTodayCount((prev) => prev + 1);
    }
    setIsSaving(false);
    return result;
  }, [prediction, provinceId, values]);

  return {
    values,
    originalValues,
    prediction,
    isDirty,
    isReady,
    isLoading: loadingCoeff || loadingMeta || loadingData,
    isSaving,
    todayCount,
    predictorMeta,
    setValue,
    resetAll,
    saveSimulation: handleSave,
  };
}
