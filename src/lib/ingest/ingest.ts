import type { PrismaClient } from "@prisma/client";
import { adapters as defaultAdapters } from "./sources";
import { slugify, type RawArtist, type RawSet, type SourceAdapter } from "./types";

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
  skippedSets: number;
  newDjs: number;
  newTracks: number;
  bySource: Record<string, { new: number; skipped: number }>;
};

export async function runIngest(
  prisma: PrismaClient,
  adapters: SourceAdapter[] = defaultAdapters,
): Promise<IngestStats> {
  const stats: IngestStats = {
    scannedSets: 0,
    newSets: 0,
    skippedSets: 0,
    newDjs: 0,
    newTracks: 0,
    bySource: {},
  };

  // caches to avoid repeated lookups within a run
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
    const rec = existing ?? (await prisma.label.create({ data: { slug, name } }));
    labelCache.set(slug, rec.id);
    return rec.id;
  }

  async function upsertTrack(title: string, artistName: string, labelName?: string): Promise<string> {
    const existing = await prisma.track.findFirst({ where: { title, artistName } });
    if (existing) return existing.id;
    const labelId = await upsertLabel(labelName);
    const created = await prisma.track.create({ data: { title, artistName, labelId } });
    stats.newTracks += 1;
    return created.id;
  }

  async function upsertEvent(name?: string, kind?: string, location?: string): Promise<string | null> {
    if (!name) return null;
    const slug = slugify(name);
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing) return existing.id;
    const created = await prisma.event.create({
      data: { slug, name, kind: kind ?? "event", location: location ?? null },
    });
    return created.id;
  }

  async function upsertSeries(name: string | undefined, djId: string): Promise<string | null> {
    if (!name) return null;
    const slug = slugify(name);
    const existing = await prisma.series.findUnique({ where: { slug } });
    if (existing) return existing.id;
    const created = await prisma.series.create({ data: { slug, name, djId } });
    return created.id;
  }

  async function ingestSet(raw: RawSet): Promise<void> {
    stats.scannedSets += 1;
    const existing = await prisma.set.findUnique({ where: { slug: raw.sourceSlug } });
    if (existing) {
      stats.skippedSets += 1;
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
        eventId,
        seriesId,
      },
    });

    await prisma.setArtist.create({ data: { setId: set.id, djId: primaryDjId, isPrimary: true } });
    for (const djId of collaboratorIds) {
      if (djId === primaryDjId) continue;
      await prisma.setArtist.create({ data: { setId: set.id, djId, isPrimary: false } });
    }

    for (const p of raw.plays) {
      const base = {
        setId: set.id,
        position: p.position,
        timestamp: p.timestamp,
        provenance: p.provenance,
        idStatus: p.idStatus,
      };
      if (p.idStatus === "identified" && p.trackTitle && p.artistName) {
        const trackId = await upsertTrack(p.trackTitle, p.artistName, p.label);
        await prisma.played.create({ data: { ...base, trackId } });
      } else if (p.idStatus === "community_resolved" && p.trackTitle && p.artistName) {
        const trackId = await upsertTrack(p.trackTitle, p.artistName, p.label);
        const idTrack = await prisma.idTrack.create({
          data: { label: p.idLabel ?? "ID - ID", status: "community_resolved", resolvedTrackId: trackId },
        });
        await prisma.played.create({ data: { ...base, trackId, idTrackId: idTrack.id, rawText: p.idLabel } });
      } else if (p.idStatus === "unresolved_id") {
        const idTrack = await prisma.idTrack.create({
          data: { label: p.idLabel ?? "ID - ID", suspectedArtist: p.suspectedArtist ?? null, note: p.note ?? null, status: "unresolved" },
        });
        await prisma.played.create({ data: { ...base, idTrackId: idTrack.id, rawText: p.idLabel } });
      } else {
        await prisma.played.create({ data: { ...base, idStatus: "unparsed", rawText: p.rawText ?? null } });
      }
    }

    stats.newSets += 1;
  }

  for (const adapter of adapters) {
    const before = { new: stats.newSets, skipped: stats.skippedSets };
    let sets: RawSet[] = [];
    try {
      sets = await adapter.fetchRecent();
    } catch (err) {
      console.error(`[ingest] ${adapter.label} fetch failed:`, err);
      continue;
    }
    // Oldest first so positions/relations are stable if adapters share artists.
    sets.sort((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime());
    for (const s of sets) await ingestSet(s);
    stats.bySource[adapter.id] = {
      new: stats.newSets - before.new,
      skipped: stats.skippedSets - before.skipped,
    };
  }

  return stats;
}
