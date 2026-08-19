import type { PrismaClient } from "@prisma/client";
import { sanitizeArtistName } from "../artistName";
import { isNonCatalogSet } from "../setBrowse";
import {
  isBrandHostArtist,
  isBrandHostSlug,
  isBrandSeriesSlug,
} from "../brandHosts";
import { playbackUrlFromSource } from "../playback";
import { djSocialsFromKnown, labelSocials } from "../social";
import { ARTIST_ROSTER } from "./roster";
import { normalizeIsrc, parseTrackTitle } from "../trackMeta";
import { runCatalogScSocials } from "./discovery/catalogScSocials";
import { runCatalogYtSocials } from "./discovery/catalogYtSocials";
import { runCrosslinkDiscovery, type HandleReport } from "./discovery/crosslink";
import { runDiscovery, type DiscoveryStats } from "./discovery/run";
import { hashRawSetContent } from "./hash";
import { applyTracklist1001Seed } from "./tracklists1001/seeds";
import { fetchTrackDetail, sleep as htSleep } from "./hearthis/client";
import {
  preferPlaybackUrl,
  preferredExternalPlaybackFromText,
  resolveSoundCloudTrackUrl,
} from "./hearthis/playback";
import { adapters as defaultAdapters } from "./sources";
import { ensureGenre, normalizeGenre } from "../genre";
import { rosterGenreForArtist } from "./roster";
import { allocateTrackSlug, trackSlugBase } from "../tracks/slug";
import { slugify, type RawArtist, type RawPlay, type RawSet, type SourceAdapter } from "./types";
import { canonicalDjSlug } from "./djSlugAliases";
import { curatedEventSocialPatch } from "./eventSocials";
import { eventSocialPayload, KNOWN_EVENTS, resolveEvent } from "./events";
import { inferFilmSeriesName } from "./filmSeries";
import { classifyJunkDj, inferJunkHostEvent } from "./junkDj";
import { previousSlugsFor } from "./sourceRemaps";
import {
  festivalDropBoostActive,
  matchEditionSeed,
  recentlyEndedEditions,
} from "./festivalDrops";
import {
  backfillSetEditions,
  ensureFestivalEditions,
} from "./setEditions";
import { ensureVenueCalendarNights } from "./discovery/venueCalendars";
import { scanEntityUrls } from "./scanEntityUrls";
import { verifyStoredSocialUrls } from "./verifyUrls";

/** Orphan event slugs that should collapse onto a known festival/club. */
const EVENT_SLUG_REMAP: Record<string, string> = {
  "tomorrowland-belgium": "Tomorrowland",
  "tomorrowland-belgium-2026": "Tomorrowland",
  "edc-las-vegas": "EDC Las Vegas",
  "ultra-music-festival": "Ultra Music Festival",
};

/**
 * Prisma's query engine JSON-encodes string args — incomplete `\x` / `\u`
 * sequences in tracklist text crash with "unexpected end of hex escape".
 */
