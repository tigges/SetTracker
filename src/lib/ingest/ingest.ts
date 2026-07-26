import type { PrismaClient } from "@prisma/client";
import { sanitizeArtistName } from "../artistName";
import { hearthisEmbedUrl, playbackUrlFromSource } from "../playback";
import { djSocialsFromKnown, labelSocials } from "../social";
import { ARTIST_ROSTER } from "./roster";
import { parseTrackTitle } from "../trackMeta";
import { runCrosslinkDiscovery, type HandleReport } from "./discovery/crosslink";
import { runDiscovery, type DiscoveryStats } from "./discovery/run";
import { hashRawSetContent } from "./hash";
import { fetchTrackDetail, sleep as htSleep } from "./hearthis/client";
import { adapters as defaultAdapters } from "./sources";
import { normalizeGenre } from "../genre";
import { allocateTrackSlug, trackSlugBase } from "../tracks/slug";
import { slugify, type RawArtist, type RawPlay, type RawSet, type SourceAdapter } from "./types";
import { eventSocialPayload, resolveEvent } from "./events";
import { scanEntityUrls } from "./scanEntityUrls";
import { verifyStoredSocialUrls } from "./verifyUrls";

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
    // Prefer sanitized slug so aria-label prefixes never mint junk Dj rows.
    const slug = slugify(name);
    if (djCache.has(slug)) return djCache.get(slug)!;
    const roster = ARTIST_ROSTER.find(
      (a) => slugify(a.name) === slug || a.name === name || a.name === raw.name,
    );
    const socials = djSocialsFromKnown({
      name,
      soundcloudPermalink: roster?.soundcloud?.permalink,
      socials: roster?.socials,
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
  }): Promise<string> {
    const artistName = normalizeArtistName(play.artistName);
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
      if (play.genre && !existing.genre) {
        const g = normalizeGenre(play.genre);
        if (g) data.genre = g;
      }
      if (play.durationSec != null && existing.durationSec == null) {
        data.durationSec = play.durationSec;
      }
      if (play.beatportUrl && !existing.beatportUrl) data.beatportUrl = play.beatportUrl;
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
        genre: normalizeGenre(play.genre) ?? null,
        durationSec: play.durationSec ?? null,
        beatportUrl: play.beatportUrl ?? null,
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
    const existing = await prisma.event.findUnique({
      where: { slug: canon.slug },
    });
    if (existing) {
      await prisma.event.update({
        where: { id: existing.id },
        data: {
          name: existing.name || canon.name,
          kind: existing.kind || canon.kind,
          location: existing.location ?? canon.location ?? null,
          website: existing.website ?? socials.website ?? null,
          soundcloud: existing.soundcloud ?? socials.soundcloud ?? null,
          instagram: existing.instagram ?? socials.instagram ?? null,
          twitter: existing.twitter ?? socials.twitter ?? null,
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

  async function upsertSeries(
    name: string | undefined,
    djId: string,
  ): Promise<string | null> {
    if (!name) return null;
    const slug = slugify(name);
    const existing = await prisma.series.findUnique({ where: { slug } });
    if (existing) return existing.id;
    const created = await prisma.series.create({ data: { slug, name, djId } });
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
      const genre =
        normalizeGenre(p.genre) ??
        normalizeGenre(setGenre) ??
        undefined;
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
        });
        const idTrack = await prisma.idTrack.create({
          data: {
            label: p.idLabel ?? "ID - ID",
            status: "community_resolved",
            resolvedTrackId: trackId,
            note: p.note ?? null,
          },
        });
        await prisma.played.create({
          data: {
            ...base,
            trackId,
            idTrackId: idTrack.id,
            rawText: p.idLabel ?? p.rawText,
          },
        });
      } else if (p.idStatus === "unresolved_id") {
        const idTrack = await prisma.idTrack.create({
          data: {
            label: p.idLabel ?? "ID - ID",
            suspectedArtist: p.suspectedArtist ?? null,
            note: p.note ?? null,
            status: "unresolved",
          },
        });
        await prisma.played.create({
          data: {
            ...base,
            idTrackId: idTrack.id,
            rawText: p.idLabel ?? p.rawText,
          },
        });
      } else {
        await prisma.played.create({
          data: {
            ...base,
            idStatus: "unparsed",
            rawText: p.rawText ?? null,
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
    primaryDjId: string,
    collaboratorIds: string[],
  ): Promise<void> {
    const desired = new Map<string, boolean>();
    desired.set(primaryDjId, true);
    for (const id of collaboratorIds) {
      if (id === primaryDjId) continue;
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
    const sourceHash = raw.sourceHash ?? hashRawSetContent(raw);
    const existing = await prisma.set.findUnique({
      where: { slug: raw.sourceSlug },
    });

    const playSignal = raw.plays.filter(
      (p) => p.idStatus === "identified" || p.idStatus === "community_resolved",
    ).length;
    if (playSignal > 0) {
      stats.setsWithTracklist += 1;
      stats.totalPlaysIngested += raw.plays.length;
    }
    noteCollaborators(raw);

    const primaryDjId = await upsertDj(raw.primaryArtist);
    if (!primaryDjId) {
      stats.skippedSets += 1;
      return;
    }
    const collaboratorIds: string[] = [];
    for (const c of raw.collaborators ?? []) {
      const id = await upsertDj(c);
      if (id) collaboratorIds.push(id);
    }

    const setGenre = normalizeGenre(raw.genre);

    if (existing) {
      if (existing.sourceHash && existing.sourceHash === sourceHash) {
        // Still refresh artist linkage (b2b backfill) even when tracklist is unchanged.
        await syncSetArtists(existing.id, primaryDjId, collaboratorIds);
        // Soft-normalize genre without re-pulling the tracklist.
        if ((existing.genre ?? null) !== (setGenre ?? null)) {
          await prisma.set.update({
            where: { id: existing.id },
            data: { genre: setGenre },
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
            const next =
              raw.playbackUrl ||
              (!existing.playbackUrl
                ? playbackUrlFromSource(raw.sourceName, raw.sourceUrl)
                : null);
            return next ? { playbackUrl: next } : {};
          })(),
          ...(raw.imageUrl && !existing.imageUrl
            ? { imageUrl: raw.imageUrl }
            : {}),
        },
      });
      await syncSetArtists(existing.id, primaryDjId, collaboratorIds);
      await replacePlays(existing.id, plays, setGenre);
      stats.refreshedSets += 1;
      console.log(
        `[ingest] refresh ${raw.sourceSlug}` +
          (keeps.length ? ` (kept ${keeps.length} community rows)` : ""),
      );
      return;
    }

    const eventId = await upsertEvent(raw.eventName, raw.eventKind, raw.eventLocation);
    const seriesId = await upsertSeries(raw.seriesName, primaryDjId);

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
        seriesId,
      },
    });

    await syncSetArtists(set.id, primaryDjId, collaboratorIds);
    await writePlays(set.id, raw.plays, setGenre);
    stats.newSets += 1;
  }

  // Cross-link handles before polling so newly resolved SC/YT seeds are used.
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
    for (const s of sets) await ingestSet(s);
    stats.bySource[adapter.id] = {
      new: stats.newSets - before.new,
      refreshed: stats.refreshedSets - before.refreshed,
      skipped: stats.skippedSets - before.skipped,
    };
  }

  // Post-poll discovery: fold B2B/coplay signals, re-promote, refresh graph.
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

  // Clear dead guessed social/website URLs; apply curated label/venue fixes.
  // CI deep runs verify once in the workflow step — skip the duplicate here.
  if (process.env.INGEST_SKIP_VERIFY === "1") {
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
  try {
    await scanEntityUrls(prisma);
  } catch (err) {
    console.warn(
      "[ingest] scan-urls failed:",
      err instanceof Error ? err.message : err,
    );
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

  return stats;
}

/** Fill Set.playbackUrl from sourceUrl / hearthis API when missing. */
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
    let next = playbackUrlFromSource(s.sourceName, s.sourceUrl);
    if (!next && s.sourceUrl) {
      const ht = parseHearthisPath(s.sourceUrl);
      if (ht) {
        try {
          const detail = await fetchTrackDetail(ht.user, ht.track);
          if (detail.id != null) next = hearthisEmbedUrl(detail.id);
          await htSleep(100);
        } catch {
          /* leave null */
        }
      }
    }
    if (!next) continue;
    await prisma.set.update({
      where: { id: s.id },
      data: { playbackUrl: next },
    });
    filled += 1;
  }
  return filled;
}
