/**
 * Producer-pasted catalog IDs (Claude audit / MusicBrainz).
 * Fill-null Track.isrc + beatportUrl on verify-urls / Pages.
 * Never invents ISRCs. Beatport only when the URL is canonical /track/{slug}/{id}.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { PrismaClient } from "@prisma/client";
import {
  canonicalBeatportUrl,
  canonicalSpotifyUrl,
  isLikelyUnbuyable,
  normalizeIsrc,
  trackIdentityKey,
} from "../../trackMeta";
import { catalogQueryTitle, namesClose, normName, primaryArtist } from "./names";

export type TrackIdPin = {
  slug: string;
  isrc?: string;
  beatportUrl?: string;
  spotifyUrl?: string;
};

export type TrackIdPinProposal = {
  slug: string;
  artist: string;
  title: string;
  isrc?: string | null;
  beatportUrl?: string | null;
  spotifyUrl?: string | null;
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

export function mergeTrackIdPins(
  existing: TrackIdPin[],
  incoming: TrackIdPin[],
): TrackIdPin[] {
  const bySlug = new Map<string, TrackIdPin>();
  for (const pin of [...existing, ...incoming]) {
    const slug = pin.slug.trim();
    if (!slug) continue;
    const prev = bySlug.get(slug);
    const isrc = normalizeIsrc(prev?.isrc) || normalizeIsrc(pin.isrc);
    const beatport =
      canonicalBeatportUrl(prev?.beatportUrl) ||
      canonicalBeatportUrl(pin.beatportUrl);
    const spotify =
      canonicalSpotifyUrl(prev?.spotifyUrl) ||
      canonicalSpotifyUrl(pin.spotifyUrl);
    bySlug.set(slug, {
      slug,
      ...(isrc ? { isrc } : {}),
      ...(beatport ? { beatportUrl: beatport } : {}),
      ...(spotify ? { spotifyUrl: spotify } : {}),
    });
  }
  return [...bySlug.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}

export function saveTrackIdPins(pins: TrackIdPin[], path = PINS_PATH): void {
  writeFileSync(path, `${JSON.stringify(pins, null, 2)}\n`);
}

/** True when the pin already supplies every field this catalog row still needs. */
export function pinCoversNeed(
  pin: TrackIdPin | undefined,
  need: { wantIsrc?: boolean; wantBeatport?: boolean; wantSpotify?: boolean },
): boolean {
  if (!pin) return false;
  if (need.wantIsrc && !normalizeIsrc(pin.isrc)) return false;
  if (need.wantBeatport && !canonicalBeatportUrl(pin.beatportUrl)) return false;
  if (need.wantSpotify && !canonicalSpotifyUrl(pin.spotifyUrl)) return false;
  return true;
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
  // Hearthis-style cue sheet dumped as one Track.slug (00-00-05-30-…09-30-…).
  const cueBlocks = slug.match(/\d{1,2}-\d{2}-\d{1,2}-\d{2}/g) ?? [];
  if (cueBlocks.length >= 2) return true;
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
  const spotify = canonicalSpotifyUrl(row.spotifyUrl);
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
  if (!isrc && !beatport && !spotify) return { ok: false, reason: "empty" };
  return {
    ok: true,
    pin: {
      slug,
      ...(isrc ? { isrc } : {}),
      ...(beatport ? { beatportUrl: beatport } : {}),
      ...(spotify ? { spotifyUrl: spotify } : {}),
    },
    reason: "deezer isrc",
  };
}

/** Pin store links keyed by ISRC — same recording, different catalog slug. */
export function storeLinksByIsrc(pins: TrackIdPin[]): Map<
  string,
  { beatportUrl?: string; spotifyUrl?: string }
> {
  const out = new Map<string, { beatportUrl?: string; spotifyUrl?: string }>();
  for (const pin of pins) {
    const code = normalizeIsrc(pin.isrc);
    if (!code) continue;
    const beatport = canonicalBeatportUrl(pin.beatportUrl) || undefined;
    const spotify = canonicalSpotifyUrl(pin.spotifyUrl) || undefined;
    if (!beatport && !spotify) continue;
    const prev = out.get(code) ?? {};
    out.set(code, {
      beatportUrl: prev.beatportUrl || beatport,
      spotifyUrl: prev.spotifyUrl || spotify,
    });
  }
  return out;
}

export type StoreLinkSpreadRow = {
  id: string;
  isrc?: string | null;
  title: string;
  artistName: string;
  beatportUrl?: string | null;
  spotifyUrl?: string | null;
};

