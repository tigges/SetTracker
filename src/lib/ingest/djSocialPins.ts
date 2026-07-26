/**
 * Hard pins for DJ socials that name-guessing / empty IG slots get wrong.
 * Applied on every verify-urls / fast deploy via applyKnownUrlFixes.
 *
 * Keep Beatport / official site as website when there is no personal homepage.
 * Schema only stores SC / IG / X / website — TikTok & Facebook stay on roster.socials.
 */

import type { PrismaClient } from "@prisma/client";

export type DjSocialPin = {
  slug: string;
  name: string;
  accent: string;
  soundcloud: string;
  instagram: string;
  twitter?: string | null;
  website: string;
  bio: string;
};

export const DJ_SOCIAL_PINS: DjSocialPin[] = [
  {
    slug: "biscits",
    name: "BISCITS",
    accent: "#ef476f",
    soundcloud: "https://soundcloud.com/biscits",
    instagram: "https://www.instagram.com/itsbiscits/",
    website: "https://www.beatport.com/artist/biscits/591990",
    bio: [
      "Tech House.",
      "Management: charlie@palmartists.com",
      "Booking N/S America: bshprits@teamwass.com",
      "Booking EU/UK: Jack@unitedtalent.com",
      "Booking AUS/NZ: Stuart@posterchild.com.au",
    ].join(" "),
  },
  {
    slug: "david-guetta",
    name: "David Guetta",
    accent: "#1e90ff",
    soundcloud: "https://soundcloud.com/davidguetta",
    instagram: "https://www.instagram.com/davidguetta/",
    twitter: "https://x.com/davidguetta",
    website: "https://davidguetta.com",
    bio: "House. Official site davidguetta.com — SC davidguetta, IG/X @davidguetta.",
  },
  {
    slug: "fisher",
    name: "FISHER",
    accent: "#00c2ff",
    soundcloud: "https://soundcloud.com/fish-tales",
    instagram: "https://www.instagram.com/followthefishtv/",
    website: "https://followthefishtv.com",
    bio: "Tech House. Official: followthefishtv.com — IG @followthefishtv, SC fish-tales, YT @fisher.",
  },
  {
    slug: "artbat",
    name: "ARTBAT",
    accent: "#6c63ff",
    soundcloud: "https://soundcloud.com/artbatmusic",
    instagram: "https://www.instagram.com/artbatmusic/",
    website: "https://www.beatport.com/artist/artbat/499932",
    bio: "Melodic Techno. SC artbatmusic, IG @artbatmusic, YT @ARTBAT — Beatport artist hub.",
  },
];

/** Upsert pinned social fields for curated brand DJs. Returns rows touched. */
export async function applyDjSocialPins(prisma: PrismaClient): Promise<number> {
  let n = 0;
  for (const pin of DJ_SOCIAL_PINS) {
    const existing = await prisma.dj.findUnique({ where: { slug: pin.slug } });
    const data = {
      name: pin.name,
      accent: pin.accent,
      soundcloud: pin.soundcloud,
      instagram: pin.instagram,
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
  return n;
}
