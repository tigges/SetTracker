/**
 * Fill-null socials on existing Dj rows from roster / knownHandles / Wikidata.
 * Never invents hosts from slugs. Prioritises DJs that already have sets.
 */

import type { PrismaClient } from "@prisma/client";
import { djSocialsFromKnown } from "../../social";
import { ARTIST_ROSTER } from "../roster";
import { slugify } from "../types";
import { hintForName } from "./knownHandles";
import { resolveWikidataOfficialWebsite } from "./wikidataOfficial";

export type FillHandleStats = {
  known: number;
  wikidata: number;
};

function hasAnyHandle(d: {
  soundcloud: string | null;
  youtube: string | null;
  instagram: string | null;
  twitter: string | null;
  website: string | null;
  beatport?: string | null;
}): boolean {
  return Boolean(
    d.soundcloud ||
      d.youtube ||
      d.instagram ||
      d.twitter ||
      d.website ||
      d.beatport,
  );
}

/** Apply roster + KNOWN_HANDLES fill-null per field. */
export async function fillDjHandlesFromKnown(
  prisma: PrismaClient,
): Promise<number> {
  const djs = await prisma.dj.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      soundcloud: true,
      youtube: true,
      instagram: true,
      twitter: true,
      website: true,
      beatport: true,
      _count: { select: { sets: true } },
    },
  });
  let n = 0;
  for (const d of djs) {
    const roster = ARTIST_ROSTER.find(
      (a) => slugify(a.name) === d.slug || a.name === d.name,
    );
    const hint = hintForName(d.name);
    const extra = [hint?.instagram, hint?.twitter].filter(
      (u): u is string => Boolean(u),
    );
    const socials = djSocialsFromKnown({
      name: d.name,
      soundcloudPermalink:
        roster?.soundcloud?.permalink || hint?.soundcloudPermalink,
      youtubeHandle: roster?.youtube?.handle || hint?.youtubeHandle,
      socials: [...(roster?.socials ?? []), ...extra],
      website: roster?.website || hint?.website,
    });
    if (!hasAnyHandle(socials)) continue;
    const data: {
      soundcloud?: string;
      youtube?: string;
      instagram?: string;
      twitter?: string;
      website?: string;
    } = {};
    if (!d.soundcloud && socials.soundcloud) data.soundcloud = socials.soundcloud;
    if (!d.youtube && socials.youtube) data.youtube = socials.youtube;
    if (!d.instagram && socials.instagram) data.instagram = socials.instagram;
    if (!d.twitter && socials.twitter) data.twitter = socials.twitter;
    if (!d.website && socials.website) data.website = socials.website;
    if (!Object.keys(data).length) continue;
    await prisma.dj.update({
      where: { id: d.id },
      data,
    });
    n += 1;
  }
  if (n) console.log(`[dj-handles] filled ${n} from roster/knownHandles`);
  return n;
}

/**
 * Wikidata P856 websites for DJs that have sets but still no handle.
 * Network-bound — skip on fast Pages verify (VERIFY_URLS_CURATED_ONLY=1).
 */
export async function fillDjWebsitesFromWikidata(
  prisma: PrismaClient,
  opts?: { limit?: number; delayMs?: number },
): Promise<number> {
  const limit = opts?.limit ?? 20;
  const djs = await prisma.dj.findMany({
    where: {
      soundcloud: null,
      youtube: null,
      instagram: null,
      twitter: null,
      website: null,
      sets: { some: {} },
    },
    select: { id: true, name: true },
    take: limit,
    orderBy: { name: "asc" },
  });
  let n = 0;
  for (const d of djs) {
    const site = await resolveWikidataOfficialWebsite(d.name, "dj", {
      delayMs: opts?.delayMs ?? 150,
    });
    if (!site) continue;
    await prisma.dj.update({
      where: { id: d.id },
      data: { website: site },
    });
    n += 1;
  }
  if (n) console.log(`[dj-handles] wikidata websites: ${n}`);
  return n;
}
