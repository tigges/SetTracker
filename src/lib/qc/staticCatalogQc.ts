/**
 * File-side catalog QC — no Prisma, no Beatport/1001 crawl.
 * Used by `npm run qc` and unit tests.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { isLeftoverHostName } from "../artistName";
import { KNOWN_EVENTS } from "../ingest/events";
import type { EntityCompletePin } from "../ingest/entityCompletePins";
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
    if (/google\.com\/search/i.test(JSON.stringify(raw))) {
      issues.push({
        severity: "error",
        area: "operator-reports",
        detail: `${rel} still has Google site:1001 search URLs — run npm run build:next-captures`,
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
