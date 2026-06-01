import "katex/dist/katex.min.css";

import katex from "katex";

import { DASHBOARD_MODEL, SIMULATOR_EQUATION } from "@/config/dashboard";

/**
 * The single GTWENOLR cumulative-logit equation (general form), typeset with
 * KaTeX on the server via `renderToString` — zero client JavaScript, only the
 * KaTeX stylesheet. The markup comes from a trusted config string (no user
 * input), so `dangerouslySetInnerHTML` is safe. The class probabilities are
 * noted as cumulative differences, and the symbol legend sits behind a compact
 * `<details>` so the merged prediction card stays short.
 */
export function ModelEquation() {
  const html = katex.renderToString(SIMULATOR_EQUATION.katexGeneral, {
    displayMode: true,
    throwOnError: false,
  });
  return (
    <div className="space-y-2">
      <div
        className="overflow-x-auto rounded-lg border border-border bg-surface-muted/40 p-4 text-foreground"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <p className="text-xs text-muted-foreground">
        {SIMULATOR_EQUATION.classProbNote}
      </p>
      <details className="group text-xs text-muted-foreground">
        <summary className="cursor-pointer list-none font-medium text-foreground marker:hidden">
          {SIMULATOR_EQUATION.symbolsToggle}
        </summary>
        <dl className="mt-2 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {DASHBOARD_MODEL.symbols.map((symbol) => (
            <div key={symbol.sym} className="flex items-start gap-2">
              <dt className="inline-flex shrink-0 items-center rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-xs font-semibold text-primary">
                {symbol.sym}
              </dt>
              <dd>{symbol.desc}</dd>
            </div>
          ))}
        </dl>
      </details>
      <p className="sr-only">
        Peluang kumulatif tiap kelas adalah fungsi expit (logistik) dari ambang
        lokal alfa ditambah jumlah indikator yang sudah distandardisasi dikali
        bobot lokal beta. Kelas dengan peluang terbesar menjadi prediksi.
      </p>
    </div>
  );
}
