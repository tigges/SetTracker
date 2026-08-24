/**
 * Confirm a producer audit CSV or JSONL (ISRC + canonical Beatport) via Deezer.
 * Never scrapes Beatport HTML. Writes data/track-id-pins.json for fill-null apply.
 *
 *   npx tsx scripts/confirm-track-id-audit.ts [csv-or-jsonl-path]
 */
import { readFile } from "node:fs/promises";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  evaluateTrackIdPin,
  isJunkTrackPin,
  loadTrackIdPins,
  mergeTrackIdPins,
  type TrackIdPin,
} from "../src/lib/ingest/identify/trackIdPins";
import {
  catalogQueryTitle,
  namesClose,
  primaryArtist,
} from "../src/lib/ingest/identify/names";
import {
  canonicalBeatportUrl,
  canonicalSpotifyUrl,
  normalizeIsrc,
} from "../src/lib/trackMeta";

const UA = "SetRadar/0.2.190 (+https://setradar.ai; track-id confirm)";

type AuditRow = {
  slug: string;
  artist: string;
  title: string;
  plays: string;
  isrc: string;
  beatportUrl: string;
  spotifyUrl: string;
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

function cleanBeatport(raw: string | null | undefined): string {
  const s = (raw ?? "").trim();
  if (!s || /link removed/i.test(s)) return "";
  return s;
}

async function readCsvAudit(path: string): Promise<AuditRow[]> {
  const text = await readFile(path, "utf8");
  const table = parseCsv(text);
  const header = table[0] ?? [];
  return table.slice(1).map((cols) => {
    const rec: Record<string, string> = {};
    for (let i = 0; i < header.length; i++) rec[header[i]!] = (cols[i] ?? "").trim();
    rec.source = (rec.source || rec.idSource || "").trim();
    return rec as unknown as AuditRow;
  });
}

function namesFromSlug(slug: string): { artist: string; title: string } {
  const parts = slug.split("-").filter(Boolean);
  if (parts.length < 2) return { artist: "", title: slug.replace(/-/g, " ") };
  return {
    artist: parts.slice(0, Math.min(2, parts.length - 1)).join(" "),
    title: parts.slice(Math.min(2, parts.length - 1)).join(" "),
  };
}

async function readJsonlAudit(path: string): Promise<AuditRow[]> {
  const text = await readFile(path, "utf8");
  const catalog = new Map<string, AuditRow>();
  const nameHelpers = [
    join(process.cwd(), "data/crosscheck/track-id-results-audit.csv"),
    join(process.cwd(), "data/track-id-export/tracks-need-id.csv"),
  ];
  for (const helper of nameHelpers) {
    try {
      for (const row of await readCsvAudit(helper)) {
        if (!catalog.has(row.slug)) catalog.set(row.slug, row);
      }
    } catch {
      /* name help is optional */
    }
  }
  const rows: AuditRow[] = [];
  for (const line of text.split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let obj: Record<string, unknown>;
    try {
      obj = JSON.parse(trimmed) as Record<string, unknown>;
    } catch {
      continue;
    }
    const slug = String(obj.slug ?? "").trim();
    if (!slug) continue;
    const prev = catalog.get(slug);
    const guessed = namesFromSlug(slug);
    rows.push({
      slug,
      artist: String(obj.artist ?? prev?.artist ?? guessed.artist),
      title: String(obj.title ?? prev?.title ?? guessed.title),
      plays: String(obj.plays ?? prev?.plays ?? ""),
      isrc: String(obj.isrc ?? ""),
      beatportUrl: cleanBeatport(String(obj.beatportUrl ?? "")),
      spotifyUrl: String(obj.spotifyUrl ?? ""),
      confidence: String(obj.confidence ?? obj.alignment ?? ""),
      source: String(obj.source ?? "jsonl"),
    });
  }
  return rows;
}

async function readAudit(path: string): Promise<AuditRow[]> {
  if (path.endsWith(".jsonl")) return readJsonlAudit(path);
  return readCsvAudit(path);
}

function hasProposedId(row: AuditRow): boolean {
  return Boolean(
    normalizeIsrc(row.isrc) ||
      canonicalBeatportUrl(row.beatportUrl) ||
      canonicalSpotifyUrl(row.spotifyUrl),
  );
}

function coreTitle(value: string): string {
  return catalogQueryTitle(value)
    .replace(/\b(feat\.?|ft\.?|featuring)\b.+$/i, "")
    .replace(/\s*[(\[].*?[)\]]\s*/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Name-search hits must keep remix/bootleg when the catalog title has one. */
function searchTitleOk(catalogTitle: string, liveTitle: string): boolean {
  const wantMix = /\b(remix|bootleg)\b/i.test(catalogTitle);
  const gotMix = /\b(remix|bootleg)\b/i.test(liveTitle);
  if (wantMix && !gotMix) return false;
  if (namesClose(catalogTitle, liveTitle)) return true;
  return namesClose(coreTitle(catalogTitle), coreTitle(liveTitle));
}

function artistOk(catalogArtist: string, liveArtist: string): boolean {
  if (!liveArtist) return false;
  const primary = primaryArtist(catalogArtist);
  return (
    namesClose(primary, liveArtist) ||
    namesClose(catalogArtist, liveArtist) ||
    catalogArtist.toLowerCase().includes(liveArtist.toLowerCase())
  );
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

async function fetchDeezerTrackIsrc(id: number): Promise<string | null> {
  try {
    const res = await fetch(`https://api.deezer.com/track/${id}`, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { isrc?: string };
    return normalizeIsrc(json.isrc);
  } catch {
    return null;
  }
}

async function lookupDeezerByName(
  artist: string,
  title: string,
): Promise<{ artist: string; title: string; isrc: string } | null> {
  const primary = primaryArtist(artist);
  const core = coreTitle(title);
  const queries = [`artist:"${primary}" track:"${core}"`, `${core} ${primary}`];
  if (/\b(remix|bootleg)\b/i.test(title)) {
    queries.unshift(`${title} ${primary}`, `${core} remix ${primary}`);
  }
  for (const q of queries) {
    try {
      const res = await fetch(
        `https://api.deezer.com/search/track?q=${encodeURIComponent(q)}&limit=8`,
        {
          headers: { "User-Agent": UA, Accept: "application/json" },
          signal: AbortSignal.timeout(12_000),
        },
      );
      if (!res.ok) continue;
      const json = (await res.json()) as {
        data?: Array<{
          id?: number;
          title?: string;
          isrc?: string;
          artist?: { name?: string };
        }>;
      };
      for (const row of json.data ?? []) {
        const liveArtist = row.artist?.name ?? "";
        const liveTitle = row.title ?? "";
        if (!artistOk(artist, liveArtist) || !searchTitleOk(title, liveTitle)) {
          continue;
        }
        const isrc =
          normalizeIsrc(row.isrc) ||
          (row.id ? await fetchDeezerTrackIsrc(row.id) : null);
        if (!isrc) continue;
        return { artist: liveArtist, title: liveTitle, isrc };
      }
    } catch {
      /* try the next query */
    }
  }
  return null;
}

async function confirmLive(
  row: AuditRow,
): Promise<{ artist: string; title: string; isrc: string } | null> {
  const known = normalizeIsrc(row.isrc);
  if (known) {
    const live = await lookupDeezerIsrc(known);
    if (live) return live;
  }
  return lookupDeezerByName(row.artist, row.title);
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
    // HEAD only — a GET would fetch Beatport HTML and trip Cloudflare.
    return { url, status: null, finalUrl: null };
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
    join(process.cwd(), "data/crosscheck/track-id-results-audit.csv");
  const rows = await readAudit(csvPath);
  const withBp = rows.filter((r) => canonicalBeatportUrl(r.beatportUrl));
  const withIsrc = rows.filter((r) => normalizeIsrc(r.isrc));

  const probeSample = withBp.slice(0, 8).map((r) => r.beatportUrl);
  const probes = await Promise.all(probeSample.map(probeBeatport));

  const junkSkipped = rows.filter(
    (r) => hasProposedId(r) && isJunkTrackPin(r),
  ).length;
  const needConfirm = rows.filter((r) => hasProposedId(r) && !isJunkTrackPin(r));
  const lives = await mapPool(needConfirm, 2, async (row) => {
    const live = await confirmLive(row);
    return { row, live };
  });

  const pins: TrackIdPin[] = [];
  const rejected: Record<string, number> = {};
  const rejectedRows: Array<{ slug: string; reason: string }> = [];
  let confirmed = 0;
  for (const { row, live } of lives) {
    const ev = evaluateTrackIdPin(
      {
        slug: row.slug,
        artist: row.artist,
        title: row.title,
        isrc: row.isrc || live?.isrc,
        beatportUrl: row.beatportUrl,
        spotifyUrl: row.spotifyUrl,
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
      rejectedRows.push({ slug: row.slug, reason: ev.reason });
    }
  }

  const existing = loadTrackIdPins();
  const merged = mergeTrackIdPins(existing, pins);
  const pinUrls = [
    ...new Set(
      pins.map((p) => p.beatportUrl).filter((u): u is string => Boolean(u)),
    ),
  ].slice(0, 40);
  const liveHeads = pinUrls.length
    ? await mapPool(pinUrls, 4, async (url) => {
        const hit = await probeBeatport(url);
        return { url, status: hit.status };
      })
    : [];
  const dead = new Set(
    liveHeads.filter((h) => h.status === 404).map((h) => h.url),
  );
  const kept: TrackIdPin[] = merged.map((p) => {
    if (p.beatportUrl && dead.has(p.beatportUrl)) {
      return { slug: p.slug, ...(p.isrc ? { isrc: p.isrc } : {}) };
    }
    return p;
  });

  const outPath = join(process.cwd(), "data/track-id-pins.json");
  await writeFile(outPath, `${JSON.stringify(kept, null, 2)}\n`);

  const report = {
    generatedAt: new Date().toISOString(),
    csv: csvPath,
    rows: rows.length,
    withBeatport: withBp.length,
    withSpotify: rows.filter((r) => canonicalSpotifyUrl(r.spotifyUrl)).length,
    withIsrc: withIsrc.length,
    beatportProbes: probes,
    deezerConfirmed: confirmed,
    newPins: pins.length,
    keptExisting: existing.length,
    pins: kept.length,
    pinsWithBeatport: kept.filter((p) => p.beatportUrl).length,
    pinsWithIsrc: kept.filter((p) => p.isrc).length,
    beatport404dropped: [...dead],
    junkSkipped,
    rejected,
    rejectedRows,
    note: "Beatport HTML is never scraped. Pins require a Deezer ISRC hit plus a canonical /track URL whose slug matches the title. Name-search fills ISRC for leftover Beatport/Spotify rows when the live title keeps remix/bootleg. Merge with existing pins; drop HEAD 404 Beatport URLs (keep ISRC).",
  };
  const reportName = csvPath.includes("jsonl-4")
    ? "track-id-jsonl-4-confirm.json"
    : csvPath.includes("completed")
      ? "track-id-completed-confirm.json"
      : csvPath.includes("20260824") || csvPath.includes("leftover")
        ? "track-id-leftover-confirm.json"
        : csvPath.endsWith(".jsonl")
          ? "track-id-jsonl-confirm.json"
          : "track-id-audit-confirm.json";
  await writeFile(
    join(process.cwd(), "data/crosscheck", reportName),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
