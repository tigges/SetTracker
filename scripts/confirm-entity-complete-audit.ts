/**
 * Confirm a producer / Claude completeness CSV and write fill-null pins.
 *
 *   npx tsx scripts/confirm-entity-complete-audit.ts [csv-path]
 *
 * Never invents handles. Drops unconfirmed rows and Event.youtube (no column).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import {
  parseEntityCompleteCsv,
  pinsFromAudit,
} from "../src/lib/ingest/entityCompletePins";

const csvPath =
  process.argv[2] ||
  join(process.cwd(), "data/crosscheck/entity-complete-audit.csv");
const pinsPath = join(process.cwd(), "data/entity-complete-pins.json");
const reportPath = join(
  process.cwd(),
  "data/crosscheck/entity-complete-confirm.json",
);

async function main() {
  const text = await readFile(csvPath, "utf8");
  const { pins, dropped } = pinsFromAudit(parseEntityCompleteCsv(text));
  await mkdir(dirname(pinsPath), { recursive: true });
  await writeFile(pinsPath, `${JSON.stringify(pins, null, 2)}\n`);
  await writeFile(
    reportPath,
    `${JSON.stringify(
      {
        source: csvPath,
        acceptedFields: pins.reduce(
          (n, p) =>
            n +
            ["imageUrl", "website", "instagram", "youtube", "soundcloud", "twitter"].filter(
              (k) => p[k as keyof typeof p],
            ).length,
          0,
        ),
        pinRows: pins.length,
        dropped: dropped.length,
        pins,
        drops: dropped,
      },
      null,
      2,
    )}\n`,
  );
  console.log(
    `entity-complete ${pins.length} pins · ${dropped.length} dropped → ${pinsPath}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
