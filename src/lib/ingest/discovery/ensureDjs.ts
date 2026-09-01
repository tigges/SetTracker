/**
 * Persist discovered / roster artists as Dj rows so they appear on /djs
 * and can be cross-linked even before a set is ingested.
 */

import type { PrismaClient } from "@prisma/client";
import { isJunkArtistName, sanitizeArtistName } from "../../artistName";
import { djSocialsFromKnown } from "../../social";
import { DJ_SOCIAL_PINS } from "../djSocialPins.data";
import { ARTIST_ROSTER } from "../roster";
import { slugify } from "../types";
import { wishlistDefaultSlugs } from "../../wishlist";
import { hintForName } from "./knownHandles";
import { loadCandidates } from "./store";

const ACCENTS = [
  "#ff7a45",
  "#4fb0e0",
  "#ff7096",
  "#b0d24e",
  "#ffd24d",
  "#5cc7d6",
  "#c56cff",
  "#ff6f5e",
];

/** Persist a stub only when it can become browse-ready (handle) or is curated. */
export function shouldPersistDjStub(opts: {
  isRoster?: boolean;
  isPromoted?: boolean;
  soundcloud?: string | null;
  youtube?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  website?: string | null;
}): boolean {
  if (opts.isRoster || opts.isPromoted) return true;
  return Boolean(
    opts.soundcloud ||
      opts.youtube ||
      opts.instagram ||
      opts.twitter ||
      opts.website,
  );
}

function accentFor(slug: string, preferred?: string): string {
  if (preferred) return preferred;
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return ACCENTS[h % ACCENTS.length]!;
}

export async function ensureDiscoveredDjs(
  prisma: PrismaClient,
): Promise<{ created: number; updated: number; purged: number }> {
  let created = 0;
  let updated = 0;

  type Stub = {
    name: string;
    slug: string;
    genre?: string;
    accent?: string;
    homeCity?: string;
    website?: string;
    socials?: string[];
    soundcloudPermalink?: string;
    youtubeHandle?: string;
  };

  const stubs = new Map<string, Stub>();

  for (const a of ARTIST_ROSTER) {
    const slug = slugify(a.name);
    stubs.set(slug, {
      name: a.name,
      slug,
      genre: a.genre,
      accent: a.accent,
      homeCity: a.homeCity,
      website: a.website,
      socials: a.socials,
      soundcloudPermalink: a.soundcloud?.permalink,
      youtubeHandle: a.youtube?.handle,
    });
  }

  const rosterSlugs = new Set(
    [...stubs.keys()],
  );
  const file = loadCandidates();
  const promotedSlugs = new Set(
    file.candidates.filter((c) => c.status === "promoted").map((c) => c.slug),
  );
  for (const c of file.candidates) {
    if (c.status !== "promoted" && c.status !== "queued") continue;
    if (c.score < 25 && c.status !== "promoted") continue;
    const cleanName = sanitizeArtistName(c.name);
    if (!cleanName) continue;
    const slug = slugify(cleanName);
    if (!stubs.has(slug)) {
      stubs.set(slug, {
        name: cleanName,
        slug,
        genre: c.genre,
        accent: c.accent,
        soundcloudPermalink: c.soundcloudPermalink,
        youtubeHandle: c.youtubeHandle,
      });
    } else {
      const s = stubs.get(slug)!;
      s.soundcloudPermalink = s.soundcloudPermalink || c.soundcloudPermalink;
      s.youtubeHandle = s.youtubeHandle || c.youtubeHandle;
    }
  }

  for (const stub of stubs.values()) {
    const hint = hintForName(stub.name);
    const socials = djSocialsFromKnown({
      name: stub.name,
      soundcloudPermalink:
        stub.soundcloudPermalink || hint?.soundcloudPermalink,
      youtubeHandle: stub.youtubeHandle || hint?.youtubeHandle,
      socials: stub.socials,
      website: stub.website,
    });
    const existing = await prisma.dj.findUnique({ where: { slug: stub.slug } });
    if (!existing) {
      if (
        !shouldPersistDjStub({
          isRoster: rosterSlugs.has(stub.slug),
          isPromoted: promotedSlugs.has(stub.slug),
          ...socials,
        })
      ) {
        continue;
      }
      await prisma.dj.create({
        data: {
          slug: stub.slug,
          name: stub.name,
          homeCity: stub.homeCity ?? null,
          accent: accentFor(stub.slug, stub.accent || hint?.accent),
          bio: stub.genre ? `${stub.genre} artist` : null,
          ...socials,
        },
      });
      created += 1;
      continue;
    }
    const data: Record<string, unknown> = {};
    // Overwrite empty / homepage-stub SC (e.g. https://soundcloud.com with no path).
    const scStub =
      !existing.soundcloud?.trim() ||
      /^https?:\/\/(www\.)?soundcloud\.com\/?$/i.test(
        existing.soundcloud.trim(),
      );
    if (scStub && socials.soundcloud) data.soundcloud = socials.soundcloud;
    if (!existing.youtube && socials.youtube) data.youtube = socials.youtube;
    if (!existing.instagram && socials.instagram) data.instagram = socials.instagram;
    if (!existing.twitter && socials.twitter) data.twitter = socials.twitter;
    if (!existing.website && socials.website) data.website = socials.website;
    if (!existing.homeCity && stub.homeCity) data.homeCity = stub.homeCity;
    if (Object.keys(data).length) {
      await prisma.dj.update({ where: { id: existing.id }, data });
      updated += 1;
    }
  }

  const purged = (await purgeJunkDjs(prisma)) + (await purgeThinDjStubs(prisma));

  console.log(
    `[ensure-djs] created=${created} updated=${updated} purged=${purged}`,
  );
  return { created, updated, purged };
}

