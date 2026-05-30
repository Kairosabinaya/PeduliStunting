import type { ModelVersion } from "@/domain/shared/ids";
import type { KodeBps } from "@/domain/region/value-objects/kode-bps";
import type { Year } from "@/domain/region/value-objects/year";

/**
 * Per region-year intercepts and fit diagnostics for the GTWENOLR local
 * predictor. The ordinal cumulative link uses `alfa1` and `alfa2`; the matching
 * 20 slopes live in `model_coefficients` (one row per predictor). `nActive` is
 * how many predictors the elastic-net selected locally; `converged` reports
 * whether the local fit converged.
 */
export class LocalFit {
  readonly modelVersion: ModelVersion;
  readonly kodeBps: KodeBps;
  readonly tahun: Year;
  readonly alfa1: number;
  readonly alfa2: number;
  readonly nActive: number | null;
  readonly converged: boolean;

  constructor(props: {
    modelVersion: ModelVersion;
    kodeBps: KodeBps;
    tahun: Year;
    alfa1: number;
    alfa2: number;
    nActive: number | null;
    converged: boolean;
  }) {
    this.modelVersion = props.modelVersion;
    this.kodeBps = props.kodeBps;
    this.tahun = props.tahun;
    this.alfa1 = props.alfa1;
    this.alfa2 = props.alfa2;
    this.nActive = props.nActive;
    this.converged = props.converged;
  }
}
