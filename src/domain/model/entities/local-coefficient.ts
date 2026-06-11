import type { IndicatorCode, ModelVersion } from "@/domain/shared/ids";
import type { KodeBps } from "@/domain/region/value-objects/kode-bps";
import type { Year } from "@/domain/region/value-objects/year";

export class LocalCoefficient {
  readonly modelVersion: ModelVersion;
  readonly kodeBps: KodeBps;
  readonly tahun: Year;
  readonly predictorCode: IndicatorCode;
  readonly coefficient: number;
  readonly se: number | null;
  readonly isInference: boolean;

  constructor(props: {
    modelVersion: ModelVersion;
    kodeBps: KodeBps;
    tahun: Year;
    predictorCode: IndicatorCode;
    coefficient: number;
    se: number | null;
    isInference: boolean;
  }) {
    this.modelVersion = props.modelVersion;
    this.kodeBps = props.kodeBps;
    this.tahun = props.tahun;
    this.predictorCode = props.predictorCode;
    this.coefficient = props.coefficient;
    this.se = props.se;
    this.isInference = props.isInference;
  }
}
