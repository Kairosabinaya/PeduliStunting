"use client";

/**
 * 4-step onboarding modal for `/map`. Bespoke for the Peduli Stunting domain
 * — copy speaks to SSGI/SKI, kabupaten/kota, and the GTWENOLR model rather
 * than borrowing GeoPangan's IKP terminology verbatim.
 *
 * Stateless from the route's perspective: parent owns `open` + dismissal, so
 * the same modal can be auto-shown on first visit or re-opened via the
 * "Buka panduan" trigger.
 */

import { useState, type ReactNode } from "react";

import { Button } from "@/components/primitives/button";
import { Modal } from "@/components/primitives/modal";
import {
  MAP_ONBOARDING_STEPS,
  ONBOARDING_COPY,
  type OnboardingIcon,
} from "@/config/map";
import { cn } from "@/lib/cn";

export interface OnboardingModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

export function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const total = MAP_ONBOARDING_STEPS.length;
  const step = MAP_ONBOARDING_STEPS[stepIndex] ?? MAP_ONBOARDING_STEPS[0];
  if (!step) return null;
  const isLast = stepIndex === total - 1;

  function handleNext() {
    if (isLast) {
      setStepIndex(0);
      onClose();
      return;
    }
    setStepIndex((i) => Math.min(i + 1, total - 1));
  }
  function handlePrev() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }
  function handleClose() {
    setStepIndex(0);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      variant="centered"
      title={step.title}
      description={step.description}
      footer={
        <OnboardingFooter
          stepIndex={stepIndex}
          total={total}
          isLast={isLast}
          onNext={handleNext}
          onPrev={handlePrev}
        />
      }
    >
      <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-start">
        <OnboardingIllustration icon={step.icon} />
        <div className="space-y-3">
          <ul className="space-y-2 text-sm text-foreground">
            {step.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2">
                <span
                  aria-hidden
                  className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-primary"
                />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          <p className="sr-only">
            {ONBOARDING_COPY.stepIndicatorLabel(stepIndex + 1, total)}
          </p>
        </div>
      </div>
    </Modal>
  );
}

interface OnboardingFooterProps {
  readonly stepIndex: number;
  readonly total: number;
  readonly isLast: boolean;
  readonly onPrev: () => void;
  readonly onNext: () => void;
}

function OnboardingFooter({
  stepIndex,
  total,
  isLast,
  onPrev,
  onNext,
}: OnboardingFooterProps) {
  return (
    <div className="flex w-full items-center justify-between gap-3">
      <ol
        aria-hidden
        className="flex items-center gap-1.5"
      >
        {Array.from({ length: total }).map((_, idx) => (
          <li
            key={idx}
            className={cn(
              "h-1.5 rounded-full transition-all",
              idx === stepIndex
                ? "w-5 bg-primary"
                : "w-1.5 bg-muted",
            )}
          />
        ))}
      </ol>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onPrev}
          disabled={stepIndex === 0}
        >
          {ONBOARDING_COPY.prevLabel}
        </Button>
        <Button type="button" size="sm" onClick={onNext}>
          {isLast ? ONBOARDING_COPY.finishLabel : ONBOARDING_COPY.nextLabel}
        </Button>
      </div>
    </div>
  );
}

function OnboardingIllustration({ icon }: { readonly icon: OnboardingIcon }) {
  return (
    <div
      aria-hidden
      className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10 text-primary"
    >
      {ICON_MAP[icon]}
    </div>
  );
}

const ICON_MAP: Record<OnboardingIcon, ReactNode> = {
  map: (
    <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none">
      <path
        d="M8 12l10-4 12 4 10-4v28l-10 4-12-4-10 4V12z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M18 8v28M30 12v28" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  calendar: (
    <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none">
      <rect
        x="8"
        y="10"
        width="32"
        height="30"
        rx="3"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 18h32M16 6v8M32 6v8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="24" cy="28" r="3" fill="currentColor" />
    </svg>
  ),
  click: (
    <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none">
      <path
        d="M18 8l4 22 6-6 6 12 4-2-6-12 8-2-22-12z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  ),
  legend: (
    <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none">
      <circle cx="14" cy="14" r="5" className="fill-ordinal-rendah" />
      <circle cx="24" cy="24" r="5" className="fill-ordinal-sedang" />
      <circle cx="34" cy="34" r="5" className="fill-ordinal-tinggi" />
    </svg>
  ),
  model: (
    <svg viewBox="0 0 48 48" className="h-12 w-12" fill="none">
      <path
        d="M8 36l8-12 8 6 8-18 8 24"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  ),
};
