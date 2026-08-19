/**
 * Curated single SoundCloud track URLs (guestmixes / radio appearances).
 *
 * Use when an artist's own profile is release-only but long-form sets live
 * on radio/label accounts. Parallel to youtube/videos.ts curated seeds.
 */

import {
  FP_KEINEMUSIK_RADIO_FIFI_20260807,
  type FingerprintSeedRow,
} from "../fingerprint/seeds";
import type { RawArtist } from "../types";
import { slugify } from "../types";

export type SoundCloudTrackSeed = {
  /** Full SoundCloud track URL */
  url: string;
  primaryArtist: RawArtist;
  genre: string;
  seriesName?: string;
  type?: "radio" | "festival" | "soundcloud" | "mix";
  /** Skip if shorter (default 15 minutes) */
  minDurationSec?: number;
  /**
   * Manual / ACRCloud Identify rows (provenance "fingerprint").
   * Gap-fills only; never overwrites source/1001tl cues.
   */
  fingerprintPlays?: FingerprintSeedRow[];
};

function dj(name: string, extra: Partial<RawArtist> = {}): RawArtist {
  return { name, slug: slugify(name), ...extra };
}

export const SOUNDCLOUD_TRACK_SEEDS: SoundCloudTrackSeed[] = [
  {
    // Official profile is singles-only; guestmixes live on radio hosts.
    url: "https://soundcloud.com/edmidentity/this-is-home-021-chapter-verse-united-kingdom",
    primaryArtist: dj("Chapter & Verse", {
      accent: "#f77f00",
      homeCity: "UK",
    }),
    genre: "Tech House",
    seriesName: "This Is Home",
    type: "radio",
    minDurationSec: 15 * 60,
  },
  {
    url: "https://soundcloud.com/rogersanchez/release-yourself-radio-show-985-guestmix-chapter-verse",
    primaryArtist: dj("Chapter & Verse", {
      accent: "#f77f00",
      homeCity: "UK",
    }),
    genre: "Tech House",
    seriesName: "Release Yourself Radio",
    type: "radio",
    minDurationSec: 30 * 60,
  },
  {
    // Official SIDEPIECE upload; 1001TL wired via
    // sc-sidepiece-sidepiece-lollapalooza-perry.
    url: "https://soundcloud.com/sidepiece/sidepiece-lollapalooza-perry",
    primaryArtist: dj("SIDEPIECE", {
      accent: "#fee440",
    }),
    genre: "Tech House",
    type: "festival",
    minDurationSec: 15 * 60,
  },
  {
    // Official NOTION Perry's Lollapalooza; 1001TL wired via
    // sc-notiondj-notion-live-at-lollapalooza (same list as yt-9vgSTomhCp8).
    url: "https://soundcloud.com/notiondj/notion-live-at-lollapalooza",
    primaryArtist: dj("NOTION", {
      accent: "#ff006e",
      homeCity: "London, UK",
    }),
    genre: "UK Garage",
    type: "festival",
    minDurationSec: 15 * 60,
  },
  {
    // Official Horger upload; 1001TL wired via
    // sc-marten-horger-tomorrowland-mainstage-2023.
    url: "https://soundcloud.com/marten-horger/tomorrowland-mainstage-2023",
    primaryArtist: dj("Marten Horger", {
      accent: "#ff7a45",
      homeCity: "Berlin, DE",
    }),
    genre: "Bass House",
    type: "festival",
    minDurationSec: 15 * 60,
  },
  {
    // 1001Tracklists exclusive; 1001TL wired via
    // sc-1001tracklists-men-machine-exclusive-mix-2026 (same list as yt-NTLDGnoWIRg).
    url: "https://soundcloud.com/1001tracklists/men-machine-exclusive-mix-2026",
    primaryArtist: dj("Men Machine", {
      accent: "#ff4d6d",
      homeCity: "Paris / Berlin",
    }),
    genre: "Bass House",
    seriesName: "1001Tracklists Exclusive Mix",
    type: "mix",
    minDurationSec: 15 * 60,
  },
  {
    // Official Dom Dolla upload; 1001TL wired via
    // sc-domdolla-dom-dolla-live-creamfields-steel-yard-2025 (same list as yt-NblVVOwQRqw).
    url: "https://soundcloud.com/domdolla/dom-dolla-live-creamfields-steel-yard-2025",
    primaryArtist: dj("Dom Dolla", {
      accent: "#00bbf9",
      homeCity: "Melbourne, AU",
    }),
    genre: "Tech House",
    type: "festival",
    minDurationSec: 15 * 60,
  },
  {
    // Official GDJB upload; 1001TL wired via
    // sc-markusschulz-gdjb-aug132026 (same list as yt-WWnLYZrh6kw).
    url: "https://soundcloud.com/markusschulz/gdjb-aug132026",
    primaryArtist: dj("Markus Schulz", {
      accent: "#4895ef",
      homeCity: "Miami, US",
    }),
    genre: "Trance",
    seriesName: "Global DJ Broadcast", // pragma: allowlist secret
    type: "radio",
    minDurationSec: 30 * 60,
  },
  {
    // Official Hardwell On Air 527 Yearmix; 1001TL wired via
    // sc-hardwell-hardwell-on-air-527-yearmix (same list as yt-OXwK0CSmXzY).
    url: "https://soundcloud.com/hardwell/hardwell-on-air-527-yearmix",
    primaryArtist: dj("Hardwell", {
      accent: "#023e8a",
      homeCity: "Breda, NL",
    }),
    genre: "Big Room",
    seriesName: "Hardwell On Air",
    type: "radio",
    minDurationSec: 30 * 60,
  },
  {
    // Official Smash The House Radio 687; 1001TL wired via
    // sc-dimitrivegasandlikemike-smash-the-house-radio-ep-687
    // (same list as yt-eVjC42MNgkI). Mixcloud is a mirror only:
    // https://www.mixcloud.com/DimitriVegasAndLikeMike/smash-the-house-radio-ep-687/
    url: "https://soundcloud.com/dimitrivegasandlikemike/smash-the-house-radio-ep-687",
    primaryArtist: dj("Dimitri Vegas & Like Mike", {
      accent: "#f7b801",
      homeCity: "Belgium",
    }),
    genre: "Big Room",
    seriesName: "Smash The House Radio",
    type: "radio",
    minDurationSec: 30 * 60,
  },
  {
    // Official Jamie Jones upload; Mixcloud mirror also exists.
    // 1001TL wired via sc-jamie-jones-hot-robot-radio-225.
    url: "https://soundcloud.com/jamie-jones/hot-robot-radio-225",
    primaryArtist: dj("Jamie Jones", {
      accent: "#f72585",
    }),
    genre: "Tech House",
    seriesName: "Hot Robot Radio",
    type: "radio",
    minDurationSec: 30 * 60,
  },
  {
    // Official Jamie Jones upload; Mixcloud mirror also exists.
    // 1001TL wired via sc-jamie-jones-hot-robot-radio-239.
    url: "https://soundcloud.com/jamie-jones/hot-robot-radio-239",
    primaryArtist: dj("Jamie Jones", {
      accent: "#f72585",
    }),
    genre: "Tech House",
    seriesName: "Hot Robot Radio",
    type: "radio",
    minDurationSec: 30 * 60,
  },
  {
    // Official Vintage Culture upload; 1001TL wired via
    // sc-vintageculturemusic-vintage-culture-b2b-arodes-at-burning-man-2024.
    url: "https://soundcloud.com/vintageculturemusic/vintage-culture-b2b-arodes-at-burning-man-2024",
    primaryArtist: dj("Vintage Culture", {
      accent: "#e85d04",
      homeCity: "Brazil",
    }),
    genre: "Tech House",
    type: "festival",
    minDurationSec: 30 * 60,
  },
  {
    // Official Sasha upload; 1001TL wired via
    // sc-sashaofficial-sasha-eclipse-mix-12-8-26.
    url: "https://soundcloud.com/sashaofficial/sasha-eclipse-mix-12-8-26",
    primaryArtist: dj("Sasha", {
      accent: "#4361ee",
    }),
    genre: "Progressive House",
    seriesName: "Eclipse Mix",
    type: "mix",
    minDurationSec: 30 * 60,
  },
  {
    // Official Joel Corry upload; 1001TL wired via sc-joelcorry-edgenyc
    // (same list as yt-soEFl73peVA).
    url: "https://soundcloud.com/joelcorry/edgenyc",
    primaryArtist: dj("Joel Corry", {
      accent: "#4cc9f0",
    }),
    genre: "House",
    type: "festival",
    minDurationSec: 30 * 60,
  },
  {
    // Official Max Styler upload; 1001TL wired via
    // sc-maxstyler-max-styler-live-opulent-temple-burning-man-2024
    // (same list as yt-k4Drn6AwAdk).
    url: "https://soundcloud.com/maxstyler/max-styler-live-opulent-temple-burning-man-2024",
    primaryArtist: dj("Max Styler", {
      accent: "#ff9f1c",
    }),
    genre: "Tech House",
    type: "festival",
    minDurationSec: 30 * 60,
  },
  {
    // Official Hannah Laing upload; 1001TL wired via
    // sc-hannahlaingdj-hannah-laing-creamfields-2024-audio
    // (same list as yt-arowbYnNFGY).
    url: "https://soundcloud.com/hannahlaingdj/hannah-laing-creamfields-2024-audio",
    primaryArtist: dj("Hannah Laing", {
      accent: "#ff006e",
    }),
    genre: "Techno",
    type: "festival",
    minDurationSec: 30 * 60,
  },
  {
    // Official Nora En Pure upload; 1001TL wired via
    // sc-noraenpure-purified-520 (same list as yt-8aDoUu4GDrc).
    url: "https://soundcloud.com/noraenpure/purified-520",
    primaryArtist: dj("Nora En Pure", { accent: "#48cae4" }),
    genre: "Deep House",
    seriesName: "Purified Radio",
    type: "radio",
    minDurationSec: 30 * 60,
  },
  {
    // Official Korolova upload; 1001TL wired via
    // sc-korolovadj-korolova-captive-soul-98 (same list as yt-5JxfEjVdQFk).
    url: "https://soundcloud.com/korolovadj/korolova-captive-soul-98",
    primaryArtist: dj("Korolova", {
      accent: "#f72585",
      homeCity: "Ukraine",
    }),
    genre: "Melodic Techno",
    seriesName: "Captive Soul",
    type: "radio",
    minDurationSec: 30 * 60,
  },
  {
    // Official James Hype upload; 1001TL wired via
    // sc-jameshypethedj-sync-london-full-set (same list as yt-rLTCLSsqrXY).
    url: "https://soundcloud.com/jameshypethedj/sync-london-full-set",
    primaryArtist: dj("James Hype", {
      accent: "#ff3d6e",
      homeCity: "Liverpool, UK",
    }),
    genre: "Tech House",
    type: "festival",
    minDurationSec: 30 * 60,
  },
  {
    // Official Eric Prydz upload; 1001TL wired via
    // sc-eric-prydz-eric-prydz-presents-463760700
    // (same list as yt-JLIYTueL4TI). Mixcloud is a mirror only.
    url: "https://soundcloud.com/eric-prydz/eric-prydz-presents-463760700",
    primaryArtist: dj("Eric Prydz", {
      accent: "#7209b7",
      homeCity: "Sweden",
    }),
    genre: "Progressive House",
    seriesName: "Epic Radio",
    type: "radio",
    minDurationSec: 30 * 60,
  },
  {
    // Official bradeazy upload; 1001TL wired via
    // sc-bradeazy-bradeazy-live-lollapalooza (never sc-https://…).
    url: "https://soundcloud.com/bradeazy/bradeazy-live-lollapalooza",
    primaryArtist: dj("bradeazy", {
      accent: "#3aa0e0",
      homeCity: "Miami, US",
    }),
    genre: "Bass House",
    type: "festival",
    minDurationSec: 15 * 60,
  },
  {
    // Official Amelie Lens upload; 1001TL wired via
    // sc-amelielens-amelie-lens-radio-show-022 (never sc-https://…).
    url: "https://soundcloud.com/amelielens/amelie-lens-radio-show-022",
    primaryArtist: dj("Amelie Lens", {
      accent: "#d00000",
      homeCity: "Belgium",
    }),
    genre: "Techno",
    seriesName: "Amelie Lens Radio Show",
    type: "radio",
    minDurationSec: 30 * 60,
  },
  {
    // Official Keinemusik upload; guest FIFI. ACR Identify rows in
    // fingerprintPlays (never invent 1001 cues). Slug:
    // sc-keinemusik-keinemusik-radio-show-by-fifi-07082026
    url: "https://soundcloud.com/keinemusik/keinemusik-radio-show-by-fifi-07082026",
    primaryArtist: dj("FIFI", {
      accent: "#e8c547",
    }),
    genre: "Afro House",
    seriesName: "Keinemusik Radio",
    type: "radio",
    minDurationSec: 30 * 60,
    fingerprintPlays: FP_KEINEMUSIK_RADIO_FIFI_20260807,
  },
  {
    // Official Keinemusik upload; guest Lazarusman. 1001TL wired via
    // sc-keinemusik-keinemusik-radio-show-by-lazarusman-03072026
    // (never sc-https://…).
    url: "https://soundcloud.com/keinemusik/keinemusik-radio-show-by-lazarusman-03072026",
    primaryArtist: dj("Lazarusman", {
      accent: "#e8c547",
    }),
    genre: "Afro House",
    seriesName: "Keinemusik Radio",
    type: "radio",
    minDurationSec: 30 * 60,
  },
  {
    // Official Oliver Heldens upload; 1001TL wired via
    // sc-oliverheldens-oliver-heldens-daybreak-session-tomorrowland-weekend-1-2024
    // (same list as yt-wuMQeEJ3YnQ). Never wire sc-https://….
    url: "https://soundcloud.com/oliverheldens/oliver-heldens-daybreak-session-tomorrowland-weekend-1-2024",
    primaryArtist: dj("Oliver Heldens", {
      accent: "#7c5cff",
      homeCity: "Netherlands",
    }),
    genre: "Future House",
    type: "festival",
    minDurationSec: 60 * 60,
  },
  {
    // Official Tomorrowland One World Radio upload; 1001TL wired via
    // sc-tomorrowland-mandy-mondays-august-2026. Tomorrowland poll
    // titleMatch does not include "mondays", so this seed is required.
    // Never wire sc-https://…. yt-J7b0G4XX8pg is the TML WE1 B2B Relive.
    url: "https://soundcloud.com/tomorrowland/mandy-mondays-august-2026",
    primaryArtist: dj("MANDY", {
      accent: "#ff006e",
      homeCity: "Belgium",
    }),
    genre: "Hard Dance",
    seriesName: "MANDY Mondays",
    type: "radio",
    minDurationSec: 30 * 60,
  },
  {
    // Official Tomorrowland One World Radio upload; 1001TL wired via
    // sc-tomorrowland-mash-up-universe-djs-from-mars-august-2026.
    // Tomorrowland poll titleMatch does not include "mash-up" / "universe",
    // so this seed is required. Never wire sc-https://….
    url: "https://soundcloud.com/tomorrowland/mash-up-universe-djs-from-mars-august-2026",
    primaryArtist: dj("DJs From Mars", {
      accent: "#ff5a1f",
      homeCity: "Italy",
    }),
    genre: "Electro House",
    seriesName: "Mash-Up Universe",
    type: "radio",
    minDurationSec: 30 * 60,
  },
  {
    // Official Tape B upload; 1001TL wired via
    // sc-tape-b-official-tape-b-cartunes-vol-5 (same list as yt-7_O8N_EJg_c).
    url: "https://soundcloud.com/tape-b-official/tape-b-cartunes-vol-5",
    primaryArtist: dj("Tape B", { accent: "#ffbe0b" }),
    genre: "Bass House",
    seriesName: "CarTunes",
    type: "mix",
    minDurationSec: 45 * 60,
  },
  {
    // Official Mau P upload; 1001TL wired via sc-realmaup-xxx-radio-201.
    // Never wire sc-https://….
    url: "https://soundcloud.com/realmaup/xxx-radio-201",
    primaryArtist: dj("Mau P", { accent: "#118ab2" }),
    genre: "Tech House",
    seriesName: "XXX Radio",
    type: "radio",
    minDurationSec: 45 * 60,
  },
  {
    // Official Vintage Culture upload; 1001TL wired via
    // sc-vintageculturemusic-vintage-culture-robot-heart-residency-2024-california
    // (same list as yt-KbGNocaJDjw). Never wire sc-https://….
    url: "https://soundcloud.com/vintageculturemusic/vintage-culture-robot-heart-residency-2024-california",
    primaryArtist: dj("Vintage Culture", {
      accent: "#e85d04",
      homeCity: "Brazil",
    }),
    genre: "Tech House",
    seriesName: "Robot Heart",
    type: "festival",
    minDurationSec: 90 * 60,
  },
  {
    // Official Claptone upload (CLAPCAST #576). Operator 1001 URL
    // uq8g1pk recorded in known-1001-urls pendingCuePaste — do not
    // scrape or invent 1001tl rows. Description has 14 untimed tracks.
    // Slug: sc-claptone-clapcast-576 (never sc-https://…).
    // Mixcloud https://www.mixcloud.com/Claptone/clapcast-576/ is a mirror.
    url: "https://soundcloud.com/claptone/clapcast-576",
    primaryArtist: dj("Claptone", {
      accent: "#ffd60a",
    }),
    genre: "Deep House",
    seriesName: "Clapcast",
    type: "radio",
    minDurationSec: 30 * 60,
  },
  {
    // Official brandonsounds upload; 1001TL wired via
    // sc-brandonsounds-brandon-live-at-parookaville-2024-desert-valley
    // (same list as yt-AQ6wWT2HaSQ). Never wire sc-https://….
    url: "https://soundcloud.com/brandonsounds/brandon-live-at-parookaville-2024-desert-valley",
    primaryArtist: dj("BRANDON", {
      accent: "#ff5e5e",
      homeCity: "Germany",
    }),
    genre: "Tech House",
    seriesName: "Parookaville",
    type: "festival",
    minDurationSec: 50 * 60,
  },
];
