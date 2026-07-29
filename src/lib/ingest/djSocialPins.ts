/**
 * Hard pins for DJ socials that name-guessing / empty IG slots get wrong.
 * Applied on every verify-urls / fast deploy via applyKnownUrlFixes.
 *
 * Keep Beatport / official site as website when there is no personal homepage.
 * Schema stores SC / YT / IG / X / website — TikTok & Facebook stay on roster.socials.
 *
 * Pin rows live in `djSocialPins.data.ts` (no Node fs) so queries can import
 * slugs without pulling the artist roster into the static-export graph.
 */

import type { PrismaClient } from "@prisma/client";
import { youtubeChannelUrl } from "../social";
import { slugify } from "./types";
import { DJ_SOCIAL_PINS, type DjSocialPin } from "./djSocialPins.data";

export type { DjSocialPin };
export { DJ_SOCIAL_PINS };

/** Upsert pinned social fields for curated brand DJs. Returns rows touched. */
export async function applyDjSocialPins(prisma: PrismaClient): Promise<number> {
  let n = 0;
  for (const pin of DJ_SOCIAL_PINS) {
    const existing = await prisma.dj.findUnique({ where: { slug: pin.slug } });
    const data = {
      name: pin.name,
      accent: pin.accent,
      soundcloud: pin.soundcloud ?? null,
      youtube: pin.youtube ?? null,
      instagram: pin.instagram ?? null,
      twitter: pin.twitter ?? null,
      website: pin.website,
      bio: pin.bio,
    };
    if (existing) {
      await prisma.dj.update({ where: { id: existing.id }, data });
    } else {
      await prisma.dj.create({
        data: { slug: pin.slug, ...data },
      });
    }
    n += 1;
  }
  // Fill missing YT from the artist roster (handle → https://youtube.com/@…).
  n += await applyRosterYoutube(prisma);
  return n;
}

/** Backfill Dj.youtube from ARTIST_ROSTER youtube handles when empty. */
export async function applyRosterYoutube(prisma: PrismaClient): Promise<number> {
  // Ingest-only path — keep roster (node:fs graduates) out of page queries.
  const { ARTIST_ROSTER } = await import("./roster");
  let n = 0;
  for (const a of ARTIST_ROSTER) {
    const url = youtubeChannelUrl(a.youtube?.handle ?? "");
    if (!url) continue;
    const slug = slugify(a.name);
    const existing = await prisma.dj.findUnique({ where: { slug } });
    if (!existing) continue;
    if (existing.youtube === url) continue;
    // Prefer roster channel over empty / stale non-channel watch URLs.
    // Also overwrite clearly broken handles (e.g. @https from bad scrapes).
    const broken =
      /youtube\.com\/@https\b/i.test(existing.youtube ?? "") ||
      /youtube\.com\/@$/i.test(existing.youtube ?? "");
    if (
      existing.youtube &&
      !broken &&
      /youtube\.com\/@/i.test(existing.youtube) &&
      existing.youtube !== url
    ) {
      continue;
    }
    await prisma.dj.update({
      where: { id: existing.id },
      data: { youtube: url },
    });
    n += 1;
  }
  return n;
}
