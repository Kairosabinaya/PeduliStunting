/**
 * Global keyboard shortcuts for expert users (Shneiderman rule 2 — universal
 * usability: shortcuts that let frequent users move faster than menus allow).
 *
 * Two families:
 * - Leader navigation: press {@link SHORTCUT_LEADER_KEY} ("g") then a mnemonic
 *   key to jump between the main sections (Gmail-style "go to").
 * - Standalone actions: a single key toggles the theme or opens the help
 *   dialog.
 *
 * Destinations come from {@link PRIMARY_NAV} so the shortcut targets cannot
 * drift from the visible navigation (single source of truth, project guidelines §2/§4).
 */

import { PRIMARY_NAV } from "./navigation";

/** Leader key that begins a "go to" navigation sequence. */
export const SHORTCUT_LEADER_KEY = "g";

/** Window after the leader key in which the second key is accepted. */
export const SHORTCUT_SEQUENCE_TIMEOUT_MS = 1200;

export interface GoToShortcut {
  /** Second key pressed after the leader. */
  readonly key: string;
  readonly href: string;
  readonly label: string;
}

/**
 * Mnemonic second-keys aligned to {@link PRIMARY_NAV} order
 * (Peta, Data, Prediksi, Tracker). Keeping the order parallel avoids repeating
 * route strings here — the href always comes from the nav item.
 */
const GO_TO_MNEMONICS = ["m", "d", "p", "t"] as const;

export const GO_TO_SHORTCUTS: readonly GoToShortcut[] = PRIMARY_NAV.flatMap(
  (item, index) => {
    const key = GO_TO_MNEMONICS[index];
    return key ? [{ key, href: item.href, label: item.label }] : [];
  },
);

export type StandaloneAction = "toggle-theme" | "open-help";

export interface StandaloneShortcut {
  readonly key: string;
  readonly action: StandaloneAction;
  readonly label: string;
}

export const STANDALONE_SHORTCUTS: readonly StandaloneShortcut[] = [
  { key: "t", action: "toggle-theme", label: "Ganti tema terang/gelap" },
  { key: "?", action: "open-help", label: "Tampilkan daftar pintasan ini" },
];

/** Copy for the shortcuts help dialog (opened with `?`). */
export const SHORTCUTS_HELP_COPY = {
  title: "Pintasan keyboard",
  description:
    "Untuk pengguna yang sering memakai aplikasi. Tidak aktif saat Anda sedang mengetik di kolom isian.",
  goToHeading: "Pindah halaman",
  goToHint: (key: string) => `Tekan G lalu ${key.toUpperCase()}`,
  actionsHeading: "Tindakan",
  closeLabel: "Tutup",
} as const;
