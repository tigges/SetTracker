/**
 * Curated YouTube set URLs / video IDs.
 *
 * Prefer uploads that either:
 * - include a timed tracklist in the description, or
 * - have YouTube Music "songs in this video" credits (Content ID), or
 * - carry a pasted fingerprint tracklist (`fingerprintPlays`)
 *
 * Venue + artist channels are polled separately via `venues.ts` / `artists.ts`.
 */

import {
  FP_JAMES_HYPE_GET_CLOSER_LONDON,
  FP_JAMES_HYPE_GET_CLOSER_LONDON_2,
  type FingerprintSeedRow,
} from "../fingerprint/seeds";
import {
  TL_CLOONEE_PROSPA_DESTINO_2026,
  TL_MARTEN_HORGER_EDC_LV_2023,
  TL_MARTEN_HORGER_PAROOKAVILLE_2026,
} from "../tracklists1001/seeds";
import type { RawArtist } from "../types";
import { slugify } from "../types";

export type YoutubeSetSource = {
  /** 11-char id or full watch URL */
  video: string;
  primaryArtist: RawArtist;
  genre: string;
  type?: "radio" | "festival" | "soundcloud";
  /** Optional override title */
  title?: string;
  seriesName?: string;
  eventName?: string;
  /**
   * Manual fingerprint IDs (ACRCloud / AudD / pasted aha-music analysis).
   * Written as provenance "fingerprint"; never overwrites sourceUrl.
   */
  fingerprintPlays?: FingerprintSeedRow[];
  /**
   * 1001Tracklists rows (browser capture / follow-link). Provenance "1001tl".
   * Used when the upload only links 1001.tl and live HTML is Cloudflare-gated.
   */
  tracklist1001?: FingerprintSeedRow[];
};

function dj(name: string, extra: Partial<RawArtist> = {}): RawArtist {
  return { name, slug: slugify(name), ...extra };
}

function marten(extra: Partial<RawArtist> = {}): RawArtist {
  return dj("Marten Horger", {
    accent: "#ff7a45",
    homeCity: "Berlin, DE",
    ...extra,
  });
}