/** Delete empty Dj rows whose names are UI chrome (aria-labels, form fields). */
async function purgeJunkDjs(prisma: PrismaClient): Promise<number> {
  const rows = await prisma.dj.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { sets: true, series: true } },
    },
  });
  const junkIds = rows
    .filter(
      (d) =>
        d._count.sets === 0 &&
        d._count.series === 0 &&
        (isJunkArtistName(d.name) ||
          /^view-artist-details-for-/.test(d.slug)),
    )
    .map((d) => d.id);
  if (!junkIds.length) return 0;
  const result = await prisma.dj.deleteMany({
    where: { id: { in: junkIds } },
  });
  return result.count;
}

/**
 * Drop handle-less, set-less stubs created from lineup/press/coplay names.
 * Curated roster + social pins stay. Candidates remain in artist-candidates.json.
 */
export async function purgeThinDjStubs(prisma: PrismaClient): Promise<number> {
  const keep = new Set<string>([
    ...ARTIST_ROSTER.map((a) => slugify(a.name)),
    ...DJ_SOCIAL_PINS.map((p) => p.slug),
    ...wishlistDefaultSlugs(),
  ]);
  const rows = await prisma.dj.findMany({
    select: {
      id: true,
      slug: true,
      soundcloud: true,
      youtube: true,
      instagram: true,
      twitter: true,
      website: true,
      _count: { select: { sets: true, series: true } },
    },
  });
  const thinIds = rows
    .filter(
      (d) =>
        !keep.has(d.slug) &&
        d._count.sets === 0 &&
        d._count.series === 0 &&
        !d.soundcloud &&
        !d.youtube &&
        !d.instagram &&
        !d.twitter &&
        !d.website,
    )
    .map((d) => d.id);
  if (!thinIds.length) return 0;
  const result = await prisma.dj.deleteMany({
    where: { id: { in: thinIds } },
  });
  if (result.count) {
    console.log(`[ensure-djs] purged ${result.count} thin stubs (no handle, no sets)`);
  }
  return result.count;
}
