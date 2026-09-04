/**
 * File-side catalog QC — no Prisma, no Beatport/1001 crawl.
 * Used by `npm run qc` and unit tests.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { isLeftoverHostName } from "../artistName";
import { KNOWN_EVENTS } from "../ingest/events";
import {
  isRejectedEntitySocialUrl,
  type EntityCompletePin,
} from "../ingest/entityCompletePins";
import {
  hasEvenlySpacedClocks,
  type FingerprintSeedRow,
} from "../ingest/fingerprint/seeds";
import { FINGERPRINT_ONLY_WATCH } from "../ingest/identify/fingerprintWatch";
import { TRACKLIST_1001_BY_SOURCE_SLUG } from "../ingest/tracklists1001/festival2026";
import { YOUTUBE_SETS } from "../ingest/youtube/videos";
import { youtubeVideoId } from "../thumbs/youtubeThumb";
import {
  isJunkTrackPin,
  loadTrackIdPins,
  type TrackIdPin,
} from "../ingest/identify/trackIdPins";
import { ARTIST_ROSTER_CURATED } from "../ingest/roster";
import { slugify } from "../ingest/types";
import { isWeakOfficialUrl } from "../officialUrls";
import {
  canonicalBeatportUrl,
  canonicalSpotifyUrl,
  normalizeIsrc,
} from "../trackMeta";

export type QcIssue = {
  severity: "error" | "warn";
  area: string;
  slug?: string;
  detail: string;
};

export type StaticCatalogQc = {
  generatedAt: string;
  pins: number;
  events: number;
  issues: QcIssue[];
  counts: Record<string, number>;
};

function loadJson<T>(rel: string, fallback: T): T {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), rel), "utf8")) as T;
  } catch {
    return fallback;
  }
}

function auditPins(pins: TrackIdPin[]): QcIssue[] {
  const issues: QcIssue[] = [];
  const seen = new Set<string>();
  for (const pin of pins) {
    if (seen.has(pin.slug)) {
      issues.push({
        severity: "error",
        area: "track-id-pins",
        slug: pin.slug,
        detail: "duplicate slug",
      });
    }
    seen.add(pin.slug);
    if (isJunkTrackPin({ slug: pin.slug })) {
      issues.push({
        severity: "error",
        area: "track-id-pins",
        slug: pin.slug,
        detail: "junk slug",
      });
    }
    if (pin.isrc && !normalizeIsrc(pin.isrc)) {
      issues.push({
        severity: "error",
        area: "track-id-pins",
        slug: pin.slug,
        detail: `invalid ISRC ${pin.isrc}`,
      });
    }
    if (pin.beatportUrl && !canonicalBeatportUrl(pin.beatportUrl)) {
      issues.push({
        severity: "error",
        area: "track-id-pins",
        slug: pin.slug,
        detail: "Beatport URL is not canonical /track/{slug}/{id}",
      });
    }
    if (pin.spotifyUrl && !canonicalSpotifyUrl(pin.spotifyUrl)) {
      issues.push({
        severity: "error",
        area: "track-id-pins",
        slug: pin.slug,
        detail: "Spotify URL is not canonical /track/{22}",
      });
    }
  }
  return issues;
}

function auditKnownEvents(): QcIssue[] {
  const issues: QcIssue[] = [];
  for (const ev of Object.values(KNOWN_EVENTS)) {
    if (ev.website && isWeakOfficialUrl(ev.website)) {
      issues.push({
        severity: "error",
        area: "known-events",
        slug: ev.slug,
        detail: `weak official website ${ev.website}`,
      });
    }
    if (isLeftoverHostName(ev.name)) {
      issues.push({
        severity: "error",
        area: "known-events",
        slug: ev.slug,
        detail: `leftover-host name ${ev.name}`,
      });
    }
  }
  return issues;
}

function auditEntityPins(): QcIssue[] {
  const pins = loadJson<EntityCompletePin[]>("data/entity-complete-pins.json", []);
  const issues: QcIssue[] = [];
  for (const pin of pins) {
    if (pin.website && isWeakOfficialUrl(pin.website)) {
      issues.push({
        severity: "error",
        area: "entity-complete-pins",
        slug: pin.slug,
        detail: `weak official website ${pin.website}`,
      });
    }
    for (const field of [
      "website",
      "instagram",
      "youtube",
      "soundcloud",
      "twitter",
    ] as const) {
      const value = pin[field];
      if (value && isRejectedEntitySocialUrl(value)) {
        issues.push({
          severity: "error",
          area: "entity-complete-pins",
          slug: pin.slug,
          detail: `rejected social ${value}`,
        });
      }
    }
  }
  return issues;
}

/**
 * Duplicate keys in TRACKLIST_1001_BY_SOURCE_SLUG.
 *
 * A repeated slug is legal JS — the last one silently wins — so a fresh
 * capture can override an existing seed and, worse, break a host-twin group
 * by pointing one slug at a different array than its partner. Only the source
 * text can show this; the parsed object has already collapsed.
 */