export const YOUTUBE_SETS: YoutubeSetSource[] = [
  {
    video: "https://www.youtube.com/watch?v=9AfzWCT7bac",
    primaryArtist: marten(),
    genre: "Bass House",
    type: "festival",
    title: "Marten Horger - Pop Up Rave in a Church (Ravensburg)",
    seriesName: "Pop Up Rave",
  },
  {
    video: "https://www.youtube.com/watch?v=ileReNaZW5A",
    primaryArtist: marten(),
    genre: "Bass House",
    type: "festival",
    title: "Marten Horger Live at Academy Los Angeles",
    eventName: "Academy LA",
  },
  {
    video: "https://www.youtube.com/watch?v=4NBHtb4LCKM",
    primaryArtist: marten(),
    genre: "Bass House",
    type: "festival",
    title: "Marten Horger Live from Bootshaus 2023",
    eventName: "Bootshaus",
  },
  {
    video: "https://www.youtube.com/watch?v=GIqtyI5o3qk",
    primaryArtist: marten(),
    genre: "Bass House",
    type: "festival",
    title: "Marten Horger - EDC Las Vegas 2023 Mainstage",
    eventName: "EDC Las Vegas",
    // Description only links https://1001.tl/vfff7hk — seed from browser scrape.
    tracklist1001: TL_MARTEN_HORGER_EDC_LV_2023,
  },
  {
    // Official Tomorrowland upload — B2B; title drives collaborator parse.
    video: "https://www.youtube.com/watch?v=gSNSE5u1M7U",
    primaryArtist: marten(),
    genre: "Bass House",
    type: "festival",
    title: "Dillon Francis B2B Marten Horger - Tomorrowland 2025",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
  },
  {
    // Official Parookaville channel — 1001TL timed list (browser capture).
    video: "https://www.youtube.com/watch?v=EbNRjEFZpDw",
    primaryArtist: marten(),
    genre: "Bass House",
    type: "festival",
    title: "Marten Horger - Parookaville 2026 Mainstage",
    seriesName: "Parookaville",
    eventName: "Parookaville",
    tracklist1001: TL_MARTEN_HORGER_PAROOKAVILLE_2026,
  },
  {
    // Official Cloonee upload; same night as SC clooneeb2bprospa.
    video: "https://www.youtube.com/watch?v=UE6wjxvMRz0",
    primaryArtist: dj("Cloonee", {
      accent: "#ff8c42",
      homeCity: "Dublin, IE",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Cloonee B2B Prospa - Live at Destino, Ibiza",
    eventName: "Music On Destino",
    tracklist1001: TL_CLOONEE_PROSPA_DESTINO_2026,
  },
  {
    video: "https://www.youtube.com/watch?v=9MZz5YazOUo",
    primaryArtist: dj("James Hype", {
      accent: "#ff3d6e",
      homeCity: "Liverpool, UK",
    }),
    genre: "Tech House",
    type: "festival",
    seriesName: "Cafe Mambo",
    eventName: "Cafe Mambo Ibiza",
  },
  {
    video: "https://www.youtube.com/watch?v=rLTCLSsqrXY",
    primaryArtist: dj("James Hype", {
      accent: "#ff3d6e",
      homeCity: "Liverpool, UK",
    }),
    genre: "Tech House",
    type: "festival",
    title: "James Hype SYNC London (Full Set)",
    seriesName: "SYNC",
    eventName: "SYNC London",
  },
  {
    video: "https://www.youtube.com/watch?v=oVOuXYtqi6I",
    primaryArtist: dj("James Hype", {
      accent: "#ff3d6e",
      homeCity: "Liverpool, UK",
    }),
    genre: "Tech House",
    type: "festival",
    title: "James Hype - Get Closer, London - Full Set",
    seriesName: "Get Closer",
    eventName: "Get Closer London",
    fingerprintPlays: FP_JAMES_HYPE_GET_CLOSER_LONDON,
  },
  {
    video: "https://www.youtube.com/watch?v=tBvllfEXio4",
    primaryArtist: dj("James Hype", {
      accent: "#ff3d6e",
      homeCity: "Liverpool, UK",
    }),
    genre: "Tech House",
    type: "festival",
    title: "James Hype - Get Closer, London #2 - Full Set",
    seriesName: "Get Closer",
    eventName: "Get Closer London",
    fingerprintPlays: FP_JAMES_HYPE_GET_CLOSER_LONDON_2,
  },
  {
    video: "https://www.youtube.com/watch?v=i9cNYaOOdwA",
    primaryArtist: dj("James Hype", {
      accent: "#ff3d6e",
      homeCity: "Liverpool, UK",
    }),
    genre: "Tech House",
    type: "festival",
    title: "James Hype live at STEREOHYPE Bucharest, Romania 2023",
    seriesName: "STEREOHYPE",
    eventName: "STEREOHYPE Bucharest",
  },
  {
    video: "https://www.youtube.com/watch?v=HTR2M4QdorM",
    primaryArtist: dj("James Hype", {
      accent: "#ff3d6e",
      homeCity: "Liverpool, UK",
    }),
    genre: "Tech House",
    type: "festival",
    title: "James Hype B2B Tita Lau live at STEREOHYPE Bucharest, Romania 2023",
    seriesName: "STEREOHYPE",
    eventName: "STEREOHYPE Bucharest",
  },
  {
    video: "https://www.youtube.com/watch?v=mTGTcuaGhls",
    primaryArtist: dj("Tita Lau", { accent: "#ff8fab" }),
    genre: "Tech House",
    type: "festival",
    title: "Tita Lau live from STEREOHYPE | Laminor Arena - Bucharest, Romania 2023",
    seriesName: "STEREOHYPE",
    eventName: "STEREOHYPE Bucharest",
  },
  {
    video: "https://www.youtube.com/watch?v=EXKpyYAXtyw",
    primaryArtist: dj("Chris Lake", {
      accent: "#3d8bfd",
      homeCity: "London, UK",
    }),
    genre: "Tech House",
    type: "festival",
    eventName: "Los Angeles Historic Park",
  },
  {
    video: "https://www.youtube.com/watch?v=6v9ByGvQqbY",
    primaryArtist: dj("Oliver Heldens", {
      accent: "#7c5cff",
      homeCity: "Netherlands",
    }),
    genre: "Future House",
    type: "radio",
    seriesName: "Heldeep Radio",
  },
  {
    video: "https://www.youtube.com/watch?v=am7YNM3md2I",
    primaryArtist: dj("ARTBAT", {
      accent: "#6c63ff",
      homeCity: "Kyiv, UA",
    }),
    genre: "Melodic Techno",
    type: "festival",
    title: "ARTBAT live set",
  },
  {
    video: "https://www.youtube.com/watch?v=0psLTNmJM38",
    primaryArtist: dj("Bizarrap", {
      accent: "#f4a261",
      homeCity: "Ramos Mejía, AR",
    }),
    genre: "House",
    type: "festival",
    title:
      "BIZARRAP || LIVE @ ULTRA MIAMI MAIN STAGE 2026 (ft. Skrillex & Daddy Yankee)",
    seriesName: "Ultra Shows",
    eventName: "Ultra Music Festival",
  },
  {
    video: "https://www.youtube.com/watch?v=g1vH9C_o-vo",
    primaryArtist: dj("Solomun", {
      accent: "#f0e6d8",
      homeCity: "Hamburg, DE",
    }),
    genre: "Melodic House",
    type: "festival",
    title: "Solomun Live at EDC Las Vegas 2026 (Official Full Set)",
    eventName: "EDC Las Vegas",
  },
  {
    video: "https://www.youtube.com/watch?v=ObiAocVMTyo",
    primaryArtist: dj("Odd Mob", {
      accent: "#b8f200",
      homeCity: "Brisbane, AU",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Odd Mob at Seismic Dance Event 8.0 | Full Set (Volcano Stage)",
    eventName: "Seismic Dance Event",
  },
];
