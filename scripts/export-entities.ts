/**
 * Dump DJs / festivals / clubs missing thumbs or official URLs.
 *
 *   npm run export:entities
 *   npm run export:entities -- --public   # also write public/exports/ (Pages)
 *
 * Missing catalog → warn and exit 0 (same as export-tracks).
 * Read-only. Never invents handles.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "../src/lib/db";
import { isDjOnHealthBar } from "../src/lib/statsHealth";
import { isVenueListed } from "../src/lib/venueBrowse";
import { getDjList } from "../src/lib/queries";
import {
  CLAUDE_ENTITY_COMPLETE_PROMPT,
  entitiesOfKind,
  entitiesToClaudeJsonl,
  entitiesToCsv,
  rowFromDj,
  rowFromEvent,
  sortNeedComplete,
  type EntityKind,
  type ExportEntityRow,
} from "../src/lib/exportEntities";

const writePublic = process.argv.includes("--public");

async function loadRows(): Promise<ExportEntityRow[]> {
  const [djs, events] = await Promise.all([
    getDjList(),
    prisma.event.findMany({
      select: {
        slug: true,
        name: true,
        kind: true,
        location: true,
        website: true,
        instagram: true,
        soundcloud: true,
        twitter: true,
        imageUrl: true,
        _count: { select: { sets: true } },
      },
    }),
  ]);

  const rows: ExportEntityRow[] = [];
  for (const d of djs) {
    if (!isDjOnHealthBar(d)) continue;
    rows.push(rowFromDj(d));
  }
  for (const e of events) {
    const row = rowFromEvent({
      slug: e.slug,
      name: e.name,
      kind: e.kind,
      location: e.location,
      setCount: e._count.sets,
      imageUrl: e.imageUrl,
      website: e.website,
      instagram: e.instagram,
      soundcloud: e.soundcloud,
      twitter: e.twitter,
    });
    if (!row) continue;
    if (!isVenueListed({ setCount: row.setCount, website: row.website })) continue;
    rows.push(row);
  }
  return rows;
}

function writeKind(
  dir: string,
  rows: ExportEntityRow[],
  kind: EntityKind,
): Promise<void>[] {
  const need = sortNeedComplete(entitiesOfKind(rows, kind));
  return [
    writeFile(path.join(dir, `${kind}s-need-complete.csv`), entitiesToCsv(need)),
    writeFile(
      path.join(dir, `${kind}s-need-complete.jsonl`),
      entitiesToClaudeJsonl(need),
    ),
  ];
}

async function writeDir(dir: string, rows: ExportEntityRow[]): Promise<void> {
  const need = sortNeedComplete(rows);
  await mkdir(dir, { recursive: true });
  await Promise.all([
    writeFile(path.join(dir, "entities.csv"), entitiesToCsv(rows)),
    writeFile(path.join(dir, "entities-need-complete.csv"), entitiesToCsv(need)),
    writeFile(
      path.join(dir, "entities-need-complete.jsonl"),
      entitiesToClaudeJsonl(need),
    ),
    writeFile(
      path.join(dir, "claude-entity-complete-prompt.md"),
      CLAUDE_ENTITY_COMPLETE_PROMPT,
    ),
    ...writeKind(dir, rows, "dj"),
    ...writeKind(dir, rows, "festival"),
    ...writeKind(dir, rows, "club"),
  ]);
  console.log(
    `export:entities ${rows.length} listed · ${need.length} need complete → ${dir}`,
  );
}

async function main() {
  let rows: ExportEntityRow[] = [];
  try {
    rows = await loadRows();
  } catch (err) {
    console.warn(
      "export:entities: catalog unavailable —",
      err instanceof Error ? err.message : err,
    );
    return;
  }
  await writeDir(path.join(process.cwd(), "data/entity-complete-export"), rows);
  if (writePublic) {
    await writeDir(path.join(process.cwd(), "public/exports"), rows);
  }
}

main()
  .catch((err) => {
    console.warn("export:entities failed:", err);
    process.exit(0);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
