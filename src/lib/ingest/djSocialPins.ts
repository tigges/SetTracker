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
  /** Null when no verified IG — do not invent handles. */
  instagram: string | null;
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
    slug: "marten-horger",
    name: "Marten Horger",
    accent: "#ff7a45",
    soundcloud: "https://soundcloud.com/marten-horger",
    instagram: "https://www.instagram.com/marten_horger/",
    website: "https://www.martenhorger.com/",
    bio: "Bass House. Berlin. Official martenhorger.com — SC marten-horger, IG @marten_horger, YT @MARTENHORGER.",
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
  {
    slug: "ac-slater",
    name: "AC Slater",
    accent: "#f2b33d",
    soundcloud: "https://soundcloud.com/acslater",
    instagram: "https://www.instagram.com/djacslater/",
    website: "https://www.djacslater.com/",
    bio: "Bass House. Official djacslater.com — YT @djacslater / user/djacslater, IG @djacslater, SC acslater, Beatport artist/ac-slater/52351.",
  },
  {
    slug: "solomun",
    name: "Solomun",
    accent: "#f0e6d8",
    soundcloud: "https://soundcloud.com/solomun",
    instagram: "https://www.instagram.com/solomun/",
    website: "https://solomun.org/",
    bio: 'Melodic House. Diynamic / Solomun +1. Official solomun.org — YT @SolomunOfficial, IG @solomun, SC solomun. "Nobody is not loved."',
  },
  {
    slug: "odd-mob",
    name: "Odd Mob",
    accent: "#b8f200",
    soundcloud: "https://soundcloud.com/oddmob",
    instagram: "https://www.instagram.com/odd_mob/",
    website: "https://open.spotify.com/artist/4qLwtWhlhyAoQ4S9mSrDW9",
    bio: "Tech House. Brisbane. SC oddmob, IG @odd_mob, YT @oddmob.",
  },
  {
    slug: "westend",
    name: "Westend",
    accent: "#f72585",
    soundcloud: "https://soundcloud.com/itsthewestend",
    instagram: null,
    website: "https://www.beatport.com/artist/westend/576028",
    bio: "Tech House. NYC. SC itsthewestend (not westend), YT @itsthewestend, Beatport artist/westend/576028.",
  },
  {
    slug: "sara-landry",
    name: "Sara Landry",
    accent: "#9b5de5",
    soundcloud: "https://soundcloud.com/sara-landry-dj",
    instagram: "https://www.instagram.com/saralandrydj/",
    website: "https://www.saralandry.com",
    bio: "Hard Techno / techno. Official saralandry.com — SC sara-landry-dj, IG @saralandrydj, YT @saralandry922, Beatport artist/sara-landry/663399.",
  },
  {
    slug: "lilly-palmer",
    name: "Lilly Palmer",
    accent: "#ff006e",
    soundcloud: "https://soundcloud.com/lilly_palmer",
    instagram: "https://www.instagram.com/lilly_palmerdj/",
    website: "https://www.beatport.com/artist/lilly-palmer/597345",
    bio: "Techno. SC lilly_palmer, IG @lilly_palmerdj, YT @lillypalmer_dj, Beatport artist/lilly-palmer/597345.",
  },
  {
    slug: "tape-b",
    name: "Tape B",
    accent: "#ffbe0b",
    soundcloud: "https://soundcloud.com/tape-b-official",
    instagram: null,
    website: "https://linktr.ee/tapebbeats",
    bio: "Bass / breaks. SC tape-b-official, YT @tapebbeats, linktr.ee/tapebbeats.",
  },
  {
    slug: "hntr",
    name: "HNTR",
    accent: "#00f5d4",
    soundcloud: "https://soundcloud.com/hntrnet",
    instagram: "https://www.instagram.com/hntrnet/",
    twitter: "https://twitter.com/hntrnet",
    website: "https://www.hntr.net",
    bio: "Techno. Toronto. Official hntr.net — SC hntrnet, IG/X @hntrnet, YT @hntrnet, No Neon Records.",
  },
  {
    slug: "gentlemens-groove",
    name: "Gentlemen's Groove",
    accent: "#00e5ff",
    soundcloud: "https://soundcloud.com/gentlemens-groove-records",
    instagram: null,
    website: "https://www.facebook.com/Gentlemensgroove",
    bio: "Deep house mix series (EST. 2020). Hearthis gentlemensgroove-oz; SC label gentlemens-groove-records; FB Gentlemensgroove.",
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
  return n;
}
