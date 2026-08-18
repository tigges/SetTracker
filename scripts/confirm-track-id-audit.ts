/**
 * Confirm a producer audit CSV (ISRC + canonical Beatport) via Deezer.
 * Never scrapes Beatport HTML. Writes data/track-id-pins.json for fill-null apply.
 *
 *   npx tsx scripts/confirm-track-id-audit.ts [csv-path]
 */
import { readFile } from "node:fs/promises";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { evaluateTrackIdPin, type TrackIdPin } from "../src/lib/ingest/identify/trackIdPins";
import { canonicalBeatportUrl, normalizeIsrc } from "../src/lib/trackMeta";

const UA = "SetRadar/0.2.190 (+https://setradar.ai; track-id confirm)";

type AuditRow = {
  slug: string;
  artist: string;
  title: string;
  plays: string;
  isrc: string;
  beatportUrl: string;
  confidence: string;
  source: string;
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      quoted = true;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (ch === "\n") {
      row.push(cell.replace(/\r$/, ""));
      if (row.some((c) => c.length)) rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += ch;
  }
  if (cell.length || row.length) {
    row.push(cell.replace(/\r$/, ""));
    if (row.some((c) => c.length)) rows.push(row);
  }
  return rows;
}

async function readAudit(path: string): Promise<AuditRow[]> {
  const text = await readFile(path, "utf8");
  const table = parseCsv(text);
  const header = table[0] ?? [];
  return table.slice(1).map((cols) => {
    const rec: Record<string, string> = {};
    for (let i = 0; i < header.length; i++) rec[header[i]!] = (cols[i] ?? "").trim();
    return rec as unknown as AuditRow;
  });
}

async function lookupDeezerIsrc(
  isrc: string,
): Promise<{ artist: string; title: string; isrc: string } | null> {
  const url = `https://api.deezer.com/track/isrc:${encodeURIComponent(isrc)}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      error?: { message?: string };
      title?: string;
      isrc?: string;
      artist?: { name?: string };
    };
    if (json.error || !json.title) return null;
    const liveIsrc = normalizeIsrc(json.isrc || isrc);
    if (!liveIsrc) return null;
    return {
      artist: json.artist?.name || "",
      title: json.title,
      isrc: liveIsrc,
    };
  } catch {
    return null;
  }
}

async function probeBeatport(url: string): Promise<{
  url: string;
  status: number | null;
  finalUrl: string | null;
}> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      headers: { "User-Agent": UA, Accept: "*/*" },
      signal: AbortSignal.timeout(10_000),
    });
    return { url, status: res.status, finalUrl: res.url };
  } catch {
    try {
      const res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: { "User-Agent": UA, Accept: "text/html" },
        signal: AbortSignal.timeout(10_000),
      });
      return { url, status: res.status, finalUrl: res.url };
    } catch {
      return { url, status: null, finalUrl: null };
    }
  }
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, i: number) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next;
      next += 1;
      out[i] = await fn(items[i]!, i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
  return out;
}

async function main() {
  const csvPath =
    process.argv[2] ||
    "/home/ubuntu/.cursor/projects/workspace/uploads/track-id-results-audit_b136.csv";
  const rows = await readAudit(csvPath);
  const withBp = rows.filter((r) => canonicalBeatportUrl(r.beatportUrl));
  const withIsrc = rows.filter((r) => normalizeIsrc(r.isrc));

  const probeSample = withBp.slice(0, 8).map((r) => r.beatportUrl);
  const probes = await Promise.all(probeSample.map(probeBeatport));

  const needConfirm = rows.filter((r) => normalizeIsrc(r.isrc));
  const lives = await mapPool(needConfirm, 6, async (row) => {
    const isrc = normalizeIsrc(row.isrc)!;
    const live = await lookupDeezerIsrc(isrc);
    return { row, live };
  });

  const pins: TrackIdPin[] = [];
  const rejected: Record<string, number> = {};
  let confirmed = 0;
  for (const { row, live } of lives) {
    const ev = evaluateTrackIdPin(
      {
        slug: row.slug,
        artist: row.artist,
        title: row.title,
        isrc: row.isrc,
        beatportUrl: row.beatportUrl,
        confidence: row.confidence,
        source: row.source,
      },
      live,
    );
    if (ev.ok && ev.pin) {
      confirmed += 1;
      pins.push(ev.pin);
    } else {
      rejected[ev.reason] = (rejected[ev.reason] ?? 0) + 1;
    }
  }

  pins.sort((a, b) => a.slug.localeCompare(b.slug));
  const outPath = join(process.cwd(), "data/track-id-pins.json");
  await writeFile(outPath, `${JSON.stringify(pins, null, 2)}\n`);

  const report = {
    generatedAt: new Date().toISOString(),
    csv: csvPath,
    rows: rows.length,
    withBeatport: withBp.length,
    withIsrc: withIsrc.length,
    beatportProbes: probes,
    deezerConfirmed: confirmed,
    pins: pins.length,
    pinsWithBeatport: pins.filter((p) => p.beatportUrl).length,
    pinsWithIsrc: pins.filter((p) => p.isrc).length,
    rejected,
    note: "Beatport HTML is never scraped. Pins require a Deezer ISRC hit plus a canonical /track URL whose slug matches the title.",
  };
  await writeFile(
    join(process.cwd(), "data/crosscheck/track-id-audit-confirm.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