function auditTracklistSlugDuplicates(): QcIssue[] {
  let src = "";
  try {
    src = readFileSync(
      join(process.cwd(), "src/lib/ingest/tracklists1001/festival2026.ts"),
      "utf8",
    );
  } catch {
    return [];
  }
  const at = src.indexOf("export const TRACKLIST_1001_BY_SOURCE_SLUG");
  if (at < 0) return [];
  const counts = new Map<string, number>();
  for (const m of src.slice(at).matchAll(/^\s*"([^"]+)":/gm)) {
    const slug = m[1]!;
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, n]) => n > 1)
    .map(([slug, n]) => ({
      severity: "error" as const,
      area: "tracklist-1001-slug-map",
      slug,
      detail: `wired ${n}× — the last entry silently wins and can split a host-twin group. Keep one entry per slug.`,
    }));
}

/**
 * Count seeds standing on `evenlySpaceRows` clocks.
 *
 * That helper is deliberate — 1001 often lists track order with no cue
 * times — but the result is ordering dressed as timing: the rows still say
 * `identified`, so a seek lands minutes off. One aggregate warn keeps the
 * scale visible without pretending a sanctioned convention is a defect.
 */
function auditWiredTracklistClocks(): QcIssue[] {
  const seen = new Set<FingerprintSeedRow[]>();
  const slugs: string[] = [];
  for (const [slug, rows] of Object.entries(TRACKLIST_1001_BY_SOURCE_SLUG)) {
    if (!rows?.length || seen.has(rows)) continue;
    seen.add(rows);
    if (hasEvenlySpacedClocks(rows)) slugs.push(slug);
  }
  if (!slugs.length) return [];
  return [
    {
      severity: "warn",
      area: "tracklist-1001-clocks",
      detail:
        `${slugs.length} wired seeds use evenly spaced clocks ` +
        "(evenlySpaceRows): track order is real, the times are approximate. " +
        `e.g. ${slugs.slice(0, 3).join(", ")}`,
    },
  ];
}

/**
 * Fan watch URLs must stay Identify-only.
 *
 * FINGERPRINT_ONLY_WATCH entries are unofficial re-uploads: they may be
 * sampled for offsets but must never become a set's playback or a wired
 * tracklist key. Until now that rule was only enforced inside File Scanning,
 * so nothing stopped a fan video from being curated as a set in the first
 * place. Check both directions statically.
 */
export function auditFingerprintOnlyWatches(
  watches: Array<{ videoId: string; channel: string }> = FINGERPRINT_ONLY_WATCH,
  curatedVideos: readonly string[] = YOUTUBE_SETS.map((v) => v.video),
): QcIssue[] {
  const issues: QcIssue[] = [];
  const curated = new Set<string>();
  for (const v of curatedVideos) {
    const id = youtubeVideoId(v);
    if (id) curated.add(id);
  }
  for (const w of watches) {
    if (TRACKLIST_1001_BY_SOURCE_SLUG[`yt-${w.videoId}`]) {
      issues.push({
        severity: "error",
        area: "fingerprint-only-watch",
        slug: `yt-${w.videoId}`,
        detail: `fan upload (${w.channel}) is wired in TRACKLIST_1001_BY_SOURCE_SLUG — Identify probes only, never a tracklist key`,
      });
    }
    if (curated.has(w.videoId)) {
      issues.push({
        severity: "error",
        area: "fingerprint-only-watch",
        slug: `yt-${w.videoId}`,
        detail: `fan upload (${w.channel}) is curated in YOUTUBE_SETS — that makes it sourceUrl/playbackUrl for a set`,
      });
    }
  }
  return issues;
}

/**
 * A curated set and the slug map must not disagree about a tracklist.
 *
 * Cues reach a YouTube set two ways: TRACKLIST_1001_BY_SOURCE_SLUG keyed by
 * video id, and the optional tracklist1001 field on the YOUTUBE_SETS entry.
 * Leaving the field off is fine — the map alone works — but pointing it at a
 * *different* array is the silent-split failure the duplicate-key audit exists
 * for, one layer up. Host-twin grouping keys on array identity, so a copy that
 * merely looks equal still breaks it.
 */
