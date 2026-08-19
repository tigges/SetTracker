/**
 * Producer-pasted catalog IDs (Claude audit / MusicBrainz).
 * Fill-null Track.isrc + beatportUrl on verify-urls / Pages.
 * Never invents ISRCs. Beatport only when the URL is canonical /track/{slug}/{id}.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { PrismaClient } from "@prisma/client";
import {
  canonicalBeatportUrl,
  normalizeIsrc,
} from "../../trackMeta";
import { catalogQueryTitle, namesClose, normName, primaryArtist } from "./names";

export type TrackIdPin = {
  slug: string;
  isrc?: string;
  beatportUrl?: string;
};

export type TrackIdPinProposal = {
  slug: string;
  artist: string;
  title: string;
  isrc?: string | null;
  beatportUrl?: string | null;
  confidence?: string | null;
  source?: string | null;
};

const PINS_PATH = join(process.cwd(), "data/track-id-pins.json");

export function loadTrackIdPins(): TrackIdPin[] {
  try {
    const raw = JSON.parse(readFileSync(PINS_PATH, "utf8")) as unknown;
    if (!Array.isArray(raw)) return [];
    return raw.filter((row): row is TrackIdPin => {
      if (!row || typeof row !== "object") return false;
      const slug = String((row as TrackIdPin).slug || "").trim();
      return slug.length > 0;
    });
  } catch {
    return [];
  }
}

const JUNK_SLUG = /^(youtube-|explore-countdown|in-laidback-luke|dj-electro-pop|djdefjam)/i;
const JUNK_TITLE =
  /\b(passes on sale|best songs remixes|laidback luke selects|group therapy|id #\d)\b/i;

export function isJunkTrackPin(row: {
  slug?: string | null;
  artist?: string | null;
  title?: string | null;
}): boolean {
  const slug = (row.slug ?? "").trim();
  const artist = (row.artist ?? "").trim();
  const title = (row.title ?? "").trim();
  if (!slug || JUNK_SLUG.test(slug)) return true;
  if (/^youtube$/i.test(artist)) return true;
  if (/^id$/i.test(title)) return true;
  if (JUNK_TITLE.test(`${artist} ${title}`)) return true;
  return false;
}

export function cleanQueryTitle(title: string): string {
  return catalogQueryTitle(title.replace(/https?:\/\/\S+/gi, " ")).trim();
}

function coreTitle(s: string): string {
  return normName(
    cleanQueryTitle(s)
      .replace(/&/g, " and ")
      .replace(/\+/g, " and ")
      .replace(/\b(feat\.?|ft\.?|featuring|with)\b.+$/i, ""),
  );
}

const SLUG_STOP = new Set([
  "the",
  "and",
  "feat",
  "ft",
  "featuring",
  "vs",
  "x",
  "mix",
  "extended",
  "original",
  "remix",
  "edit",
  "vip",
  "with",
  "of",
  "a",
  "for",
  "in",
  "on",
  "to",
  "my",
  "your",
  "me",
  "it",
  "is",
  "at",
  "pres",
]);

function meaningfulTokens(s: string): string[] {
  return normName(s)
    .split(" ")
    .filter((t) => t.length > 2 && !SLUG_STOP.has(t));
}

/** Catalog slug vs a live Deezer hit — used when Claude strips artist/title. */
export function slugMatchesLive(
  slug: string,
  live: { artist: string; title: string },
): boolean {
  const hay = normName(slug.replace(/-/g, " "));
  if (!hay) return false;
  const artistTokens = meaningfulTokens(primaryArtist(live.artist));
  const titleTokens = meaningfulTokens(cleanQueryTitle(live.title));
  if (artistTokens.length === 0 || titleTokens.length === 0) return false;
  const artistHits = artistTokens.filter((t) => hay.includes(t)).length;
  const titleHits = titleTokens.filter((t) => hay.includes(t)).length;
  return (
    artistHits / artistTokens.length >= 0.7 &&
    titleHits / titleTokens.length >= 0.7
  );
}

