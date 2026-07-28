/**
 * Hard pins for DJ socials that name-guessing / empty IG slots get wrong.
 * Applied on every verify-urls / fast deploy via applyKnownUrlFixes.
 *
 * Keep Beatport / official site as website when there is no personal homepage.
 * Schema stores SC / YT / IG / X / website — TikTok & Facebook stay on roster.socials.
 */

import type { PrismaClient } from "@prisma/client";
import { youtubeChannelUrl } from "../social";
import { ARTIST_ROSTER } from "./roster";
import { slugify } from "./types";

export type DjSocialPin = {
  slug: string;
  name: string;
  accent: string;
  /** Null when no verified SC — do not invent handles. */
  soundcloud: string | null;
  /** Official YouTube channel when known. */
  youtube?: string | null;
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
    youtube: "https://www.youtube.com/@Biscits",
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
    youtube: "https://www.youtube.com/@davidguetta",
    instagram: "https://www.instagram.com/davidguetta/",
    twitter: "https://x.com/davidguetta",
    website: "https://davidguetta.com",
    bio: "House. Official site davidguetta.com — SC davidguetta, IG/X @davidguetta.",
  },
  {
    slug: "armin-van-buuren",
    name: "Armin van Buuren",
    accent: "#00a3e0",
    soundcloud: "https://soundcloud.com/arminvanbuuren",
    youtube: "https://www.youtube.com/@arminvanbuuren",
    instagram: "https://www.instagram.com/arminvanbuuren/",
    twitter: "https://x.com/arminvanbuuren",
    website: "https://www.arminvanbuuren.com/",
    bio: "Trance. Netherlands. Official arminvanbuuren.com — YT @arminvanbuuren, IG/X/TikTok @arminvanbuuren, SC arminvanbuuren, Armada Music.",
  },
  {
    slug: "fisher",
    name: "FISHER",
    accent: "#00c2ff",
    soundcloud: "https://soundcloud.com/fish-tales",
    youtube: "https://www.youtube.com/@fisher",
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
  {
    slug: "charlotte-de-witte",
    name: "Charlotte de Witte",
    accent: "#e0e0e0",
    soundcloud: "https://soundcloud.com/charlottedewittemusic",
    instagram: "https://www.instagram.com/charlottedewittemusic/",
    twitter: "https://twitter.com/charlottedwitte",
    website: "https://charlottedewittemusic.com",
    bio: [
      "Techno. Belgium.",
      "Harnessing a distinct brand of artistry that knows no categorical bounds,",
      "the DJ, producer and record label head has cemented herself as one of the",
      "music industry's most in-demand names at nothing short of breakneck speed.",
      "Her signature sonic approach masterfully blends genres with a visceral energy",
      "that commands attention, the ardent catalyst in her meteoric rise from",
      "Belgium's underground to global phenomenon status.",
      "Official charlottedewittemusic.com — SC/IG/FB/TikTok/YT @charlottedewittemusic,",
      "X @charlottedwitte.",
    ].join(" "),
  },
  {
    slug: "black-coffee",
    name: "Black Coffee",
    accent: "#222222",
    soundcloud: "https://soundcloud.com/realblackcoffee",
    instagram: "https://www.instagram.com/realblackcoffee/",
    twitter: "https://x.com/RealBlackCoffee",
    website: "https://music.apple.com/za/artist/black-coffee/306140760",
    bio: "Afro House. South Africa. YT @realblackcoffee — IG/FB @realblackcoffee, X @RealBlackCoffee, SC realblackcoffee, Spotify/Apple Music artist hubs.",
  },
  {
    slug: "chapter-verse",
    name: "Chapter & Verse",
    accent: "#f77f00",
    soundcloud: "https://soundcloud.com/chapterandverseofficial",
    instagram: null,
    website: "https://www.youtube.com/@chapterandversemusic",
    bio: "Tech House. UK. YT @chapterandversemusic, SC chapterandverseofficial.",
  },
  {
    slug: "walker-royce",
    name: "Walker & Royce",
    accent: "#9ef01a",
    soundcloud: "https://soundcloud.com/walker-and-royce",
    instagram: "https://www.instagram.com/walkerandroyce/",
    twitter: "https://x.com/WalkerAndRoyce",
    website: "https://open.spotify.com/artist/1lAwVq9MxNJkB0dEY6xNoV",
    bio: "Tech House. NYC duo. YT @WalkerAndRoyce — IG @walkerandroyce, X @WalkerAndRoyce, FB walkerroyce, SC walker-and-royce, TikTok @walkerandroyce.",
  },
  {
    slug: "vintage-culture",
    name: "Vintage Culture",
    accent: "#e85d04",
    soundcloud: "https://soundcloud.com/vintageculturemusic",
    instagram: "https://www.instagram.com/vintageculture/",
    twitter: "https://x.com/VintageCulture",
    website: "https://vintageculture.com",
    bio: "Tech House. Brazil. Official vintageculture.com — YT @VintageCulture, IG @vintageculture, X @VintageCulture, SC vintageculturemusic, TikTok @vintageculture.",
  },
  {
    slug: "bleu-clair",
    name: "Bleu Clair",
    accent: "#4cc9f0",
    soundcloud: "https://soundcloud.com/bleuclair",
    instagram: "https://www.instagram.com/bleuclairmusic/",
    twitter: "https://x.com/bleuclair",
    website: "https://open.spotify.com/artist/7kA4sEagpoNK91I7wr9tYr",
    bio: "Tech House. Indonesia. YT @bleuclairmusic — IG/FB/TikTok @bleuclairmusic, X @bleuclair, SC bleuclair.",
  },
  {
    slug: "hot-since-82",
    name: "Hot Since 82",
    accent: "#e9c46a",
    soundcloud: "https://soundcloud.com/hotsince-82",
    instagram: null,
    twitter: "https://x.com/hotsince82",
    website: "https://hotsince82.com",
    bio: "Tech House. Leeds, UK. Official hotsince82.com — YT @HotSince82, SC hotsince-82, X/FB hotsince82, Beatport artist/hot-since-82/212422.",
  },
  {
    slug: "adam-beyer",
    name: "Adam Beyer",
    accent: "#111111",
    soundcloud: null,
    instagram: "https://www.instagram.com/realadambeyer/",
    website: "https://open.spotify.com/artist/1btv9qmIpbp7q1ixCYNdHu",
    bio: "Techno. Drumcode. YT @adambeyer — IG @realadambeyer, TikTok @adamdrumcodebeyer, Spotify artist hub.",
  },
  {
    slug: "dijon",
    name: "DIJON",
    accent: "#f4a261",
    soundcloud: null,
    instagram: "https://www.instagram.com/dijondijon_/",
    twitter: "https://x.com/dijondijon_",
    website: "https://dijondijon.com",
    bio: "US. Official dijondijon.com — YT @dijon / @DIJONDIJON, IG @dijondijon_, X @dijondijon_. Not the Paris club Djoon.",
  },
  {
    slug: "dom-dolla",
    name: "Dom Dolla",
    accent: "#ff4d6d",
    soundcloud: "https://soundcloud.com/domdolla",
    youtube: "https://www.youtube.com/@DomDolla",
    instagram: "https://www.instagram.com/domdolla/",
    twitter: "https://x.com/domdolla",
    website: "https://domdolla.com.au",
    bio: "Tech House. Melbourne. Official domdolla.com.au — YT @DomDolla, IG/TikTok @domdolla, X @domdolla, FB domdollamusic, SC domdolla.",
  },
  {
    slug: "chris-lorenzo",
    name: "Chris Lorenzo",
    accent: "#ff6b35",
    soundcloud: "https://soundcloud.com/chris-lorenzo-1",
    youtube: "https://www.youtube.com/@ChrisLorenzo",
    instagram: "https://www.instagram.com/chrislorenzo66/",
    twitter: "https://x.com/Lorenzosbeats",
    website: "https://chrislorenzo.komi.io",
    bio: "Tech House. UK. Songstats #TechHouse — YT @ChrisLorenzo, IG @chrislorenzo66, X @Lorenzosbeats, FB chrislorenzo88, SC chris-lorenzo-1, Spotify artist hub.",
  },
  {
    slug: "hannah-wants",
    name: "Hannah Wants",
    accent: "#ff4d8d",
    soundcloud: "https://soundcloud.com/hannah_wants",
    youtube: "https://www.youtube.com/@HannahWantsDJ",
    instagram: "https://www.instagram.com/hannah_wants/",
    twitter: "https://x.com/hannah_wants",
    website: "https://www.musicglue.com/hannah-wants/",
    bio: "Tech House. UK. YT @HannahWantsDJ — IG/X @hannah_wants, FB hannahwantsdj, SC hannah_wants, Spotify artist hub.",
  },
  {
    slug: "dimitri-vegas-like-mike",
    name: "Dimitri Vegas & Like Mike",
    accent: "#f7b801",
    soundcloud: "https://soundcloud.com/dimitrivegasandlikemike",
    youtube: "https://www.youtube.com/@dimitrivegasandlikemike",
    instagram: "https://www.instagram.com/dimitrivegasandlikemike/",
    website: "https://www.youtube.com/@dimitrivegasandlikemike",
    bio: "Big Room. Belgium / Tomorrowland. YT @dimitrivegasandlikemike — IG/FB/TikTok @dimitrivegasandlikemike, SC dimitrivegasandlikemike.",
  },
  {
    slug: "msendy",
    name: "Msendy",
    accent: "#2a9d8f",
    soundcloud: "https://soundcloud.com/msandi",
    instagram: null,
    website: "https://www.mixcloud.com/Msendy/",
    bio: "Deep House. Mixcloud Msendy / Deep Perspectives — SC msandi, hearthis.at/tjzqnmf7.",
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
  let n = 0;
  for (const a of ARTIST_ROSTER) {
    const url = youtubeChannelUrl(a.youtube?.handle ?? "");
    if (!url) continue;
    const slug = slugify(a.name);
    const existing = await prisma.dj.findUnique({ where: { slug } });
    if (!existing) continue;
    if (existing.youtube === url) continue;
    // Prefer roster channel over empty / stale non-channel watch URLs.
    if (
      existing.youtube &&
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