export function auditCuratedTracklistAgreement(
  curated: ReadonlyArray<{ video: string; tracklist1001?: unknown }> = YOUTUBE_SETS,
  map: Record<string, unknown> = TRACKLIST_1001_BY_SOURCE_SLUG,
): QcIssue[] {
  const issues: QcIssue[] = [];
  for (const v of curated) {
    const id = youtubeVideoId(v.video);
    if (!id) continue;
    const slug = `yt-${id}`;
    const wired = map[slug];
    if (!wired || !v.tracklist1001) continue;
    if (v.tracklist1001 !== wired) {
      issues.push({
        severity: "error",
        area: "curated-tracklist-agreement",
        slug,
        detail:
          "YOUTUBE_SETS tracklist1001 is a different array than the slug map — " +
          "one of them silently wins and host-twin grouping keys on identity",
      });
    }
  }
  return issues;
}

function auditRosterAndGraduates(): QcIssue[] {
  const issues: QcIssue[] = [];
  for (const a of ARTIST_ROSTER_CURATED) {
    if (isLeftoverHostName(a.name)) {
      issues.push({
        severity: "error",
        area: "roster",
        slug: slugify(a.name),
        detail: `leftover-host name ${a.name}`,
      });
    }
  }
  const candidates = loadJson<{
    candidates?: Array<{
      name: string;
      slug: string;
      status: string;
      score: number;
      youtubeHandle?: string | null;
      soundcloudPermalink?: string | null;
    }>;
  }>("data/artist-candidates.json", {});
  const curated = new Set(ARTIST_ROSTER_CURATED.map((a) => slugify(a.name)));
  const alreadyOnRoster = (candidates.candidates ?? []).filter(
    (c) =>
      c.status === "promoted" &&
      c.score >= 40 &&
      (c.youtubeHandle || c.soundcloudPermalink) &&
      curated.has(c.slug),
  );
  if (alreadyOnRoster.length) {
    issues.push({
      severity: "warn",
      area: "discovery",
      detail: `${alreadyOnRoster.length} promoted candidates are already on ARTIST_ROSTER_CURATED (graduate no-ops)`,
    });
  }
  return issues;
}

function auditOperatorSearchUrls(): QcIssue[] {
  const issues: QcIssue[] = [];
  for (const rel of [
    "data/crosscheck/next-captures.json",
    "data/crosscheck/held-relive-watch.json",
  ]) {
    const raw = loadJson<unknown>(rel, null);
    if (!raw) continue;
    const blob = JSON.stringify(raw);
    if (/google\.com\/search/i.test(blob)) {
      issues.push({
        severity: "error",
        area: "operator-reports",
        detail: `${rel} still has Google site:1001 search URLs — run npm run build:next-captures`,
      });
    }
    if (/1001tracklists\.com\/search\?q=/i.test(blob)) {
      issues.push({
        severity: "error",
        area: "operator-reports",
        detail: `${rel} still has GET /search?q= 404 URLs — run npm run build:next-captures`,
      });
    }
  }
  return issues;
}

export function dropJunkTrackIdPins(pins: TrackIdPin[]): {
  next: TrackIdPin[];
  dropped: string[];
} {
  const dropped: string[] = [];
  const next = pins.filter((p) => {
    if (isJunkTrackPin({ slug: p.slug })) {
      dropped.push(p.slug);
      return false;
    }
    return true;
  });
  return { next, dropped };
}

export function runStaticCatalogQc(): StaticCatalogQc {
  const pins = loadTrackIdPins();
  const issues = [
    ...auditPins(pins),
    ...auditKnownEvents(),
    ...auditEntityPins(),
    ...auditRosterAndGraduates(),
    ...auditOperatorSearchUrls(),
    ...auditWiredTracklistClocks(),
    ...auditTracklistSlugDuplicates(),
    ...auditFingerprintOnlyWatches(),
    ...auditCuratedTracklistAgreement(),
  ];
  const counts: Record<string, number> = {};
  for (const i of issues) {
    const key = `${i.severity}:${i.area}`;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return {
    generatedAt: new Date().toISOString(),
    pins: pins.length,
    events: Object.keys(KNOWN_EVENTS).length,
    issues,
    counts,
  };
}
