import { HERO_COPY } from "@/config/edukasi";

import { HighlightWord } from "../primitives/highlight-word";

/**
 * Lead paragraph rendered under the hero headline. Renders the structured
 * `HERO_COPY.lead` so highlight chips are placed deterministically and the
 * copy file stays the single source of truth.
 */
export function HeroLead() {
  return (
    <p className="lead-paragraph mt-6 text-balance">
      {HERO_COPY.lead.map((node, index) => {
        if (node.kind === "text") {
          return <span key={index}>{node.value}</span>;
        }
        return (
          <HighlightWord key={index} variant={node.variant}>
            {node.value}
          </HighlightWord>
        );
      })}
    </p>
  );
}