/** Beatport path slug vs catalog title — no HTML fetch. */
export function beatportSlugMatchesTitle(
  url: string,
  title: string,
): boolean {
  const canonical = canonicalBeatportUrl(url);
  if (!canonical) return false;
  let slug = "";
  try {
    slug = new URL(canonical).pathname.split("/")[2] ?? "";
  } catch {
    return false;
  }
  const want = coreTitle(title);
  const got = coreTitle(slug.replace(/-/g, " "));
  if (!want || !got) return false;
  if (want === got || want.includes(got) || got.includes(want)) return true;
  const compactWant = want.replace(/\s+/g, "");
  const compactGot = got.replace(/\s+/g, "");
  if (
    compactWant === compactGot ||
    compactWant.includes(compactGot) ||
    compactGot.includes(compactWant)
  ) {
    return true;
  }
  const tokens = got.split(" ").filter((w) => w.length > 2);
  if (tokens.length === 0) return false;
  const hits = tokens.filter((w) => want.includes(w)).length;
  return hits / tokens.length >= 0.7;
}

export function deezerConfirmsProposal(
  proposal: { artist: string; title: string; isrc?: string | null },
  live: { artist: string; title: string; isrc?: string | null } | null,
): boolean {
  if (!live) return false;
  const wantIsrc = normalizeIsrc(proposal.isrc);
  const liveIsrc = normalizeIsrc(live.isrc);
  if (!wantIsrc || !liveIsrc || wantIsrc !== liveIsrc) return false;
  const wantTitle = cleanQueryTitle(proposal.title);
  const liveTitle = cleanQueryTitle(live.title);
  if (!namesClose(wantTitle, liveTitle) && !namesClose(liveTitle, wantTitle)) {
    const compactWant = normName(wantTitle).replace(/\s+/g, "");
    const compactLive = normName(liveTitle).replace(/\s+/g, "");
    if (
      !compactWant ||
      !compactLive ||
      (!compactWant.includes(compactLive) && !compactLive.includes(compactWant))
    ) {
      return false;
    }
  }
  const primary = proposal.artist.split(/[,&]| b2b | x | ft\.? | feat\.?/i)[0]!.trim();
  return (
    namesClose(primary, live.artist) ||
    namesClose(proposal.artist, live.artist)
  );
}

export function evaluateTrackIdPin(
  row: TrackIdPinProposal,
  confirmed: { artist: string; title: string; isrc?: string | null } | null,
): { ok: boolean; pin?: TrackIdPin; reason: string } {
  if (isJunkTrackPin(row)) return { ok: false, reason: "junk row" };
  const slug = row.slug.trim();
  const isrc = normalizeIsrc(row.isrc);
  const beatport = canonicalBeatportUrl(row.beatportUrl);
  if (beatport && row.title && !beatportSlugMatchesTitle(beatport, row.title)) {
    return { ok: false, reason: "beatport slug mismatch" };
  }
  const named = deezerConfirmsProposal(row, confirmed);
  const slugged =
    Boolean(confirmed) &&
    Boolean(isrc) &&
    normalizeIsrc(confirmed?.isrc) === isrc &&
    slugMatchesLive(slug, confirmed!);
  if (!named && !slugged) {
    return { ok: false, reason: "not confirmed" };
  }
  if (!isrc && !beatport) return { ok: false, reason: "empty" };
  return {
    ok: true,
    pin: {
      slug,
      ...(isrc ? { isrc } : {}),
      ...(beatport ? { beatportUrl: beatport } : {}),
    },
    reason: "deezer isrc",
  };
}

/** Fill-null by Track.slug. Never overwrites an existing ISRC or Beatport URL. */
export async function applyTrackIdPins(
  prisma: PrismaClient,
  pins = loadTrackIdPins(),
): Promise<{ matched: number; beatport: number; isrc: number }> {
  let matched = 0;
  let beatport = 0;
  let isrc = 0;
  for (const pin of pins) {
    const canon = pin.beatportUrl
      ? canonicalBeatportUrl(pin.beatportUrl)
      : null;
    const code = normalizeIsrc(pin.isrc);
    if (!canon && !code) continue;
    const row = await prisma.track.findUnique({
      where: { slug: pin.slug },
      select: { id: true, isrc: true, beatportUrl: true },
    });
    if (!row) continue;
    matched += 1;
    const data: { isrc?: string; beatportUrl?: string } = {};
    if (code && !normalizeIsrc(row.isrc)) data.isrc = code;
    if (canon && !canonicalBeatportUrl(row.beatportUrl)) data.beatportUrl = canon;
    if (!Object.keys(data).length) continue;
    await prisma.track.update({ where: { id: row.id }, data });
    if (data.beatportUrl) beatport += 1;
    if (data.isrc) isrc += 1;
  }
  return { matched, beatport, isrc };
}
