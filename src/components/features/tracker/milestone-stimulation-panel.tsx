import { Lightbulb } from "lucide-react";

import { MILESTONE_CARD_COPY } from "@/config/tracker";
import { findStimulationGuide } from "@/config/stimulation";

export interface MilestoneStimulationPanelProps {
  readonly minAgeMonths: number;
  readonly maxAgeMonths: number;
}

/**
 * Panel saran stimulasi yang muncul saat milestone ditandai `delayed`.
 * Mencari guide yang relevan dengan rentang usia milestone; jika tidak ada,
 * menampilkan pesan fallback bukan saran karangan.
 */
export function MilestoneStimulationPanel({
  minAgeMonths,
  maxAgeMonths,
}: MilestoneStimulationPanelProps) {
  const guide = findStimulationGuide(minAgeMonths, maxAgeMonths);

  if (!guide) {
    return (
      <p className="rounded-md border border-border bg-surface-muted/50 p-3 text-xs text-muted-foreground">
        {MILESTONE_CARD_COPY.emptyStimulation}
      </p>
    );
  }

  return (
    <section className="space-y-2 rounded-md border border-warning/40 bg-warning/10 p-3">
      <header className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground">
        <Lightbulb size={14} aria-hidden />
        <span>{MILESTONE_CARD_COPY.stimulationHeading}</span>
      </header>
      <p className="text-xs font-medium text-foreground">{guide.heading}</p>
      <ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
        {guide.tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
      <p className="text-xs uppercase tracking-wider text-muted-foreground">
        {guide.sourceLabel}
      </p>
    </section>
  );
}