function sanitizeDbText(
  value: string | null | undefined,
  fallback = "",
): string {
  if (value == null) return fallback;
  let t = String(value)
    .replace(/\u0000/g, "")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F]/g, " ");
  // Drop lone/incomplete escapes that break Prisma JSON encoding.
  t = t.replace(/\\x(?![0-9a-fA-F]{2})/gi, "");
  t = t.replace(/\\u(?![0-9a-fA-F]{4})/gi, "");
  t = t.replace(
    /\\(?![\\/"bfnrt]|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2})/gi,
    "",
  );
  t = t.trim();
  return t || fallback;
}

function parseHearthisPath(
  url: string,
): { user: string; track: string } | null {
  try {
    const u = new URL(url);
    if (!/(^|\.)hearthis\.at$/i.test(u.hostname)) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (!parts[0] || !parts[1] || parts[0] === "embed") return null;
    return { user: parts[0], track: parts[1] };
  } catch {
    return null;
  }
}

const ACCENT_PALETTE = [
  "#ff7a45", "#4fb0e0", "#ff7096", "#b0d24e", "#ffd24d",
  "#5cc7d6", "#c56cff", "#ff6f5e", "#8a7cff", "#45c7e0",
];

function pickAccent(seed: string): string {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return ACCENT_PALETTE[h % ACCENT_PALETTE.length];
}

/** Canonical display spelling — never store Hörger / Hørger. */
function normalizeArtistName(name: string): string {
  return name.replace(/H[øöØÖ]rger/g, "Horger");
}

export type IngestStats = {
  scannedSets: number;
  newSets: number;
  refreshedSets: number;
  skippedSets: number;
  newDjs: number;
  newTracks: number;
  bySource: Record<string, { new: number; refreshed: number; skipped: number }>;
  discovery?: DiscoveryStats;
  crosslink?: {
    needsAttention: number;
    ok: number;
    hits: number;
  };
  /** Sets with ≥1 identified/community play */
  setsWithTracklist: number;
  totalPlaysIngested: number;
};

type CommunityKeep = {
  position: number;
  timestamp: number;
  trackTitle: string;
  artistName: string;
  idLabel: string | null;
  note: string | null;
};

export async function runIngest(
  prisma: PrismaClient,
  adapters: SourceAdapter[] = defaultAdapters,
): Promise<IngestStats> {
  const stats: IngestStats = {
    scannedSets: 0,
    newSets: 0,
    refreshedSets: 0,
    skippedSets: 0,
    newDjs: 0,
    newTracks: 0,
    bySource: {},
    setsWithTracklist: 0,
    totalPlaysIngested: 0,
  };

  const collaboratorMentions: Array<{
    name: string;
    sourceSlug: string;
    weight?: number;
  }> = [];

  const djCache = new Map<string, string>();
  const labelCache = new Map<string, string>();

  async function upsertDj(raw: RawArtist): Promise<string | null> {
    const name = sanitizeArtistName(raw.name);
    if (!name) return null;
    // Prefer curated RawArtist.slug (apostrophe brands like Gentlemen's Groove),
    // otherwise derive from the sanitized display name. Fold known aliases
    // (gentlemen-s-groove → gentlemens-groove) onto the curated profile.
    const slug = canonicalDjSlug(raw.slug?.trim() || slugify(name));
    // Brand hosts belong on Series/Event — never create or refresh Dj rows.
    if (isBrandHostSlug(slug) || isBrandHostArtist({ slug, name })) {
      return null;
    }
    if (djCache.has(slug)) return djCache.get(slug)!;
    const roster = ARTIST_ROSTER.find(
      (a) =>
        a.name === name ||
        a.name === raw.name ||
        slugify(a.name) === slug ||
        slugify(a.name) === slugify(name) ||
        slugify(a.name.replace(/[''′]/g, "")) === slug,
    );
    const socials = djSocialsFromKnown({
      name,
      soundcloudPermalink: roster?.soundcloud?.permalink,
      youtubeHandle: roster?.youtube?.handle || raw.youtubeHandle,
      socials: [...(roster?.socials ?? []), ...(raw.socialLinks ?? [])],
      website: roster?.website,
    });
    const displayName = roster?.name ?? name;
    const existing = await prisma.dj.findUnique({ where: { slug } });
    if (existing) {
      const data: Record<string, unknown> = {};
      if (existing.name !== displayName) data.name = displayName;
      if (roster) {
        data.accent = roster.accent || existing.accent;
        data.homeCity = roster.homeCity ?? existing.homeCity;
        Object.assign(data, socials);
      } else {
        // Description-harvested socials: fill-null only (never clobber pins).
        if (!existing.youtube && socials.youtube) data.youtube = socials.youtube;
        if (!existing.instagram && socials.instagram) {
          data.instagram = socials.instagram;
        }
        if (!existing.twitter && socials.twitter) data.twitter = socials.twitter;
        if (!existing.website && socials.website) data.website = socials.website;
        if (!existing.soundcloud && socials.soundcloud) {
          data.soundcloud = socials.soundcloud;
        }
      }
      // Fill missing portraits from source-native avatars (hearthis / SC).
      if (!existing.imageUrl && raw.imageUrl) data.imageUrl = raw.imageUrl;
      if (Object.keys(data).length) {
        await prisma.dj.update({ where: { id: existing.id }, data });
      }
      djCache.set(slug, existing.id);
      return existing.id;
    }
    const created = await prisma.dj.create({
      data: {
        slug,
        name: displayName,
        homeCity: roster?.homeCity ?? raw.homeCity ?? null,
        bio: raw.bio ?? null,
        accent: roster?.accent ?? raw.accent ?? pickAccent(slug),
        imageUrl: raw.imageUrl ?? null,
        ...socials,
      },
    });
    stats.newDjs += 1;
    djCache.set(slug, created.id);
    return created.id;
  }

  async function upsertLabel(name?: string): Promise<string | null> {
    if (!name) return null;
    const slug = slugify(name);
    if (labelCache.has(slug)) return labelCache.get(slug)!;
    const socials = labelSocials(name);
    const existing = await prisma.label.findUnique({ where: { slug } });
    if (existing) {
      // Refresh curated label URLs (e.g. Divided Souls) without inventing guesses.
      if (socials.website || socials.soundcloud || socials.instagram) {
        await prisma.label.update({
          where: { id: existing.id },
          data: {
            website: socials.website ?? existing.website,
            soundcloud: socials.soundcloud ?? existing.soundcloud,
            instagram: socials.instagram ?? existing.instagram,
          },
        });
      }
      labelCache.set(slug, existing.id);
      return existing.id;
    }
    const rec = await prisma.label.create({
      data: { slug, name, ...socials },
    });
    labelCache.set(slug, rec.id);
    return rec.id;
  }

  async function upsertTrack(play: {
    title: string;
    artistName: string;
    label?: string;
    bpm?: number;
    musicalKey?: string;
    genre?: string;
    durationSec?: number;
    mixName?: string;
    remixerName?: string;
    beatportUrl?: string;
    isrc?: string;
  }): Promise<string> {
    const artistName = normalizeArtistName(play.artistName);
    const isrc = normalizeIsrc(play.isrc);
    const parsed = parseTrackTitle(play.title);
    const mixName = play.mixName ?? parsed.mixName;
    const remixerName = play.remixerName
      ? normalizeArtistName(play.remixerName)
      : parsed.remixerName
        ? normalizeArtistName(parsed.remixerName)
        : undefined;
    const existing = await prisma.track.findFirst({
      where: { title: play.title, artistName },
    });
    if (existing) {
      // Fill sparse meta without overwriting known values.
      const data: Record<string, unknown> = {};
      if (existing.artistName !== artistName) data.artistName = artistName;
      if (mixName && !existing.mixName) data.mixName = mixName;
      if (remixerName && !existing.remixerName) data.remixerName = remixerName;
      if (play.bpm != null && existing.bpm == null) data.bpm = play.bpm;
      if (play.musicalKey && !existing.musicalKey) data.musicalKey = play.musicalKey;
      if (!existing.genre) {
        data.genre = ensureGenre(play.genre);
      }
      if (play.durationSec != null && existing.durationSec == null) {
        data.durationSec = play.durationSec;
      }
      if (play.beatportUrl && !existing.beatportUrl) data.beatportUrl = play.beatportUrl;
      if (isrc && !existing.isrc) data.isrc = isrc;
      if (play.label && !existing.labelId) {
        const labelId = await upsertLabel(play.label);
        if (labelId) data.labelId = labelId;
      }
      if (!existing.slug || existing.slug === existing.id) {
        data.slug = await allocateTrackSlug(
          artistName,
          play.title,
          async (candidate) => {
            const hit = await prisma.track.findUnique({
              where: { slug: candidate },
              select: { id: true },
            });
            return !!hit && hit.id !== existing.id;
          },
          trackSlugBase(artistName, play.title),
        );
      }
      if (Object.keys(data).length > 0) {
        await prisma.track.update({ where: { id: existing.id }, data });
      }
      return existing.id;
    }
    const labelId = await upsertLabel(play.label);
    const slug = await allocateTrackSlug(
      artistName,
      play.title,
      async (candidate) => {
        const hit = await prisma.track.findUnique({
          where: { slug: candidate },
          select: { id: true },
        });
        return !!hit;
      },
    );
    const created = await prisma.track.create({
      data: {
        slug,
        title: play.title,
        artistName,
        labelId,
        mixName,
        remixerName: remixerName ?? null,
        bpm: play.bpm ?? null,
        musicalKey: play.musicalKey ?? null,
        genre: ensureGenre(play.genre),
        durationSec: play.durationSec ?? null,
        beatportUrl: play.beatportUrl ?? null,
        isrc,
      },
    });
    stats.newTracks += 1;
    return created.id;
  }

  async function upsertEvent(
    name?: string,
    kind?: string,
    location?: string,
  ): Promise<string | null> {
    if (!name) return null;
    const canon = resolveEvent(name, { kind, location });
    const socials = eventSocialPayload(canon);
    const curated = KNOWN_EVENTS[canon.slug];
    const existing = await prisma.event.findUnique({
      where: { slug: canon.slug },
    });
    if (existing) {
      await prisma.event.update({
        where: { id: existing.id },
        data: {
          name: existing.name || canon.name,
          // Prefer canonical festival/club kind over orphan "event".
          kind:
            canon.kind && canon.kind !== "event"
              ? canon.kind
              : existing.kind || canon.kind,
          location: existing.location ?? canon.location ?? null,
          ...(curated
            ? curatedEventSocialPatch(curated)
            : {
                website: existing.website ?? socials.website ?? null,
                soundcloud: existing.soundcloud ?? socials.soundcloud ?? null,
                instagram: existing.instagram ?? socials.instagram ?? null,
                twitter: existing.twitter ?? socials.twitter ?? null,
              }),
        },
      });
      return existing.id;
    }
    const created = await prisma.event.create({
      data: {
        slug: canon.slug,
        name: canon.name,
        kind: canon.kind,
        location: canon.location ?? null,
        website: socials.website ?? null,
        soundcloud: socials.soundcloud ?? null,
        instagram: socials.instagram ?? null,
        twitter: socials.twitter ?? null,
      },
    });
    return created.id;
  }

  /** Ensure curated EventEdition rows exist; return id for a set title. */
  async function upsertEditionForSet(
    eventId: string | null,
    eventSlug: string | null | undefined,
    title: string,
    publishedAt: Date,
  ): Promise<{ editionId: string | null; performedAt: Date | null }> {
    if (!eventId || !eventSlug) {
      return { editionId: null, performedAt: null };
    }
    const seed = matchEditionSeed(eventSlug, title, publishedAt);
    if (!seed) return { editionId: null, performedAt: null };

    const startsAt = new Date(`${seed.startsAt}T12:00:00Z`);
    const endsAt = new Date(`${seed.endsAt}T23:59:59Z`);
    const existing = await prisma.eventEdition.findUnique({
      where: { slug: seed.slug },
    });
    if (existing) {
      return {
        editionId: existing.id,
        performedAt: existing.endsAt ?? endsAt,
      };
    }
    const created = await prisma.eventEdition.create({
      data: {
        slug: seed.slug,
        eventId,
        year: seed.year,
        label: seed.label ?? null,
        startsAt,
        endsAt,
      },
    });
    return { editionId: created.id, performedAt: endsAt };
  }

  async function reportFestivalGaps(): Promise<void> {
    const recent = recentlyEndedEditions(21);
    for (const ed of recent) {
      const row = await prisma.eventEdition.findUnique({
        where: { slug: ed.slug },
        include: { _count: { select: { sets: true } }, event: true },
      });
      const count = row?._count.sets ?? 0;
      if (count < 8) {
        console.warn(
          `[ingest] festival gap: ${ed.slug} has ${count} sets after ${ed.endsAt} — check official playback playlist / SC / channel poll`,
        );
      } else {
        console.log(
          `[ingest] festival coverage: ${ed.slug} → ${count} sets`,
        );
      }
    }
  }

  async function upsertSeries(
    name: string | undefined,
    djId?: string | null,
  ): Promise<string | null> {
    if (!name) return null;
    const slug = slugify(name);
    // Brand shows (Night Owl, Metronome, …) stay hostless — guests vary per ep.
    const hostId = isBrandSeriesSlug(slug) ? null : djId ?? null;
    const existing = await prisma.series.findUnique({ where: { slug } });
    if (existing) {
      if (isBrandSeriesSlug(slug) && existing.djId) {
        await prisma.series.update({
          where: { id: existing.id },
          data: { djId: null },
        });
      } else if (!existing.djId && hostId) {
        // Soft-fill host when a real DJ later claims an unhosted artist series.
        await prisma.series.update({
          where: { id: existing.id },
          data: { djId: hostId },
        });
      }
      return existing.id;
    }
    const created = await prisma.series.create({
      data: { slug, name, ...(hostId ? { djId: hostId } : {}) },
    });
    return created.id;
  }

  async function writePlays(
    setId: string,
    plays: RawPlay[],
    setGenre?: string | null,
  ): Promise<void> {
    for (const p of plays) {
      const base = {
        setId,
        position: p.position,
        timestamp: p.timestamp,
        provenance: p.provenance,
        idStatus: p.idStatus,
      };
      // Inherit set genre onto tracks when the source has no per-track genre.
      const genre = ensureGenre(p.genre, setGenre);
      if (p.idStatus === "identified" && p.trackTitle && p.artistName) {
        const trackId = await upsertTrack({
          title: p.trackTitle,
          artistName: p.artistName,
          label: p.label,
          bpm: p.bpm,
          musicalKey: p.musicalKey,
          genre,
          durationSec: p.durationSec,
          mixName: p.mixName,
          remixerName: p.remixerName,
          beatportUrl: p.beatportUrl,
          isrc: p.isrc,
        });
        await prisma.played.create({ data: { ...base, trackId } });
      } else if (
        p.idStatus === "community_resolved" &&
        p.trackTitle &&
        p.artistName
      ) {
        const trackId = await upsertTrack({
          title: p.trackTitle,
          artistName: p.artistName,
          label: p.label,
          bpm: p.bpm,
          musicalKey: p.musicalKey,
          genre,
          durationSec: p.durationSec,
          mixName: p.mixName,
          remixerName: p.remixerName,
          beatportUrl: p.beatportUrl,
          isrc: p.isrc,
        });
        const idLabel = sanitizeDbText(p.idLabel, "ID - ID");
        const idTrack = await prisma.idTrack.create({
          data: {
            label: idLabel,
            status: "community_resolved",
            resolvedTrackId: trackId,
            note: sanitizeDbText(p.note) || null,
          },
        });
        await prisma.played.create({
          data: {
            ...base,
            trackId,
            idTrackId: idTrack.id,
            rawText: sanitizeDbText(p.idLabel ?? p.rawText) || null,
          },
        });
      } else if (p.idStatus === "unresolved_id") {
        const idTrack = await prisma.idTrack.create({
          data: {
            label: sanitizeDbText(p.idLabel, "ID - ID"),
            suspectedArtist: sanitizeDbText(p.suspectedArtist) || null,
            note: sanitizeDbText(p.note) || null,
            status: "unresolved",
          },
        });
        await prisma.played.create({
          data: {
            ...base,
            idTrackId: idTrack.id,
            rawText: sanitizeDbText(p.idLabel ?? p.rawText) || null,
          },
        });
      } else {
        await prisma.played.create({
          data: {
            ...base,
            idStatus: "unparsed",
            rawText: sanitizeDbText(p.rawText) || null,
          },
        });
      }
    }
  }

  async function snapshotCommunityKeeps(setId: string): Promise<CommunityKeep[]> {
    const rows = await prisma.played.findMany({
      where: { setId, idStatus: "community_resolved" },
      include: { track: true, idTrack: true },
    });
    return rows
      .filter((r) => r.track)
      .map((r) => ({
        position: r.position,
        timestamp: r.timestamp,
        trackTitle: r.track!.title,
        artistName: r.track!.artistName,
        idLabel: r.idTrack?.label ?? r.rawText,
        note: r.idTrack?.note ?? null,
      }));
  }

  function mergeCommunityKeeps(
    sourcePlays: RawPlay[],
    keeps: CommunityKeep[],
  ): RawPlay[] {
    if (keeps.length === 0) return sourcePlays;
    const byPosition = new Map(sourcePlays.map((p) => [p.position, p]));
    for (const k of keeps) {
      byPosition.set(k.position, {
        position: k.position,
        timestamp: k.timestamp,
        idStatus: "community_resolved",
        provenance: "community",
        trackTitle: k.trackTitle,
        artistName: k.artistName,
        idLabel: k.idLabel ?? `${k.artistName} - ID`,
        note: k.note ?? undefined,
        rawText: k.idLabel ?? undefined,
      });
    }
    return [...byPosition.values()]
      .sort((a, b) => a.position - b.position || a.timestamp - b.timestamp)
      .map((p, i) => ({ ...p, position: i + 1 }));
  }

  async function replacePlays(
    setId: string,
    plays: RawPlay[],
    setGenre?: string | null,
  ): Promise<void> {
    const oldPlays = await prisma.played.findMany({
      where: { setId },
      select: { idTrackId: true },
    });
    await prisma.played.deleteMany({ where: { setId } });
    const orphanIds = [
      ...new Set(oldPlays.map((p) => p.idTrackId).filter(Boolean) as string[]),
    ];
    for (const id of orphanIds) {
      const still = await prisma.played.count({ where: { idTrackId: id } });
      if (still === 0) await prisma.idTrack.delete({ where: { id } }).catch(() => {});
    }
    await writePlays(setId, plays, setGenre);
  }

  async function syncSetArtists(
    setId: string,
    primaryDjId: string | null,
    collaboratorIds: string[],
  ): Promise<void> {
    const desired = new Map<string, boolean>();
    if (primaryDjId) desired.set(primaryDjId, true);
    for (const id of collaboratorIds) {
      if (primaryDjId && id === primaryDjId) continue;
      if (!desired.has(id)) desired.set(id, false);
    }

    const existing = await prisma.setArtist.findMany({ where: { setId } });
    const existingByDj = new Map(existing.map((r) => [r.djId, r]));

    for (const [djId, isPrimary] of desired) {
      const row = existingByDj.get(djId);
      if (!row) {
        await prisma.setArtist.create({ data: { setId, djId, isPrimary } });
      } else if (row.isPrimary !== isPrimary) {
        await prisma.setArtist.update({
          where: { id: row.id },
          data: { isPrimary },
        });
      }
      existingByDj.delete(djId);
    }
    for (const stale of existingByDj.values()) {
      await prisma.setArtist.delete({ where: { id: stale.id } });
    }
  }

  function noteCollaborators(raw: RawSet): void {
    for (const c of raw.collaborators ?? []) {
      collaboratorMentions.push({
        name: c.name,
        sourceSlug: raw.sourceSlug,
        weight: 28,
      });
    }
  }

  async function ingestSet(raw: RawSet): Promise<void> {
    stats.scannedSets += 1;
    const seeded = applyTracklist1001Seed(raw.sourceSlug, raw.plays);
    if (seeded !== raw.plays) {
      raw.plays = seeded;
      raw.sourceHash = hashRawSetContent(raw);
    }
    let sourceHash = raw.sourceHash ?? hashRawSetContent(raw);
    const existing =
      (await prisma.set.findUnique({
        where: { slug: raw.sourceSlug },
      })) ??
      (await (async () => {
        for (const prev of previousSlugsFor(raw.sourceSlug)) {
          const row = await prisma.set.findUnique({ where: { slug: prev } });
          if (row) return row;
        }
        return null;
      })());
    if (isNonCatalogSet({ title: raw.title, durationSec: raw.durationSec })) {
      if (existing) {
        await prisma.played.deleteMany({ where: { setId: existing.id } });
        await prisma.setArtist.deleteMany({ where: { setId: existing.id } });
        await prisma.set.delete({ where: { id: existing.id } });
      }
      stats.skippedSets += 1;
      return;
    }

    const playSignal = raw.plays.filter(
      (p) => p.idStatus === "identified" || p.idStatus === "community_resolved",
    ).length;
    if (playSignal > 0) {
      stats.setsWithTracklist += 1;
      stats.totalPlaysIngested += raw.plays.length;
    }
    noteCollaborators(raw);

    // Brand hosts are not Dj primaries — series/event carry the host credit.
    const primaryDjId = raw.primaryArtist
      ? await upsertDj(raw.primaryArtist)
      : null;
    const collaboratorIds: string[] = [];
    for (const c of raw.collaborators ?? []) {
      const id = await upsertDj(c);
      if (id) collaboratorIds.push(id);
    }

    let eventId = await upsertEvent(
      raw.eventName,
      raw.eventKind,
      raw.eventLocation,
    );
    if (!eventId && raw.primaryArtist) {
      const hostKind = classifyJunkDj(
        raw.primaryArtist.name,
        raw.primaryArtist.slug ?? "",
      );
      if (hostKind === "radio" || hostKind === "stage") {
        const inferred = inferJunkHostEvent(raw.primaryArtist.name, [
          raw.title,
          raw.eventName ?? "",
        ]);
        if (inferred) {
          eventId = await upsertEvent(
            inferred.name,
            inferred.kind,
            inferred.location,
          );
        }
      }
    }
    const eventSlug = raw.eventName
      ? resolveEvent(raw.eventName, {
          kind: raw.eventKind,
          location: raw.eventLocation,
        }).slug
      : eventId && raw.primaryArtist
        ? inferJunkHostEvent(raw.primaryArtist.name, [raw.title])?.slug ?? null
        : null;
    const { editionId, performedAt } = await upsertEditionForSet(
      eventId,
      eventSlug,
      raw.title,
      raw.publishedAt,
    );
    const seriesId = await upsertSeries(
      raw.seriesName ?? inferFilmSeriesName(raw.title),
      primaryDjId,
    );

    // Need a performing DJ, series, or event — otherwise nothing to attribute.
    if (!primaryDjId && !seriesId && !eventId) {
      stats.skippedSets += 1;
      return;
    }

    const setGenre = ensureGenre(
      raw.genre,
      raw.primaryArtist
        ? rosterGenreForArtist(raw.primaryArtist.name)
        : undefined,
      existing?.genre,
    );

    if (existing) {
      if (existing.sourceHash && existing.sourceHash === sourceHash) {
        const seeded = applyTracklist1001Seed(raw.sourceSlug, raw.plays);
        const seed1001 = seeded.filter((p) => p.provenance === "1001tl").length;
        if (seed1001 >= 5) {
          const stored1001 = await prisma.played.count({
            where: { setId: existing.id, provenance: "1001tl" },
          });
          if (stored1001 < seed1001) {
            raw.plays = seeded;
            raw.sourceHash = hashRawSetContent(raw);
            sourceHash = raw.sourceHash;
          }
        }
      }
      if (existing.sourceHash && existing.sourceHash === sourceHash) {
        // Still refresh artist linkage (b2b backfill) even when tracklist is unchanged.
        await syncSetArtists(existing.id, primaryDjId, collaboratorIds);
        const softLink: {
          eventId?: string;
          seriesId?: string;
          editionId?: string;
          performedAt?: Date;
        } = {};
        if (!existing.eventId && eventId) softLink.eventId = eventId;
        if (!existing.seriesId && seriesId) softLink.seriesId = seriesId;
        if (!existing.editionId && editionId) softLink.editionId = editionId;
        if (!existing.performedAt && performedAt) {
          softLink.performedAt = performedAt;
        }
        if (Object.keys(softLink).length) {
          await prisma.set.update({
            where: { id: existing.id },
            data: softLink,
          });
        }
        // Soft-normalize / fill genre without re-pulling the tracklist.
        // Never wipe a good genre with null; prefer incoming only when parseable.
        const softGenre = ensureGenre(
          normalizeGenre(raw.genre) ?? undefined,
          existing.genre,
          raw.primaryArtist
            ? rosterGenreForArtist(raw.primaryArtist.name)
            : undefined,
        );
        const softPlayback = preferPlaybackUrl(
          raw.playbackUrl,
          existing.playbackUrl,
        );
        const softPatch: {
          slug?: string;
          genre?: string | null;
          type?: string;
          playbackUrl?: string | null;
          sourceUrl?: string | null;
        } = {};
        if (existing.slug !== raw.sourceSlug) {
          softPatch.slug = raw.sourceSlug;
          if (raw.sourceUrl) softPatch.sourceUrl = raw.sourceUrl;
        }
        if ((existing.genre ?? null) !== softGenre) softPatch.genre = softGenre;
        // Allow type/playback upgrades on hash skip (e.g. hearthis "soundcloud" → "mix",
        // or hearthis embed → linked SC/YT audio) without rewriting the tracklist.
        if (raw.type && existing.type !== raw.type) softPatch.type = raw.type;
        if (softPlayback && softPlayback !== existing.playbackUrl) {
          softPatch.playbackUrl = softPlayback;
        }
        if (Object.keys(softPatch).length) {
          await prisma.set.update({
            where: { id: existing.id },
            data: softPatch,
          });
        }
        stats.skippedSets += 1;
        return;
      }

      // Refresh tracklist; preserve prior community resolutions by position.
      const keeps = await snapshotCommunityKeeps(existing.id);
      const plays = mergeCommunityKeeps(raw.plays, keeps);

      await prisma.set.update({
        where: { id: existing.id },
        data: {
          ...(existing.slug !== raw.sourceSlug ? { slug: raw.sourceSlug } : {}),
          title: raw.title,
          type: raw.type,
          genre: setGenre,
          publishedAt: raw.publishedAt,
          durationSec: raw.durationSec,
          sourceName: raw.sourceName,
          sourceUrl: raw.sourceUrl ?? null,
          cover: raw.cover,
          sourceHash,
          ...(() => {
            const derived = !existing.playbackUrl
              ? playbackUrlFromSource(raw.sourceName, raw.sourceUrl)
              : null;
            const next = preferPlaybackUrl(
              raw.playbackUrl ?? derived,
              existing.playbackUrl,
            );
            return next ? { playbackUrl: next } : {};
          })(),
          ...(raw.imageUrl && !existing.imageUrl
            ? { imageUrl: raw.imageUrl }
            : {}),
        },
      });
      await syncSetArtists(existing.id, primaryDjId, collaboratorIds);
      const refreshMeta: {
        eventId?: string;
        seriesId?: string;
        editionId?: string;
        performedAt?: Date;
      } = {};
      if (!existing.eventId && eventId) refreshMeta.eventId = eventId;
      if (!existing.seriesId && seriesId) refreshMeta.seriesId = seriesId;
      if (!existing.editionId && editionId) refreshMeta.editionId = editionId;
      if (!existing.performedAt && performedAt) {
        refreshMeta.performedAt = performedAt;
      }
      if (Object.keys(refreshMeta).length) {
        await prisma.set.update({
          where: { id: existing.id },
          data: refreshMeta,
        });
      }
      await replacePlays(existing.id, plays, setGenre);
      stats.refreshedSets += 1;
      console.log(
        `[ingest] refresh ${raw.sourceSlug}` +
          (keeps.length ? ` (kept ${keeps.length} community rows)` : ""),
      );
      return;
    }

    const set = await prisma.set.create({
      data: {
        slug: raw.sourceSlug,
        title: raw.title,
        type: raw.type,
        genre: setGenre,
        publishedAt: raw.publishedAt,
        durationSec: raw.durationSec,
        sourceName: raw.sourceName,
        sourceUrl: raw.sourceUrl ?? null,
        playbackUrl:
          raw.playbackUrl ??
          playbackUrlFromSource(raw.sourceName, raw.sourceUrl) ??
          null,
        cover: raw.cover,
        imageUrl: raw.imageUrl ?? null,
        sourceHash,
        eventId,
        editionId,
        performedAt,
        seriesId,
      },
    });

    await syncSetArtists(set.id, primaryDjId, collaboratorIds);
    await writePlays(set.id, raw.plays, setGenre);
    stats.newSets += 1;
  }

  // Lean mode (single-video / rate-limit-friendly): skip discovery + social
  // harvest that hammers YouTube and often 429s local curated ingests.
  const lean = process.env.INGEST_LEAN === "1";
  if (lean) {
    console.log("[ingest] lean mode — skipping crosslink/catalog-socials/discovery");
  }

  try {
    const editions = await ensureFestivalEditions(prisma);
    if (editions) {
      console.log(`[ingest] festival editions seeded: ${editions}`);
    }
    const nights = await ensureVenueCalendarNights(prisma);
    if (nights.nights) {
      console.log(
        `[ingest] venue calendar nights: ${nights.nights} (created=${nights.created} updated=${nights.updated})`,
      );
    }
    const dropEds = recentlyEndedEditions(21);
    if (festivalDropBoostActive() && dropEds.length) {
      console.log(
        `[ingest] festival drop boost active: ${dropEds
          .map((e) => e.slug)
          .join(", ")}`,
      );
    }
  } catch (err) {
    console.warn(
      "[ingest] festival editions:",
      err instanceof Error ? err.message : err,
    );
  }

  // Cross-link handles before polling so newly resolved SC/YT seeds are used.
  if (!lean) {
    try {
      const report: HandleReport = await runCrosslinkDiscovery();
      stats.crosslink = {
        needsAttention: report.needsAttention.length,
        ok: report.ok.length,
        hits: report.crosslinkHits,
      };
    } catch (err) {
      console.warn(
        "[ingest] crosslink failed:",
        err instanceof Error ? err.message : err,
      );
    }

    // Catalog DJs with YT sets → channel About / description socials → Dj + promote.
    // Runs before adapters so newly found SC/YT can be polled in this deep pass.
    try {
      await runCatalogYtSocials(prisma);
    } catch (err) {
      console.warn(
        "[ingest] catalog-yt-socials failed:",
        err instanceof Error ? err.message : err,
      );
    }

    // SC profile bios often list "YouTube: @handle" as plain text (not a link).
    try {
      await runCatalogScSocials(prisma);
    } catch (err) {
      console.warn(
        "[ingest] catalog-sc-socials failed:",
        err instanceof Error ? err.message : err,
      );
    }

    // Pre-poll discovery: lineup + press → promote handles → ensure Dj rows
    // so adapters can fetch new artists/venues in THIS deep run.
    try {
      stats.discovery = await runDiscovery(prisma, {
        collaboratorMentions: [],
        scanExternal: true,
      });
    } catch (err) {
      console.warn(
        "[ingest] pre-discovery failed:",
        err instanceof Error ? err.message : err,
      );
    }
  }

  for (const adapter of adapters) {
    const before = {
      new: stats.newSets,
      refreshed: stats.refreshedSets,
      skipped: stats.skippedSets,
    };
    let sets: RawSet[] = [];
    try {
      sets = await adapter.fetchRecent();
    } catch (err) {
      console.error(`[ingest] ${adapter.label} fetch failed:`, err);
      continue;
    }
    sets.sort((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime());
    for (const s of sets) {
      try {
        await ingestSet(s);
      } catch (err) {
        console.error(
          `[ingest] ${adapter.label} set failed (${s.sourceSlug ?? s.title}):`,
          err instanceof Error ? err.message : err,
        );
      }
    }
    stats.bySource[adapter.id] = {
      new: stats.newSets - before.new,
      refreshed: stats.refreshedSets - before.refreshed,
      skipped: stats.skippedSets - before.skipped,
    };
  }

  // Post-poll discovery: fold B2B/coplay signals, re-promote, refresh graph.
  if (!lean) {
    try {
      const after = await runDiscovery(prisma, {
        collaboratorMentions,
        scanExternal: false,
      });
      stats.discovery = stats.discovery
        ? {
            ...after,
            newlyQueued: (stats.discovery.newlyQueued ?? 0) + after.newlyQueued,
            promoted: (stats.discovery.promoted ?? 0) + after.promoted,
            lineupHits: stats.discovery.lineupHits ?? after.lineupHits,
            pressHits: stats.discovery.pressHits ?? after.pressHits,
            djsEnsured: (stats.discovery.djsEnsured ?? 0) + after.djsEnsured,
            venuesEnsured:
              (stats.discovery.venuesEnsured ?? 0) + (after.venuesEnsured ?? 0),
          }
        : after;
    } catch (err) {
      console.warn(
        "[ingest] discovery failed:",
        err instanceof Error ? err.message : err,
      );
    }
  }

  // Clear dead guessed social/website URLs; apply curated label/venue fixes.
  // CI deep runs verify once in the workflow step — skip the duplicate here.
  if (process.env.INGEST_SKIP_VERIFY === "1" || lean) {
    console.log("[ingest] skipping verify-urls (workflow will run it once)");
  } else {
    try {
      await verifyStoredSocialUrls(prisma);
    } catch (err) {
      console.warn(
        "[ingest] verify-urls failed:",
        err instanceof Error ? err.message : err,
      );
    }
  }

  // Harvest more socials / set candidates / Beatport links from entity websites.
  if (!lean) {
    try {
      await scanEntityUrls(prisma);
    } catch (err) {
      console.warn(
        "[ingest] scan-urls failed:",
        err instanceof Error ? err.message : err,
      );
    }
  }

  // Copy primary DJ artwork onto sets still missing a thumb (cheap, no API).
  try {
    const bare = await prisma.set.findMany({
      where: { imageUrl: null },
      select: {
        id: true,
        artists: {
          where: { isPrimary: true },
          take: 1,
          select: { dj: { select: { imageUrl: true } } },
        },
      },
    });
    let filled = 0;
    for (const s of bare) {
      const url = s.artists[0]?.dj.imageUrl;
      if (!url) continue;
      await prisma.set.update({ where: { id: s.id }, data: { imageUrl: url } });
      filled += 1;
    }
    if (filled) console.log(`[ingest] set thumbs from DJ: ${filled}`);
  } catch (err) {
    console.warn(
      "[ingest] set←DJ thumb copy failed:",
      err instanceof Error ? err.message : err,
    );
  }

  // Backfill original-audio playback URLs for older rows.
  try {
    const filled = await backfillPlaybackUrls(prisma);
    if (filled) console.log(`[ingest] playbackUrl backfill: ${filled}`);
  } catch (err) {
    console.warn(
      "[ingest] playbackUrl backfill failed:",
      err instanceof Error ? err.message : err,
    );
  }

  // hearthis: fix misleading SoundCloud badges + upgrade linked SC/YT audio.
  try {
    const n = await backfillHearthisTypeAndPlayback(prisma);
    if (n) console.log(`[ingest] hearthis type/playback backfill: ${n}`);
  } catch (err) {
    console.warn(
      "[ingest] hearthis type/playback backfill failed:",
      err instanceof Error ? err.message : err,
    );
  }

  try {
    const n = await backfillKnownEventAliases(prisma);
    if (n) console.log(`[ingest] event alias remap: ${n}`);
  } catch (err) {
    console.warn(
      "[ingest] event alias remap failed:",
      err instanceof Error ? err.message : err,
    );
  }

  try {
    const { backfillSetEventsFromTitles } = await import("./backfillSetEvents");
    const ev = await backfillSetEventsFromTitles(prisma);
    if (ev.attached) {
      console.log(
        `[ingest] event title backfill: ${ev.attached}/${ev.scanned}`,
      );
    }
  } catch (err) {
    console.warn(
      "[ingest] event title backfill failed:",
      err instanceof Error ? err.message : err,
    );
  }

  try {
    const linked = await backfillSetEditions(prisma);
    if (linked) console.log(`[ingest] set editions linked: ${linked}`);
  } catch (err) {
    console.warn(
      "[ingest] set editions backfill failed:",
      err instanceof Error ? err.message : err,
    );
  }

  try {
    await reportFestivalGaps();
  } catch (err) {
    console.warn(
      "[ingest] festival gap report failed:",
      err instanceof Error ? err.message : err,
    );
  }

  return stats;
}

/** Collapse orphan event rows (Tomorrowland Belgium → tomorrowland, etc.). */
export async function backfillKnownEventAliases(
  prisma: PrismaClient,
): Promise<number> {
  let moved = 0;
  for (const [orphanSlug, canonName] of Object.entries(EVENT_SLUG_REMAP)) {
    const orphan = await prisma.event.findUnique({
      where: { slug: orphanSlug },
      select: { id: true },
    });
    if (!orphan) continue;
    const canon = resolveEvent(canonName);
    if (canon.slug === orphanSlug) continue;
    let target = await prisma.event.findUnique({ where: { slug: canon.slug } });
    if (!target) {
      const socials = eventSocialPayload(canon);
      target = await prisma.event.create({
        data: {
          slug: canon.slug,
          name: canon.name,
          kind: canon.kind,
          location: canon.location ?? null,
          website: socials.website ?? null,
          soundcloud: socials.soundcloud ?? null,
          instagram: socials.instagram ?? null,
          twitter: socials.twitter ?? null,
        },
      });
    } else if (target.kind === "event" && canon.kind !== "event") {
      target = await prisma.event.update({
        where: { id: target.id },
        data: { kind: canon.kind, name: canon.name },
      });
    }
    const res = await prisma.set.updateMany({
      where: { eventId: orphan.id },
      data: { eventId: target.id },
    });
    moved += res.count;
    const stillLinked = await prisma.set.count({
      where: { eventId: orphan.id },
    });
    if (stillLinked === 0) {
      await prisma.event.delete({ where: { id: orphan.id } }).catch(() => {});
    }
  }
  return moved;
}

/** Fill Set.playbackUrl from a playable sourceUrl (SC / YT / Mixcloud). */
export async function backfillPlaybackUrls(
  prisma: PrismaClient,
  limit = 80,
): Promise<number> {
  const rows = await prisma.set.findMany({
    where: { playbackUrl: null, sourceUrl: { not: null } },
    select: { id: true, sourceName: true, sourceUrl: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
  let filled = 0;
  for (const s of rows) {
    const next = playbackUrlFromSource(s.sourceName, s.sourceUrl);
    if (!next) continue;
    await prisma.set.update({
      where: { id: s.id },
      data: { playbackUrl: next },
    });
    filled += 1;
  }
  return filled;
}

/**
 * Correct hearthis rows that were typed as SoundCloud, and prefer SC/YT
 * playback when the hearthis description/buy_link points at a real track.
 */
export async function backfillHearthisTypeAndPlayback(
  prisma: PrismaClient,
  limit = 60,
): Promise<number> {
  // Fast path: hearthis-native audio must not wear a SoundCloud badge.
  const relabeled = await prisma.set.updateMany({
    where: {
      sourceName: "hearthis.at",
      type: "soundcloud",
      OR: [
        { playbackUrl: null },
        { playbackUrl: { contains: "hearthis.at" } },
      ],
    },
    data: { type: "mix" },
  });

  const rows = await prisma.set.findMany({
    where: {
      sourceName: "hearthis.at",
      OR: [
        { playbackUrl: null },
        { playbackUrl: { contains: "hearthis.at" } },
      ],
    },
    select: {
      id: true,
      type: true,
      sourceUrl: true,
      playbackUrl: true,
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  let upgraded = 0;
  for (const s of rows) {
    if (!s.sourceUrl) continue;
    const ht = parseHearthisPath(s.sourceUrl);
    if (!ht) continue;
    try {
      const detail = await fetchTrackDetail(ht.user, ht.track);
      await htSleep(100);
      const external = preferredExternalPlaybackFromText(
        detail.description,
        detail.buy_link,
      );
      let next: string | null = null;
      if (external?.host === "soundcloud") {
        next = await resolveSoundCloudTrackUrl(external.playbackUrl);
      } else if (external?.host === "youtube") {
        next = external.playbackUrl;
      }
      const preferred = preferPlaybackUrl(next, s.playbackUrl);
      if (!preferred || preferred === s.playbackUrl) continue;

      const patch: { playbackUrl: string; type?: string } = {
        playbackUrl: preferred,
      };
      // Promote Mix → SoundCloud only when audio actually moves to SC.
      if (
        /soundcloud\.com\//i.test(preferred) &&
        (s.type === "mix" || s.type === "soundcloud")
      ) {
        patch.type = "soundcloud";
      }
      await prisma.set.update({ where: { id: s.id }, data: patch });
      upgraded += 1;
    } catch {
      /* leave row */
    }
  }

  return relabeled.count + upgraded;
}
