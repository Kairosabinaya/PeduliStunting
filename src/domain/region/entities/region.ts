import type { KodeBps } from "../value-objects/kode-bps";

export type RegionType = "Kabupaten" | "Kota";

export class Region {
  readonly kodeBps: KodeBps;
  readonly provinsi: string;
  readonly kabupatenKota: string;
  readonly tipe: RegionType;
  readonly latitude: number | null;
  readonly longitude: number | null;

  constructor(props: {
    kodeBps: KodeBps;
    provinsi: string;
    kabupatenKota: string;
    tipe: RegionType;
    latitude: number | null;
    longitude: number | null;
  }) {
    this.kodeBps = props.kodeBps;
    this.provinsi = props.provinsi;
    this.kabupatenKota = props.kabupatenKota;
    this.tipe = props.tipe;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
  }
}
