/**
 * build-who-standards-tsv — fetch the WHO Child Growth Standards LMS tables and
 * emit the four TSV files that `scripts/import-who-standards.ts` consumes.
 *
 * Source: the WHO Child Growth Standards (2006) z-score tables mirrored as JSON
 * in the pygrowup project (https://github.com/ewheeler/pygrowup). Each row
 * carries the WHO `L`, `M`, `S` coefficients (plus SD reference columns we
 * ignore). Spot checks vs z-score-calculator.who-validation.test.ts:
 *   weight-for-age boys 0 mo -> L=0.3487 M=3.3464 S=0.14602
 *   height-for-age boys 24 mo -> M=87.1161 (standing height; see note below)
 *
 * Indicator mapping:
 *   BB_U  <- wfa_{boys,girls}_0_5    (Month 0-60)
 *   TB_U  <- lhfa_{boys,girls}_0_5   (Month 0-60; WHO merges length 0-24 +
 *                                     height 24-60)
 *   LK_U  <- hcfa_{boys,girls}_0_5   (Month 0-60)
 *   BB_TB <- wfl_{boys,girls}_0_2 (Length 45..<87 cm) +
 *            wfh_{boys,girls}_2_5 (Height 87..120 cm)
 *
 * Length/height overlap at 24 months: the lhfa table contains BOTH a recumbent
 * length row and a standing height row for month 24 (the standing value is
 * ~0.7 cm shorter). WHO Anthro uses standing height from 24 months onward, and
 * the app's domain reference (validation test) uses 87.1161 for boys. So at any
 * duplicated month we keep the SMALLER M (standing height < recumbent length).
 *
 * The WHO weight-for-length/height tables use 0.5 cm steps; the repository
 * BB/TB lookup is a floor match (`x_value <= measured`, greatest first), so the
 * 0.5 cm grid is the canonical granularity. The 87 cm cut-over is the WHO
 * length->height (recumbent->standing, ~24 months) transition.
 *
 * Run: node scripts/build-who-standards-tsv.mjs
 * Output: docs/source/who-standards/who-lms-{bb-u,tb-u,bb-tb,lk-u}.tsv
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const BASE =
  "https://raw.githubusercontent.com/ewheeler/pygrowup/master/pygrowup/tables";

const OUT_DIR = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "docs",
  "source",
  "who-standards",
);

const HEADER = ["sex", "axis_value", "axis_unit", "L", "M", "S"].join("\t");

const BB_TB_CUTOVER_CM = 87;
const MAX_AGE_MONTHS = 60;

async function fetchJson(name) {
  const res = await fetch(`${BASE}/${name}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${name}: HTTP ${res.status}`);
  }
  return res.json();
}

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : Number.NaN;
}

/**
 * Build TSV lines from one WHO z-score JSON array (single sex). Dedupes on the
 * axis value keeping the smaller M (resolves the month-24 length/height overlap
 * toward standing height).
 *
 * @param rows parsed JSON array
 * @param sex "L" | "P"
 * @param axisKey "Month" | "Length" | "Height"
 * @param axisUnit "month" | "cm"
 * @param opts.integerAxis keep only whole-number axis values (months)
 * @param opts.min inclusive axis lower bound
 * @param opts.maxInclusive inclusive upper bound
 * @param opts.maxExclusive exclusive upper bound (cutover)
 */
function toLines(rows, sex, axisKey, axisUnit, opts) {
  const byAxis = new Map();
  for (const row of rows) {
    const axis = num(row[axisKey]);
    const l = num(row.L);
    const m = num(row.M);
    const s = num(row.S);
    if (![axis, l, m, s].every(Number.isFinite)) continue;
    if (opts.integerAxis && !Number.isInteger(axis)) continue;
    if (opts.min !== undefined && axis < opts.min) continue;
    if (opts.maxInclusive !== undefined && axis > opts.maxInclusive) continue;
    if (opts.maxExclusive !== undefined && axis >= opts.maxExclusive) continue;
    const existing = byAxis.get(axis);
    if (existing && existing.m <= m) continue;
    byAxis.set(axis, { axis, l, m, s });
  }
  return [...byAxis.values()]
    .sort((a, b) => a.axis - b.axis)
    .map((r) =>
      [
        sex,
        String(r.axis),
        axisUnit,
        String(r.l),
        String(r.m),
        String(r.s),
      ].join("\t"),
    );
}

function write(fileName, rows) {
  const path = resolve(OUT_DIR, fileName);
  writeFileSync(path, `${HEADER}\n${rows.join("\n")}\n`, "utf-8");
  return `${fileName}: ${rows.length} rows`;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const [wfaB, wfaG, lhfaB, lhfaG, hcfaB, hcfaG, wflB, wflG, wfhB, wfhG] =
    await Promise.all([
      fetchJson("wfa_boys_0_5_zscores.json"),
      fetchJson("wfa_girls_0_5_zscores.json"),
      fetchJson("lhfa_boys_0_5_zscores.json"),
      fetchJson("lhfa_girls_0_5_zscores.json"),
      fetchJson("hcfa_boys_0_5_zscores.json"),
      fetchJson("hcfa_girls_0_5_zscores.json"),
      fetchJson("wfl_boys_0_2_zscores.json"),
      fetchJson("wfl_girls_0_2_zscores.json"),
      fetchJson("wfh_boys_2_5_zscores.json"),
      fetchJson("wfh_girls_2_5_zscores.json"),
    ]);

  const monthOpts = { integerAxis: true, min: 0, maxInclusive: MAX_AGE_MONTHS };
  const wflOpts = { maxExclusive: BB_TB_CUTOVER_CM };
  const wfhOpts = { min: BB_TB_CUTOVER_CM };

  const bbU = [
    ...toLines(wfaB, "L", "Month", "month", monthOpts),
    ...toLines(wfaG, "P", "Month", "month", monthOpts),
  ];
  const tbU = [
    ...toLines(lhfaB, "L", "Month", "month", monthOpts),
    ...toLines(lhfaG, "P", "Month", "month", monthOpts),
  ];
  const lkU = [
    ...toLines(hcfaB, "L", "Month", "month", monthOpts),
    ...toLines(hcfaG, "P", "Month", "month", monthOpts),
  ];
  const bbTb = [
    ...toLines(wflB, "L", "Length", "cm", wflOpts),
    ...toLines(wfhB, "L", "Height", "cm", wfhOpts),
    ...toLines(wflG, "P", "Length", "cm", wflOpts),
    ...toLines(wfhG, "P", "Height", "cm", wfhOpts),
  ];

  const report = [
    write("who-lms-bb-u.tsv", bbU),
    write("who-lms-tb-u.tsv", tbU),
    write("who-lms-bb-tb.tsv", bbTb),
    write("who-lms-lk-u.tsv", lkU),
  ].join("\n");

  writeFileSync(resolve(OUT_DIR, "build-summary.txt"), `${report}\n`, "utf-8");
  process.stdout.write(`${report}\nDONE\n`);
}

main().catch((error) => {
  process.stderr.write(`ERROR: ${error.message}\n`);
  process.exit(1);
});