/** Copy canonical store URLs across the same ISRC or the same artist+title. */
export function planStoreLinkSpreads(
  rows: StoreLinkSpreadRow[],
): Array<{ id: string; beatportUrl?: string; spotifyUrl?: string }> {
  const byIsrcBp = new Map<string, string>();
  const byIsrcSp = new Map<string, string>();
  const byKeyBp = new Map<string, string>();
  const byKeySp = new Map<string, string>();
  for (const row of rows) {
    const code = normalizeIsrc(row.isrc);
    const bp = canonicalBeatportUrl(row.beatportUrl);
    const sp = canonicalSpotifyUrl(row.spotifyUrl);
    if (code && bp) byIsrcBp.set(code, byIsrcBp.get(code) || bp);
    if (code && sp) byIsrcSp.set(code, byIsrcSp.get(code) || sp);
    if (isLikelyUnbuyable(row.title, row.artistName)) continue;
    const key = trackIdentityKey(row.title, row.artistName);
    if (bp) byKeyBp.set(key, byKeyBp.get(key) || bp);
    if (sp) byKeySp.set(key, byKeySp.get(key) || sp);
  }
  const out: Array<{ id: string; beatportUrl?: string; spotifyUrl?: string }> =
    [];
  for (const row of rows) {
    if (isLikelyUnbuyable(row.title, row.artistName)) continue;
    const code = normalizeIsrc(row.isrc);
    const key = trackIdentityKey(row.title, row.artistName);
    const beatport =
      canonicalBeatportUrl(row.beatportUrl) ||
      (code ? byIsrcBp.get(code) : undefined) ||
      byKeyBp.get(key);
    const spotify =
      canonicalSpotifyUrl(row.spotifyUrl) ||
      (code ? byIsrcSp.get(code) : undefined) ||
      byKeySp.get(key);
    const data: { id: string; beatportUrl?: string; spotifyUrl?: string } = {
      id: row.id,
    };
    if (beatport && !canonicalBeatportUrl(row.beatportUrl)) {
      data.beatportUrl = beatport;
    }
    if (spotify && !canonicalSpotifyUrl(row.spotifyUrl)) {
      data.spotifyUrl = spotify;
    }
    if (data.beatportUrl || data.spotifyUrl) out.push(data);
  }
  return out;
}

/** Fill-null by Track.slug, then by shared ISRC. Never overwrites a stored store URL. */
export async function applyTrackIdPins(
  prisma: PrismaClient,
  pins = loadTrackIdPins(),
): Promise<{ matched: number; beatport: number; isrc: number; spotify: number }> {
  let matched = 0;
  let beatport = 0;
  let isrc = 0;
  let spotifyN = 0;
  for (const pin of pins) {
    const canon = pin.beatportUrl
      ? canonicalBeatportUrl(pin.beatportUrl)
      : null;
    const code = normalizeIsrc(pin.isrc);
    const spotifyPin = canonicalSpotifyUrl(pin.spotifyUrl);
    if (!canon && !code && !spotifyPin) continue;
    const row = await prisma.track.findUnique({
      where: { slug: pin.slug },
      select: { id: true, isrc: true, beatportUrl: true, spotifyUrl: true },
    });
    if (!row) continue;
    matched += 1;
    const data: { isrc?: string; beatportUrl?: string; spotifyUrl?: string } = {};
    if (code && !normalizeIsrc(row.isrc)) data.isrc = code;
    if (canon && !canonicalBeatportUrl(row.beatportUrl)) data.beatportUrl = canon;
    if (spotifyPin && !canonicalSpotifyUrl(row.spotifyUrl)) data.spotifyUrl = spotifyPin;
    if (!Object.keys(data).length) continue;
    await prisma.track.update({ where: { id: row.id }, data });
    if (data.beatportUrl) beatport += 1;
    if (data.isrc) isrc += 1;
    if (data.spotifyUrl) spotifyN += 1;
  }
  const byIsrc = storeLinksByIsrc(pins);
  const codes = [...byIsrc.keys()];
  for (let i = 0; i < codes.length; i += 200) {
    const batch = codes.slice(i, i + 200);
    const rows = await prisma.track.findMany({
      where: { isrc: { in: batch } },
      select: {
        id: true,
        isrc: true,
        title: true,
        artistName: true,
        beatportUrl: true,
        spotifyUrl: true,
      },
    });
    for (const row of rows) {
      const code = normalizeIsrc(row.isrc);
      if (!code) continue;
      const hit = byIsrc.get(code);
      if (!hit) continue;
      if (isLikelyUnbuyable(row.title, row.artistName)) continue;
      const data: { beatportUrl?: string; spotifyUrl?: string } = {};
      if (
        hit.beatportUrl &&
        !canonicalBeatportUrl(row.beatportUrl) &&
        beatportSlugMatchesTitle(hit.beatportUrl, row.title)
      ) {
        data.beatportUrl = hit.beatportUrl;
      }
      if (hit.spotifyUrl && !canonicalSpotifyUrl(row.spotifyUrl)) {
        data.spotifyUrl = hit.spotifyUrl;
      }
      if (!Object.keys(data).length) continue;
      matched += 1;
      await prisma.track.update({ where: { id: row.id }, data });
      if (data.beatportUrl) beatport += 1;
      if (data.spotifyUrl) spotifyN += 1;
    }
  }
  return { matched, beatport, isrc, spotify: spotifyN };
}

/** Copy store URLs already on one catalog row onto ISRC / name twins. */
export async function spreadCatalogStoreLinks(
  prisma: PrismaClient,
): Promise<{ beatport: number; spotify: number }> {
  const rows = await prisma.track.findMany({
    select: {
      id: true,
      isrc: true,
      title: true,
      artistName: true,
      beatportUrl: true,
      spotifyUrl: true,
    },
  });
  const plan = planStoreLinkSpreads(rows);
  let beatport = 0;
  let spotify = 0;
  for (const row of plan) {
    const data: { beatportUrl?: string; spotifyUrl?: string } = {};
    if (row.beatportUrl) data.beatportUrl = row.beatportUrl;
    if (row.spotifyUrl) data.spotifyUrl = row.spotifyUrl;
    if (!Object.keys(data).length) continue;
    await prisma.track.update({ where: { id: row.id }, data });
    if (data.beatportUrl) beatport += 1;
    if (data.spotifyUrl) spotify += 1;
  }
  return { beatport, spotify };
}
