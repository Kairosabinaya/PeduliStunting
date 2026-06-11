/**
 * Probability that each ordinal stunting class is predicted for one region in
 * one year. The DB stores them nullable independently, so the VO carries each
 * value as `number | null` and exposes a helper to assert the canonical
 * three-class invariant when all values are present.
 */
export class ClassProbabilities {
  readonly rendah: number | null;
  readonly sedang: number | null;
  readonly tinggi: number | null;

  constructor(props: {
    rendah: number | null;
    sedang: number | null;
    tinggi: number | null;
  }) {
    this.rendah = props.rendah;
    this.sedang = props.sedang;
    this.tinggi = props.tinggi;
  }

  isComplete(): boolean {
    return this.rendah !== null && this.sedang !== null && this.tinggi !== null;
  }

  sum(): number {
    return (this.rendah ?? 0) + (this.sedang ?? 0) + (this.tinggi ?? 0);
  }
}
