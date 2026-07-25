import type { PrismaClient } from "@prisma/client";
import { djSocials, labelSocials } from "../social";
import { hashRawSetContent } from "./hash";
import { adapters as defaultAdapters } from "./sources";
import { slugify, type RawArtist, type RawPlay, type RawSet, type SourceAdapter } from "./types";

const ACCENT_PALETTE = [
  "#ff7a45", "#4fb0e0", "#ff7096", "#b0d24e", "#ffd24d",
  "#5cc7d6", "#c56cff", "#ff6f5e", "#8a7cff", "#45c7e0",
];

function pickAccent(seed: string): string {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return ACCENT_PALETTE[h % ACCENT_PALETTE.length];
}

export type IngestStats = {
  scannedSets: number;
  newSets: number;
  refreshedSets: number;
  skippedSets: number;
  newDjs: number;
  newTracks: number;
  bySource: Record<string, { new: number; refreshed: number; skipped: number }>;
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
  };

  const djCache = new Map<string, string>();
  const labelCache = new Map<string, string>();

  async function upsertDj(raw: RawArtist): Promise<string> {
    const slug = raw.slug || slugify(raw.name);
    if (djCache.has(slug)) return djCache.get(slug)!;
    const existing = await prisma.dj.findUnique({ where: { slug } });
    if (existing) {
      djCache.set(slug, existing.id);
      return existing.id;
    }
    const created = await prisma.dj.create({
      data: {
        slug,
        name: raw.name,
        homeCity: raw.homeCity ?? null,
        bio: raw.bio ?? null,
        accent: raw.accent ?? pickAccent(slug),
        ...djSocials(raw.name),
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
    const existing = await prisma.label.findUnique({ where: { slug } });
    const rec =
      existing ??
      (await prisma.label.create({ data: { slug, name, ...labelSocials(name) } }));
    labelCache.set(slug, rec.id);
    return rec.id;
  }

  async function upsertTrack(
    title: string,
    artistName: string,
    labelName?: string,
  ): Promise<string> {
    const existing = await prisma.track.findFirst({ where: { title, artistName } });
    if (existing) return existing.id;
    const labelId = await upsertLabel(labelName);
    const created = await prisma.track.create({
      data: { title, artistName, labelId },
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
    const slug = slugify(name);
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing) return existing.id;
    const created = await prisma.event.create({
      data: {
        slug,
        name,
        kind: kind ?? "event",
        location: location ?? null,
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

  async function writePlays(setId: string, plays: RawPlay[]): Promise<void> {
    for (const p of plays) {
      const base = {
        setId,
        position: p.position,
        timestamp: p.timestamp,
        provenance: p.provenance,
        idStatus: p.idStatus,
      };
      if (p.idStatus === "identified" && p.trackTitle && p.artistName) {
        const trackId = await upsertTrack(p.trackTitle, p.artistName, p.label);
        await prisma.played.create({ data: { ...base, trackId } });
      } else if (
        p.idStatus === "community_resolved" &&
        p.trackTitle &&
        p.artistName
      ) {
        const trackId = await upsertTrack(p.trackTitle, p.artistName, p.label);
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

  async function replacePlays(setId: string, plays: RawPlay[]): Promise<void> {
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
    await writePlays(setId, plays);
  }

  async function ingestSet(raw: RawSet): Promise<void> {
    stats.scannedSets += 1;
    const sourceHash = raw.sourceHash ?? hashRawSetContent(raw);
    const existing = await prisma.set.findUnique({
      where: { slug: raw.sourceSlug },
    });

    if (existing) {
      if (existing.sourceHash && existing.sourceHash === sourceHash) {
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
          genre: raw.genre ?? null,
          publishedAt: raw.publishedAt,
          durationSec: raw.durationSec,
          sourceName: raw.sourceName,
          sourceUrl: raw.sourceUrl ?? null,
          cover: raw.cover,
          sourceHash,
        },
      });
      await replacePlays(existing.id, plays);
      stats.refreshedSets += 1;
      console.log(
        `[ingest] refresh ${raw.sourceSlug}` +
          (keeps.length ? ` (kept ${keeps.length} community rows)` : ""),
      );
      return;
    }

    const primaryDjId = await upsertDj(raw.primaryArtist);
    const collaboratorIds: string[] = [];
    for (const c of raw.collaborators ?? []) collaboratorIds.push(await upsertDj(c));

    const eventId = await upsertEvent(raw.eventName, raw.eventKind, raw.eventLocation);
    const seriesId = await upsertSeries(raw.seriesName, primaryDjId);

    const set = await prisma.set.create({
      data: {
        slug: raw.sourceSlug,
        title: raw.title,
        type: raw.type,
        genre: raw.genre ?? null,
        publishedAt: raw.publishedAt,
        durationSec: raw.durationSec,
        sourceName: raw.sourceName,
        sourceUrl: raw.sourceUrl ?? null,
        cover: raw.cover,
        sourceHash,
        eventId,
        seriesId,
      },
    });

    await prisma.setArtist.create({
      data: { setId: set.id, djId: primaryDjId, isPrimary: true },
    });
    for (const djId of collaboratorIds) {
      if (djId === primaryDjId) continue;
      await prisma.setArtist.create({
        data: { setId: set.id, djId, isPrimary: false },
      });
    }

    await writePlays(set.id, raw.plays);
    stats.newSets += 1;
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

  return stats;
}
