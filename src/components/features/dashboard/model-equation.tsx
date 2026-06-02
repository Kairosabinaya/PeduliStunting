import "katex/dist/katex.min.css";

import katex from "katex";
import { ChevronDown } from "lucide-react";

import { InfoHint } from "@/components/primitives/info-hint";
import { DASHBOARD_MODEL, SIMULATOR_EQUATION } from "@/config/dashboard";

/**
 * One typeset GTWENOLR equation (general form), rendered with KaTeX on the
 * server via `renderToString` — zero client JavaScript, only the KaTeX
 * stylesheet. The markup comes from a trusted config string (no user input),
 * so `dangerouslySetInnerHTML` is safe.
 *
 * KaTeX display mode ships a `.katex-display { margin: 1em 0 }` that would
 * stack on top of the row padding; it is zeroed out (scoped to this block) so
 * each row's height tracks the equation alone.
 */
function KatexEquation({ tex }: { tex: string }) {
  const html = katex.renderToString(tex, {
    displayMode: true,
    throwOnError: false,
  });
  return (
    <div
      className="text-foreground [&_.katex-display]:my-0"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Inline KaTeX for a single legend symbol. The `sym` strings in config are
 * LaTeX source (e.g. `\beta_k(s_i, t_i)`), so they must be typeset rather than
 * printed verbatim. Rendered server-side like {@link KatexEquation}.
 */
function KatexSymbol({ tex }: { tex: string }) {
  const html = katex.renderToString(tex, {
    displayMode: false,
    throwOnError: false,
  });
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export function ModelEquation() {
  return (
    <div className="space-y-4">
      {/* Prediksi: bentuk yang sama untuk semua model terboboti. Ketiga
          persamaan berbagi satu kartu, dipisah garis tipis, agar blok ini
          tetap ringkas. */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-medium text-foreground">
            Prediksi (logit kumulatif lokal)
          </p>
          <InfoHint label={SIMULATOR_EQUATION.generalInfoLabel}>
            {SIMULATOR_EQUATION.classProbNote}
          </InfoHint>
        </div>
        {/* `overflow-x-auto` would coerce `overflow-y` to `auto`, so a wide
            equation's horizontal scrollbar steals height and spawns a spurious
            vertical scrollbar. Pinning `overflow-y-hidden` keeps the box at the
            equation's natural height; the `py-3` padding absorbs the horizontal
            scrollbar on narrow screens. */}
        <div className="divide-y divide-border rounded-lg border border-border bg-surface-muted/40">
          <div className="overflow-x-auto overflow-y-hidden px-4 py-3">
            <KatexEquation tex={SIMULATOR_EQUATION.katexGeneral} />
          </div>
          <div className="overflow-x-auto overflow-y-hidden px-4 py-3">
            <KatexEquation tex={SIMULATOR_EQUATION.katexEstimation} />
          </div>
          <div className="overflow-x-auto overflow-y-hidden px-4 py-3">
            <KatexEquation tex={SIMULATOR_EQUATION.katexWeights} />
          </div>
        </div>

        {/* Symbol legend lives in a disclosure (not the hover hint) so the full
            list stays tidy and never overflows the viewport. Each `sym` is
            typeset KaTeX; descriptions wrap into two columns from `sm` up. */}
        <details className="group rounded-lg border border-border bg-surface-muted/30">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
            {SIMULATOR_EQUATION.symbolsToggle}
            <ChevronDown
              size={14}
              aria-hidden
              className="text-muted-foreground transition-transform group-open:rotate-180"
            />
          </summary>
          <dl className="grid gap-x-6 gap-y-3 px-3 pb-3 text-xs text-muted-foreground sm:grid-cols-2">
            {DASHBOARD_MODEL.symbols.map((symbol) => (
              <div key={symbol.sym} className="flex items-start gap-2">
                <dt className="shrink-0 rounded-md bg-primary/10 px-1.5 py-1 text-primary">
                  <KatexSymbol tex={symbol.sym} />
                </dt>
                <dd className="pt-0.5 leading-relaxed">{symbol.desc}</dd>
              </div>
            ))}
          </dl>
        </details>
      </div>

      <p className="sr-only">
        Peluang kumulatif tiap kelas adalah fungsi expit (logistik) dari ambang
        lokal alfa ditambah jumlah indikator yang sudah distandardisasi dikali
        bobot lokal beta. Kelas dengan peluang terbesar menjadi prediksi.
      </p>
    </div>
  );
}
