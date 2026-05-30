/**
 * Primary navigation for the authenticated app shell. Order in this array
 * is the order shown to users on every breakpoint. Adding or reordering
 * items here is a UX decision — update the corresponding ADR.
 */
export interface PrimaryNavItem {
  readonly href: string;
  readonly label: string;
  readonly description: string;
}

export const PRIMARY_NAV: readonly PrimaryNavItem[] = [
  {
    href: "/map",
    label: "Peta",
    description: "Sebaran prevalensi stunting per provinsi",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Prediksi tren dan metadata model",
  },
  {
    href: "/tracker",
    label: "Tracker",
    description: "Pantau pertumbuhan dan rencana sehat anak",
  },
] as const;
