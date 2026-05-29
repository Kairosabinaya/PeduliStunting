"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Calculator, X } from "lucide-react";

import { cn } from "@/lib/cn";
import { CEK_CEPAT_COPY, CEK_CEPAT_ENDPOINT } from "@/config/cek-cepat";
import {
  DEFAULT_CEK_CEPAT_STATE,
  readCekCepatState,
  writeCekCepatState,
  type CekCepatStoredState,
} from "@/lib/cek-cepat-storage";
import type { AppError } from "@/domain/errors/app-error";
import type { QuickScreeningResultDto } from "@/application/tracking/use-cases/compute-quick-screening";

import {
  CekCepatForm,
  type CekCepatFormSubmitPayload,
  type CekCepatFormValues,
} from "./cek-cepat-form";
import { CekCepatResult } from "./cek-cepat-result";

const FORM_DEFAULT: CekCepatFormValues = {
  sex: null,
  mode: "birth-date",
  birthDate: null,
  ageMonths: null,
  weightKg: null,
  heightCm: null,
};

interface ApiSuccess {
  readonly ok: true;
  readonly value: QuickScreeningResultDto;
}

interface ApiFailure {
  readonly ok: false;
  readonly error: AppError;
}

type ApiResponse = ApiSuccess | ApiFailure;

/**
 * Floating, dismissable kalkulator skrining mounted at `/tracker/**`. The
 * widget toggles between two states:
 *
 *   - **collapsed** — small FAB at bottom-right ("Cek Cepat" icon + label).
 *   - **expanded** — glass-panel card with the input form and result.
 *
 * State + inputs are persisted to `localStorage` so users who minimise the
 * widget while navigating around the tracker see the same values when they
 * pop it open again.
 *
 * Mounted via `src/app/(app)/tracker/layout.tsx` so it is only present on
 * tracker routes — `/map` and `/edukasi` continue to use their own surfaces.
 */
export function CekCepatBanner() {
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<CekCepatStoredState>(
    DEFAULT_CEK_CEPAT_STATE,
  );
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuickScreeningResultDto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // One-shot hydration sync from localStorage: pull the persisted state
    // on mount, then flip the gate. Cannot move to a useSyncExternalStore
    // because localStorage emits no change events for same-tab writes, and
    // a server-side default is required for SSR. The cascading render
    // warning is acceptable here — this fires once, no per-frame churn.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-shot hydration sync (see comment above)
    setState(readCekCepatState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeCekCepatState(state);
  }, [state, hydrated]);

  const initialFormValues = useMemo<CekCepatFormValues>(() => {
    return state.inputs ?? FORM_DEFAULT;
  }, [state.inputs]);

  const handleValuesChange = useCallback((next: CekCepatFormValues) => {
    setState((previous) => ({ ...previous, inputs: next }));
  }, []);

  const handleSubmit = useCallback(
    async (payload: CekCepatFormSubmitPayload) => {
      setSubmitting(true);
      setErrorMessage(null);
      try {
        const response = await fetch(CEK_CEPAT_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const body = (await response.json()) as ApiResponse;
        if (!body.ok) {
          setErrorMessage(body.error.message);
          setResult(null);
          return;
        }
        setResult(body.value);
      } catch {
        setErrorMessage(CEK_CEPAT_COPY.errors.serverNetwork);
        setResult(null);
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  const handleReset = useCallback(() => {
    setResult(null);
    setErrorMessage(null);
  }, []);

  const handleExpand = useCallback(() => {
    setState((previous) => ({ ...previous, collapsed: false }));
  }, []);

  const handleCollapse = useCallback(() => {
    setState((previous) => ({ ...previous, collapsed: true }));
  }, []);

  if (!hydrated) {
    return null;
  }

  return (
    <div
      className={cn(
        "safe-bottom safe-x fixed z-[60]",
        "bottom-3 right-3 sm:bottom-6 sm:right-6",
      )}
    >
      {state.collapsed ? (
        <button
          type="button"
          onClick={handleExpand}
          aria-label={CEK_CEPAT_COPY.fabAriaLabel}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg transition-shadow hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Calculator size={20} aria-hidden />
          <span className="text-sm font-medium">{CEK_CEPAT_COPY.fabLabel}</span>
        </button>
      ) : (
        <section
          role="dialog"
          aria-modal="false"
          aria-label={CEK_CEPAT_COPY.panelTitle}
          className={cn(
            "glass-panel-strong relative flex max-h-[80vh] w-[min(360px,calc(100vw-1.5rem))] flex-col gap-4 overflow-y-auto rounded-2xl border border-border p-5 shadow-2xl",
            "sm:w-[380px]",
          )}
        >
          <header className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {CEK_CEPAT_COPY.panelTagline}
              </p>
              <h2 className="text-lg font-bold text-foreground">
                {CEK_CEPAT_COPY.panelTitle}
              </h2>
              <p className="text-xs text-muted-foreground">
                {CEK_CEPAT_COPY.panelSubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCollapse}
              aria-label={CEK_CEPAT_COPY.collapseAriaLabel}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <X size={18} aria-hidden />
            </button>
          </header>

          {result ? (
            <CekCepatResult result={result} />
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {CEK_CEPAT_COPY.introBody}
              </p>
              <CekCepatForm
                defaultValues={initialFormValues}
                submitting={submitting}
                onValuesChange={handleValuesChange}
                onSubmit={handleSubmit}
                onReset={handleReset}
              />
              {errorMessage ? (
                <p
                  className="rounded-md border border-danger/40 bg-danger/10 p-2 text-xs text-danger"
                  role="alert"
                >
                  {errorMessage}
                </p>
              ) : null}
            </>
          )}
        </section>
      )}
    </div>
  );
}

export default CekCepatBanner;
