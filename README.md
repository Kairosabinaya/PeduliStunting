# Peduli Stunting

Web app interaktif yang menyatukan **peta prevalensi stunting kabupaten/kota
Indonesia**, **edukasi gizi Buku KIA**, **tracker pertumbuhan anak**, dan
**dashboard model GTWENOLR** dalam satu pengalaman. Dirancang untuk dipakai
dari ponsel Android mid-range di jaringan lambat sampai desktop layar besar.

---

## 1. Fitur

1. **Map (`/map`)** — choropleth 514 kabupaten/kota × 4 tahun (2021–2024).
   MapLibre vector tile, palette hijau/kuning/merah. Bottom-sheet pattern di
   mobile, side panel di desktop. Search wilayah fuzzy dengan tap-to-zoom.
2. **Edukasi (`/edukasi`)** — artikel Buku KIA 2024 dikelompokkan per topik
   dan rentang usia, filter URL-driven.
3. **Tracker (`/tracker`)** — pemantauan pertumbuhan anak (BB, TB/PB, LK,
   LiLA), z-score otomatis vs LMS WHO, ceklis imunisasi dan milestone
   perkembangan.
4. **Dashboard (`/dashboard`)** — metadata model GTWENOLR (akurasi, QWK,
   MAE), Moran's I per tahun, slider what-if 20 prediktor.

---

## 2. Stack

| Lapisan          | Pilihan |
|------------------|---------|
| Framework        | Next.js (App Router) |
| Bahasa           | TypeScript strict |
| UI               | Tailwind CSS + class-variance-authority |
| Peta             | MapLibre GL + OpenFreeMap positron tile |
| Data             | Supabase Postgres + Auth + RLS |
| Validasi         | Zod |
| Form             | react-hook-form |
| Test             | Vitest + React Testing Library + Playwright |
| Observability    | Sentry + Pino |
| CI/CD            | GitHub Actions, Vercel preview per PR |
| Package manager  | pnpm |

Arsitektur Clean Architecture empat lapis: `domain` ← `application` ←
`infrastructure` / `presentation`. Wiring DI eksplisit per use case
factory di `/src/composition/`.

---

## 3. Prasyarat

- Node.js ≥ 22 (lihat `.nvmrc`)
- pnpm 11.2.2 (lihat `packageManager` di `package.json`)
- Supabase CLI (opsional, untuk migrasi & RLS test lokal)
- Python 3.10+ dengan `shapely` (hanya untuk skrip konversi `.gpkg`)
- R / Rscript (opsional, untuk parse `.rds` model GTWENOLR)

---

## 4. Setup lokal

```bash
# 1. Pasang dependency
pnpm install --frozen-lockfile

# 2. Siapkan env
cp .env.example .env.local
# isi Supabase URL + anon key + service role (untuk admin scripts)

# 3. Jalankan dev server
pnpm dev    # http://localhost:3000

# 4. (Sekali) impor dataset ke Supabase
pnpm import:all
# atau per langkah: import:regions → import:boundaries → import:indicators
# (model: import:model — butuh Rscript)
```

---

## 5. Skrip

| Perintah | Fungsi |
|----------|--------|
| `pnpm dev` | Next.js dev server (Turbopack) |
| `pnpm build` | Production build |
| `pnpm start` | Jalankan hasil build |
| `pnpm typecheck` | `tsc --noEmit` strict |
| `pnpm lint` | ESLint zero-warning |
| `pnpm lint:fix` | ESLint dengan auto-fix |
| `pnpm format` | Prettier write semua |
| `pnpm format:check` | Prettier check (CI) |
| `pnpm test` | Vitest run sekali |
| `pnpm test:watch` | Vitest watch mode |
| `pnpm test:coverage` | Coverage report (gate 80% line/branch/function) |
| `pnpm test:e2e` | Playwright (preview-deployment-based) |
| `pnpm import:regions` | Import master 540 kabupaten/kota |
| `pnpm import:boundaries` | Import 514 GeoJSON batas wilayah |
| `pnpm import:indicators` | Import indikator + dictionary |
| `pnpm import:papua` | Backfill geometri pemekaran Papua |
| `pnpm import:model` | Import model GTWENOLR + prediksi (butuh R) |
| `pnpm import:all` | Chain semua impor di atas |

