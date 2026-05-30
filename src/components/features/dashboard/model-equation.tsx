import { DASHBOARD_MODEL } from "@/config/dashboard";

/**
 * The formal GTWENOLR cumulative-link equation for examiners, rendered with
 * semantic HTML + the mono scale (no math-typesetting dependency, zero client
 * JS) and paired with a friendly symbol legend. De-emphasised: the lay-friendly
 * four-step explanation above carries the main load.
 */
export function ModelEquation() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {DASHBOARD_MODEL.equationDescription}
      </p>
      <div className="space-y-2.5 overflow-x-auto rounded-lg border border-border bg-surface-muted/40 p-5 font-mono text-sm text-foreground">
        <p>
          P(Y &le; j | x) = &sigma;(&alpha;<sub>j</sub> + &eta;)
        </p>
        <p>
          &eta; = s &middot; &sum;<sub>k=1..20</sub> &beta;<sub>k</sub> &middot;
          z<sub>k</sub>
        </p>
        <p className="text-muted-foreground">
          z<sub>k</sub> = ( t<sub>k</sub>(x<sub>k</sub>) &minus; &mu;
          <sub>k</sub> ) / &sigma;<sub>k</sub>
        </p>
      </div>
      <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {DASHBOARD_MODEL.symbols.map((symbol) => (
          <div key={symbol.sym} className="flex gap-2">
            <dt className="shrink-0 font-mono font-semibold text-primary">
              {symbol.sym}
            </dt>
            <dd className="text-muted-foreground">{symbol.desc}</dd>
          </div>
        ))}
      </dl>
      <p className="sr-only">
        Peluang kumulatif tiap kelas adalah fungsi sigmoid dari garis batas alfa
        ditambah skor eta. Skor eta adalah jumlah indikator yang sudah
        disetarakan, dikali bobot lokal beta. Kelas dengan peluang terbesar
        menjadi prediksi.
      </p>
    </div>
  );
}
