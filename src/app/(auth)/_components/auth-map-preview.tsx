import { AUTH_MAP_PREVIEW_COPY } from "@/config/auth";

/**
 * Decorative product preview card rendered inside the auth brand panel.
 * The SVG is an abstract evocation of the Indonesian archipelago —
 * deliberately not a faithful map, since loading the real GeoJSON on a
 * public route would blow the bundle budget for zero functional gain.
 *
 * Three dots are highlighted in `brand-500` / `brand-400` / `accent`
 * to telegraph the choropleth that the authenticated `/map` page
 * delivers. All colours are pulled from the project palette.
 */
export function AuthMapPreview() {
  return (
    <figure
      aria-label={AUTH_MAP_PREVIEW_COPY.alt}
      className="glass-panel relative overflow-hidden rounded-2xl border-white/15 bg-white/10 p-5 text-white"
    >
      <figcaption className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
          {AUTH_MAP_PREVIEW_COPY.title}
        </p>
        <p className="text-sm font-medium text-white/90">
          {AUTH_MAP_PREVIEW_COPY.caption}
        </p>
      </figcaption>

      <div className="mt-4">
        <svg
          role="img"
          aria-label={AUTH_MAP_PREVIEW_COPY.alt}
          viewBox="0 0 320 140"
          xmlns="http://www.w3.org/2000/svg"
          className="block h-auto w-full"
        >
          <title>{AUTH_MAP_PREVIEW_COPY.alt}</title>
          {/* Latar grid halus untuk kesan peta */}
          <defs>
            <pattern
              id="auth-map-grid"
              width="16"
              height="16"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 16 0 L 0 0 0 16"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="0.6"
              />
            </pattern>
          </defs>
          <rect width="320" height="140" fill="url(#auth-map-grid)" />

          {/* Abstrak kepulauan Indonesia — bentuk-bentuk longgar, bukan
              representasi geografis akurat. */}
          <g
            fill="rgba(255,255,255,0.18)"
            stroke="rgba(255,255,255,0.32)"
            strokeWidth="0.8"
          >
            {/* Sumatra */}
            <path d="M22,52 Q34,42 42,46 Q56,52 62,68 Q66,82 60,94 Q52,104 42,96 Q30,86 26,72 Z" />
            {/* Jawa */}
            <path d="M88,96 Q108,92 132,94 Q156,96 168,100 Q168,108 152,110 Q124,114 102,110 Q88,106 88,100 Z" />
            {/* Kalimantan */}
            <path d="M114,42 Q140,38 160,46 Q172,56 168,72 Q160,86 140,84 Q120,82 114,68 Z" />
            {/* Sulawesi */}
            <path d="M192,48 Q204,40 212,50 Q216,62 208,72 Q214,82 210,92 Q198,92 196,82 Q190,72 198,64 Q190,58 192,48 Z" />
            {/* Maluku scatter */}
            <circle cx="238" cy="64" r="3" />
            <circle cx="248" cy="76" r="2.4" />
            <circle cx="232" cy="82" r="2.2" />
            {/* Papua */}
            <path d="M260,52 Q286,48 304,60 Q310,76 296,86 Q278,90 268,82 Q258,72 260,62 Z" />
            {/* Nusa Tenggara scatter */}
            <circle cx="178" cy="118" r="2" />
            <circle cx="194" cy="120" r="1.8" />
            <circle cx="208" cy="122" r="1.6" />
          </g>

          {/* Three highlighted regions menggambarkan choropleth ordinal. */}
          <g>
            <circle cx="48" cy="74" r="5.5" fill="#6FBE8D" opacity="0.9">
              <animate
                attributeName="opacity"
                values="0.6;1;0.6"
                dur="3.2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="132" cy="104" r="5.5" fill="#4AA5DF" opacity="0.9">
              <animate
                attributeName="opacity"
                values="0.6;1;0.6"
                dur="3.8s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="282" cy="68" r="5.5" fill="#095F96" opacity="0.95">
              <animate
                attributeName="opacity"
                values="0.7;1;0.7"
                dur="4.4s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        </svg>
      </div>

      {/* Legend ordinal — copy ringkas yang selaras dengan tabel di /map. */}
      <ul className="mt-4 flex items-center gap-4 text-[11px] font-medium text-white/80">
        <li className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: "#6FBE8D" }}
          />
          Rendah
        </li>
        <li className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: "#4AA5DF" }}
          />
          Sedang
        </li>
        <li className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: "#095F96" }}
          />
          Tinggi
        </li>
      </ul>
    </figure>
  );
}
