/**
 * Primary navigation shown in the shared header. Order in this array is the
 * order shown to users on every breakpoint. `/map`, `/data`, and `/prediksi`
 * are public (reachable signed-out); `/tracker` requires a session. Adding or
 * reordering items here is a UX decision — update the corresponding ADR.
 */
export interface PrimaryNavItem {
  readonly href: string;
  readonly label: string;
  readonly description: string;
}

/**
 * Grace period before a hover-opened account dropdown closes after the pointer
 * leaves, so the user can travel from the avatar to the menu without it
 * snapping shut. Shared by the `/map` header and the global header.
 */
export const HEADER_HOVER_CLOSE_DELAY_MS = 240;

export const PRIMARY_NAV: readonly PrimaryNavItem[] = [
  {
    href: "/map",
    label: "Peta",
    description: "Sebaran prevalensi stunting per kabupaten/kota",
  },
  {
    href: "/data",
    label: "Data",
    description: "Potret stunting nasional & tren",
  },
  {
    href: "/prediksi",
    label: "Prediksi",
    description: "Coba simulator & lihat cara kerja model",
  },
  {
    href: "/tracker",
    label: "Tracker",
    description: "Pantau pertumbuhan dan rencana sehat anak",
  },
] as const;