---

## 6. Struktur proyek

```
/
├── public/brand/       Logo & icon
├── scripts/            Skrip impor data (TypeScript + helper Python/R)
├── src/
│   ├── app/            Next.js App Router (routes saja)
│   ├── components/
│   │   ├── primitives/ Button, Modal, BottomSheet, EmptyState, dst.
│   │   └── features/   Feature-specific (map/, tracker/, edukasi/, dst.)
│   ├── composition/    Dependency injection wiring
│   ├── config/         env validation, constants, feature flags
│   ├── domain/         Entity, value object, port, error, Result
│   ├── application/    Use case + DTO
│   ├── infrastructure/ Supabase repos, Sentry, logger
│   ├── lib/            Framework-agnostic utils (cn, useMediaQuery, dst.)
│   ├── schemas/        Zod schemas
│   ├── types/          Generated DB types + shared TS types
│   └── styles/         globals.css (Tailwind layers + glass panel utility)
├── supabase/
│   ├── migrations/     Postgres migrations (reversible)
│   └── tests/          pgtap RLS tests
├── tests/
│   ├── e2e/            Playwright
│   ├── factories/      Test data builders
│   └── setup/
└── tailwind.config.ts  Design tokens (color, spacing, radius, z-index)
```

---

## 7. Environment variables

Lihat `.env.example` untuk daftar resmi. Variabel divalidasi sekali di boot
via Zod di `src/config/env.ts` — jangan akses `process.env` di luar file
ini.

Variabel publik (browser-safe) selalu `NEXT_PUBLIC_*`. Service-role key
Supabase hanya dipakai di skrip Node lokal (`/scripts/_lib/`) dan tidak
pernah di runtime aplikasi.

---

## 8. Testing

```bash
pnpm test               # unit + integration + component (Vitest)
pnpm test:coverage      # gate 80% line / branch / function
pnpm test:e2e           # Playwright — perlu preview deployment Vercel
```

Konvensi penamaan: `describe("ClassName") > describe("methodName") >
it("should X when Y")`. Factory test data di `/tests/factories/`. AAA
pattern (Arrange / Act / Assert).

---

## 9. Deployment

Auto-deploy ke Vercel via GitHub:

- `main` → production
- PR branch → preview deployment (URL muncul di komentar PR)

CI gate per PR (semua wajib hijau): `install`, `lint`, `format:check`,
`typecheck`, `test` + coverage, `build`, Supabase migration dry-run,
Playwright e2e + mobile viewport, Lighthouse CI, bundle size, axe-core
a11y scan.

---

## 10. Konvensi

- **Conventional Commits** wajib via commitlint pre-commit hook. Format:
  `type(scope): subject`. Types: `feat`, `fix`, `docs`, `style`,
  `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- **Trunk-based development**. Short-lived branch (`feat/`, `fix/`,
  `chore/`, `refactor/`, `docs/` + kebab-case). Squash & merge ke `main`.
  Tidak ada force push ke `main`.
- **TSDoc `@example`** untuk setiap primitive di
  `/src/components/primitives/`. Test colocated.
- **Pre-commit hook** (Husky + lint-staged): ESLint, Prettier, typecheck,
  commitlint — semua wajib lewat sebelum commit masuk history.

---

## 11. Performance & a11y baselines

- Lighthouse Performance (mobile) ≥ 90
- Lighthouse Accessibility ≥ 95
- LCP < 2.5s di Slow 3G, INP < 200ms, CLS < 0.1
- Initial JS per route < 200 KB transferred
- Touch target minimum 44 × 44 px, no hover-only interactions
- Tested di 360 / 768 / 1440 px sebelum PR
- Color contrast 4.5:1 body, 3:1 large/UI (WCAG 2.1 AA)
