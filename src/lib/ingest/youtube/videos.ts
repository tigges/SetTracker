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
import { TL_MARTEN_HORGER_EDC_LV_2023 } from "../tracklists1001/seeds";
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
    // Official Parookaville channel — YT Music credits; denser 1001TL on #56.
    video: "https://www.youtube.com/watch?v=EbNRjEFZpDw",
    primaryArtist: marten(),
    genre: "Bass House",
    type: "festival",
    title: "Marten Horger - Parookaville 2026 Mainstage",
    seriesName: "Parookaville",
    eventName: "Parookaville",
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
  {
    // Artist upload — also in @Biscits "Live Streams" playlist.
    video: "https://www.youtube.com/watch?v=l7Ytbzj7uGo",
    primaryArtist: dj("BISCITS", {
      accent: "#ef476f",
      homeCity: "UK",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Biscits DJ Set - EDC Vegas 2025",
    seriesName: "EDC Las Vegas",
    eventName: "EDC Las Vegas",
  },
  {
    video: "https://www.youtube.com/watch?v=FH7lIOv1s3Q",
    primaryArtist: dj("Black Coffee", {
      accent: "#222222",
      homeCity: "South Africa",
    }),
    genre: "Afro House",
    type: "festival",
    title: "BLACK COFFEE - Mayan Warrior - Burning Man 2025",
    eventName: "Burning Man",
  },
  {
    video: "https://www.youtube.com/watch?v=6VPNizjOyBQ",
    primaryArtist: dj("Walker & Royce", {
      accent: "#9ef01a",
      homeCity: "New York, US",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Walker & Royce | Fresh Start SF 2026",
    eventName: "Fresh Start SF",
  },
  {
    video: "https://www.youtube.com/watch?v=AJbSD2qYmI4",
    primaryArtist: dj("Walker & Royce", {
      accent: "#9ef01a",
      homeCity: "New York, US",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Walker & Royce @ Club Space | April 4 2025",
    eventName: "Club Space Miami",
  },
  {
    video: "https://www.youtube.com/watch?v=8EocK-qw-g8",
    primaryArtist: dj("Walker & Royce", {
      accent: "#9ef01a",
      homeCity: "New York, US",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Walker & Royce b2b VNSSA at Elrow",
    eventName: "Elrow",
  },
  {
    video: "https://www.youtube.com/watch?v=ubQZAmWDAxI",
    primaryArtist: dj("Walker & Royce", {
      accent: "#9ef01a",
      homeCity: "New York, US",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Walker & Royce - Lollapalooza 2024 Full Set",
    eventName: "Lollapalooza",
  },
  {
    video: "https://www.youtube.com/watch?v=H8cUi1fg5rQ",
    primaryArtist: dj("Walker & Royce", {
      accent: "#9ef01a",
      homeCity: "New York, US",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Walker & Royce - live from CRSSD 2024",
    eventName: "CRSSD",
  },
  {
    video: "https://www.youtube.com/watch?v=TDuFnUAo4II",
    primaryArtist: dj("Vintage Culture", {
      accent: "#e85d04",
      homeCity: "Brazil",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Vintage Culture @ Pacha New York City, Affairs (2026)",
    seriesName: "Affairs",
    eventName: "Pacha New York",
  },
  {
    video: "https://www.youtube.com/watch?v=OVex0rm7ZR4",
    primaryArtist: dj("Vintage Culture", {
      accent: "#e85d04",
      homeCity: "Brazil",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Vintage Culture @ Pacha Ibiza, Affairs (2026)",
    seriesName: "Affairs",
    eventName: "Pacha Ibiza",
  },
  {
    video: "https://www.youtube.com/watch?v=xXRjglkAmq8",
    primaryArtist: dj("Vintage Culture", {
      accent: "#e85d04",
      homeCity: "Brazil",
    }),
    genre: "Tech House",
    type: "festival",
    title:
      "Vintage Culture @ Ultra Music Festival Miami 2026 - Resistance Megastructure",
    seriesName: "Ultra Shows",
    eventName: "Ultra Music Festival",
  },
  {
    video: "https://www.youtube.com/watch?v=knJyJPP45dg",
    primaryArtist: dj("Vintage Culture", {
      accent: "#e85d04",
      homeCity: "Brazil",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Vintage Culture Live at EDC Las Vegas, Neon Garden (Club Space)",
    eventName: "EDC Las Vegas",
  },
  {
    video: "https://www.youtube.com/watch?v=kmMYCg-igjc",
    primaryArtist: dj("Vintage Culture", {
      accent: "#e85d04",
      homeCity: "Brazil",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Vintage Culture live @ Só Track Boa Festival, Brasil 2026",
    eventName: "Só Track Boa",
  },
  {
    video: "https://www.youtube.com/watch?v=jnSFLztjm80",
    primaryArtist: dj("Bleu Clair", {
      accent: "#4cc9f0",
      homeCity: "Indonesia",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Bleu Clair at Tomorrowland, Belgium 2023",
    seriesName: "Tomorrowland",
    eventName: "Tomorrowland Belgium",
  },
  {
    video: "https://www.youtube.com/watch?v=c_sx3zum8Z0",
    primaryArtist: dj("Bleu Clair", {
      accent: "#4cc9f0",
      homeCity: "Indonesia",
    }),
    genre: "Tech House",
    type: "festival",
    title: "Bleu Clair live from EDC Las Vegas 2023",
    eventName: "EDC Las Vegas",
  },
  {
    video: "https://www.youtube.com/watch?v=_hdM8uJV1LM",
    primaryArtist: dj("Bleu Clair", {
      accent: "#4cc9f0",
      homeCity: "Indonesia",
    }),
    genre: "Tech House",
    type: "radio",
    title: "Bleu Clair presents BLEUPRINT VOL. 5 (Live from Jakarta)",
    seriesName: "BLEUPRINT",
  },
];
