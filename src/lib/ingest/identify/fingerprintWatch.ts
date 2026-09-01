/**
 * Fan / unofficial watch URLs that may be sampled for Identify only.
 * Never become sourceUrl, playbackUrl, or TRACKLIST_1001_BY_SOURCE_SLUG keys.
 */

export type FingerprintOnlyWatch = {
  seed: string;
  youtubeUrl: string;
  videoId: string;
  channel: string;
  official: false;
  /** Cue offsets (sec) that 1001 left as bare ID. */
  idOffsetsSec: number[];
  note: string;
};

export const FINGERPRINT_ONLY_WATCH: FingerprintOnlyWatch[] = [
  {
    seed: "TL_KNOCK2_ZEDD_HARD_SUMMER_2026",
    youtubeUrl: "https://www.youtube.com/watch?v=6DC3xoQF4Zs",
    videoId: "6DC3xoQF4Zs",
    channel: "DerekD2",
    official: false,
    idOffsetsSec: [17 * 60 + 15, 1 * 3600 + 11 * 60 + 28],
    note: "Fan 4K on 1001. Identify probe only — never official playback wire or FileScan as official.",
  },
  {
    seed: "TL_CHRIS_LORENZO_STEREOBLOOM_EDC_MEXICO_2026",
    youtubeUrl: "https://www.youtube.com/watch?v=b8o4lj_sEpQ", // pragma: allowlist secret
    videoId: "b8o4lj_sEpQ", // pragma: allowlist secret
    channel: "Toñito Digital",
    official: false,
    idOffsetsSec: [],
    note: "Fan EDC Mexico live-broadcast (Toñito Digital). Identify-only — never official playback, YOUTUBE_SETS, or TRACKLIST_1001_BY_SOURCE_SLUG. Official artist is @ChrisLorenzo / chris-lorenzo-1.", // pragma: allowlist secret
  },
  {
    seed: "TL_VALENTINO_KHAN_REVEL_ALBUQUERQUE_2026",
    youtubeUrl: "https://www.youtube.com/watch?v=6ZN3aI2o2OY",
    videoId: "6ZN3aI2o2OY",
    channel: "Wine House Music TV",
    official: false,
    idOffsetsSec: [],
    note: "Third-party Revel Albuquerque upload (@WineHouseMusicTV). Identify-only — never official playback, YOUTUBE_SETS, or TRACKLIST_1001_BY_SOURCE_SLUG. Official artist is @ValentinoKhan.",
  },
  {
    seed: "TL_JAUZ_GET_CRANKED_BILL_GRAHAM_SF_2025",
    youtubeUrl: "https://www.youtube.com/watch?v=HeEW36GRsPQ",
    videoId: "HeEW36GRsPQ",
    channel: "Crawford_RECAPS",
    official: false,
    idOffsetsSec: [],
    note: "Fan recap (@crawfordrecap), first ~20 minutes only. Identify-only — never official playback, YOUTUBE_SETS, or TRACKLIST_1001_BY_SOURCE_SLUG. Official artist is @jauzofficial.",
  },
];

export function isFingerprintOnlyVideoId(id: string): boolean {
  return FINGERPRINT_ONLY_WATCH.some((w) => w.videoId === id);
}

export function isFingerprintOnlyWatchUrl(url: string): boolean {
  const m = url.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
  return m ? isFingerprintOnlyVideoId(m[1]!) : false;
}

export type FingerprintIdProbe = {
  seed: string;
  youtubeUrl: string;
  videoId: string;
  offsetSec: number;
  note: string;
};

/** ACR Identify offsets for held ID rows — does not create a catalog set. */
export function fingerprintIdProbes(
  watches = FINGERPRINT_ONLY_WATCH,
): FingerprintIdProbe[] {
  const out: FingerprintIdProbe[] = [];
  for (const w of watches) {
    for (const offsetSec of w.idOffsetsSec) {
      out.push({
        seed: w.seed,
        youtubeUrl: w.youtubeUrl,
        videoId: w.videoId,
        offsetSec,
        note: w.note,
      });
    }
  }
  return out;
}
