// One-off introspection helper. Reads the `Source` sheet of Dataset.xlsx and
// prints column names + the first three rows so the importer knows which
// headings to map. Not wired into package.json — invoke directly with:
//   npx tsx scripts/_lib/peek-source-sheet.ts

import { readFileSync } from "node:fs";

import { read, utils } from "xlsx";

import { resolveSourcePath } from "./script-context.ts";

const path = resolveSourcePath("Dataset.xlsx");
const wb = read(readFileSync(path), { type: "buffer" });
const sheet = wb.Sheets["Source"];
if (!sheet) {
  console.error("Sheet 'Source' not found. Sheets:", wb.SheetNames);
  process.exit(1);
}
const rows = utils.sheet_to_json<Record<string, unknown>>(sheet, {
  defval: null,
});
console.log("Columns:", Object.keys(rows[0] ?? {}));
console.log("Sample:");
console.log(JSON.stringify(rows.slice(0, 4), null, 2));
console.log(`Total rows: ${rows.length}`);
