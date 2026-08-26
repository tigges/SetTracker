/**
 * Hold official SC / YT / Mixcloud links on Set even when playbackUrl
 * is a single ranked embed (SoundCloud > Mixcloud > YouTube).
 *
 * Fill-null only. Never invent URLs. Mixcloud is a stored mirror — no
 * mixcloud set slug and no Mixcloud crawl.
 */

import type { PrismaClient } from "@prisma/client";
import {
  hostUrlFillNull,
  hostUrlsFromKnown,
  mergeHostUrlFields,
  mixcloudPageUrl,
  soundcloudPageUrl,
  youtubeWatchUrl,
  type SetHostUrls,
} from "../playback";
import { hostUrlsFromText } from "./hearthis/playback";
import { SOUNDCLOUD_TRACK_SEEDS } from "./soundcloud/tracks";
import { SET_SOURCE_REMAPS } from "./sourceRemaps";
import { TRACKLIST_1001_BY_SOURCE_SLUG } from "./tracklists1001/festival2026";
import { slugify } from "./types";

export type { SetHostUrls };

/** Producer-documented extra hosts. Never invent Mixcloud / SC / YT URLs. */
export const SET_HOST_PINS: Record<string, SetHostUrls> = {
  "sc-jamie-jones-hot-robot-radio-225": {
    mixcloudUrl: "https://www.mixcloud.com/JamieJones/hot-robot-radio-225/",
  },
  "sc-jamie-jones-hot-robot-radio-239": {
    mixcloudUrl: "https://www.mixcloud.com/JamieJones/hot-robot-radio-239/",
  },
  "sc-claptone-clapcast-576": {
    mixcloudUrl: "https://www.mixcloud.com/Claptone/clapcast-576/",
  },
  "yt-eVjC42MNgkI": {
    mixcloudUrl:
      "https://www.mixcloud.com/DimitriVegasAndLikeMike/smash-the-house-radio-ep-687/",
  },
  "sc-dimitrivegasandlikemike-smash-the-house-radio-ep-687": {
    mixcloudUrl:
      "https://www.mixcloud.com/DimitriVegasAndLikeMike/smash-the-house-radio-ep-687/",
  },
  "yt-JLIYTueL4TI": {
    mixcloudUrl: "https://www.mixcloud.com/ericprydz-epicradio/epic-radio-036/",
  },
  "sc-eric-prydz-eric-prydz-presents-463760700": {
    mixcloudUrl: "https://www.mixcloud.com/ericprydz-epicradio/epic-radio-036/",
  },
  "yt-NTLDGnoWIRg": {
    mixcloudUrl:
      "https://www.mixcloud.com/1001Tracklists/david-gueta-marten-hørger-pres-men-machine-1001tracklists-exclusive-mix/",
  },
  "sc-1001tracklists-men-machine-exclusive-mix-2026": {
    mixcloudUrl:
      "https://www.mixcloud.com/1001Tracklists/david-gueta-marten-hørger-pres-men-machine-1001tracklists-exclusive-mix/",
  },
  "yt-FQj71mhobYw": {
    soundcloudUrl:
      "https://soundcloud.com/korolovadj/joris-voorn-b2b-korolova-live",
    mixcloudUrl:
      "https://www.mixcloud.com/UMFradio/umf-radio-883-joris-voorn-b2b-korolova/",
  },
  "sc-korolovadj-joris-voorn-b2b-korolova-live": {
    soundcloudUrl:
      "https://soundcloud.com/korolovadj/joris-voorn-b2b-korolova-live",
    mixcloudUrl:
      "https://www.mixcloud.com/UMFradio/umf-radio-883-joris-voorn-b2b-korolova/",
  },
  "yt-2BPWWYAgUE4": {
    soundcloudUrl: "https://soundcloud.com/innellea/colyn-b2b-innella-at-ultra",
  },
  "sc-innellea-colyn-b2b-innella-at-ultra": {
    soundcloudUrl: "https://soundcloud.com/innellea/colyn-b2b-innella-at-ultra",
  },
  "yt-KAZd25mCHp8": {
    soundcloudUrl:
      "https://soundcloud.com/rose-ringed/rose-ringed-freedomstage-we1",
  },
  "sc-rose-ringed-rose-ringed-freedomstage-we1": {
    soundcloudUrl:
      "https://soundcloud.com/rose-ringed/rose-ringed-freedomstage-we1",
  },
  // AFROJACK & R3HAB @ Mainstage, Tomorrowland WE2 2026-07-26. One
  // performance on three slugs: @tomorrowland and R3HAB's own YouTube plus
  // R3HAB's SoundCloud. The SC permalink is not a SOUNDCLOUD_TRACK_SEEDS
  // entry, so without these pins the YouTube rows carry no soundcloudUrl and
  // the twin fold cannot prefer SC playback.
  // Verified 2026-08-26: 200, og:title "R3HAB B2B AFROJACK @ TOMORROWLAND
  // BELGIUM W2".
  "yt-AjQeohYmg3A": {
    soundcloudUrl: "https://soundcloud.com/r3hab/r3hab-b2b-afrojack",
  },
  "yt-lEIGnx7qLl0": {
    soundcloudUrl: "https://soundcloud.com/r3hab/r3hab-b2b-afrojack",
  },
  "sc-r3hab-r3hab-b2b-afrojack": {
    soundcloudUrl: "https://soundcloud.com/r3hab/r3hab-b2b-afrojack",
  },
};

export function soundcloudSlugFromUrl(url: string): string | null {
  const page = soundcloudPageUrl(url);
  if (!page) return null;
  try {
    const u = new URL(page);
    const [user, permalink] = u.pathname.split("/").filter(Boolean);
    if (!user || !permalink) return null;
    return `sc-${user}-${slugify(permalink)}`.slice(0, 120);
  } catch {
    return null;
  }
}

export function youtubeUrlFromSlug(slug: string): string | null {
  if (!slug.startsWith("yt-")) return null;
  return youtubeWatchUrl(`https://www.youtube.com/watch?v=${slug.slice(3)}`);
}

function soundcloudUrlBySlug(): Map<string, string> {
  const out = new Map<string, string>();
  for (const seed of SOUNDCLOUD_TRACK_SEEDS) {
    const slug = soundcloudSlugFromUrl(seed.url);
    const page = soundcloudPageUrl(seed.url);
    if (slug && page) out.set(slug, page);
  }
  return out;
}

function canonicalizePin(pin: SetHostUrls): SetHostUrls {
  return {
    soundcloudUrl: pin.soundcloudUrl
      ? soundcloudPageUrl(pin.soundcloudUrl)
      : null,
    youtubeUrl: pin.youtubeUrl ? youtubeWatchUrl(pin.youtubeUrl) : null,
    mixcloudUrl: pin.mixcloudUrl ? mixcloudPageUrl(pin.mixcloudUrl) : null,
  };
}

let extrasCache: Record<string, SetHostUrls> | null = null;

/**
 * Keep every official SC / YT / Mixcloud permalink already on the
 * performance. One ranked embed stays on playbackUrl — unused hosts
 * are stored, never invented, never crawled as a second set.
 */
export function harvestSetHostUrls(input: {
  slug?: string;
  playbackUrl?: string | null;
  sourceUrl?: string | null;
  soundcloudUrl?: string | null;
  youtubeUrl?: string | null;
  mixcloudUrl?: string | null;
  text?: string | null;
}): SetHostUrls {
  return mergeHostUrlFields(
    hostUrlsFromKnown(
      input.playbackUrl,
      input.sourceUrl,
      input.soundcloudUrl,
      input.youtubeUrl,
      input.mixcloudUrl,
    ),
    hostUrlsFromText(input.text),
    input.slug ? (extraHostUrlsBySlug()[input.slug] ?? {}) : {},
  );
}

/** Extra official hosts keyed by set slug (twins + documented Mixcloud). */
export function extraHostUrlsBySlug(): Record<string, SetHostUrls> {
  if (extrasCache) return extrasCache;
  const scBySlug = soundcloudUrlBySlug();
  const grouped = new Map<object, string[]>();
  for (const [slug, rows] of Object.entries(TRACKLIST_1001_BY_SOURCE_SLUG)) {
    if (!rows?.length) continue;
    const list = grouped.get(rows) ?? [];
    list.push(slug);
    grouped.set(rows, list);
  }

  const out: Record<string, SetHostUrls> = {};
  const assign = (slug: string, extra: SetHostUrls) => {
    out[slug] = hostUrlFillNull({}, out[slug] ?? {}, extra);
  };

  for (const slugs of grouped.values()) {
    const shared: SetHostUrls = {};
    for (const slug of slugs) {
      const yt = youtubeUrlFromSlug(slug);
      if (yt) shared.youtubeUrl ??= yt;
      const sc = scBySlug.get(slug);
      if (sc) shared.soundcloudUrl ??= sc;
      const pin = SET_HOST_PINS[slug];
      if (pin) {
        const canon = canonicalizePin(pin);
        shared.soundcloudUrl ??= canon.soundcloudUrl;
        shared.youtubeUrl ??= canon.youtubeUrl;
        shared.mixcloudUrl ??= canon.mixcloudUrl;
      }
    }
    for (const slug of slugs) assign(slug, shared);
  }

  for (const [slug, pin] of Object.entries(SET_HOST_PINS)) {
    assign(slug, canonicalizePin(pin));
  }

  for (const remap of SET_SOURCE_REMAPS) {
    const fromYt = youtubeUrlFromSlug(remap.fromSlug);
    const toYt = youtubeUrlFromSlug(remap.toSlug);
    const fromSc = scBySlug.get(remap.fromSlug);
    const shared = hostUrlFillNull(
      {},
      out[remap.fromSlug] ?? {},
      out[remap.toSlug] ?? {},
      {
        youtubeUrl: toYt ?? fromYt,
        soundcloudUrl: fromSc,
      },
      canonicalizePin(SET_HOST_PINS[remap.fromSlug] ?? {}),
      canonicalizePin(SET_HOST_PINS[remap.toSlug] ?? {}),
      hostUrlsFromKnown(remap.playbackUrl, remap.sourceUrl),
    );
    assign(remap.fromSlug, shared);
    assign(remap.toSlug, shared);
  }

  extrasCache = out;
  return out;
}

/**
 * Official SC / YT / Mixcloud player URLs for one performance.
 * Used to look up MixesDB / share tracklists — never invents clocks.
 */
export function playerUrlsForSet(
  input: {
    slug?: string;
    playbackUrl?: string | null;
    sourceUrl?: string | null;
    soundcloudUrl?: string | null;
    youtubeUrl?: string | null;
    mixcloudUrl?: string | null;
  },
  extras = extraHostUrlsBySlug(),
): string[] {
  const hosts = mergeHostUrlFields(
    hostUrlsFromKnown(
      input.playbackUrl,
      input.sourceUrl,
      input.soundcloudUrl,
      input.youtubeUrl,
      input.mixcloudUrl,
    ),
    input.slug ? (extras[input.slug] ?? {}) : {},
  );
  const out: string[] = [];
  for (const url of [
    hosts.soundcloudUrl,
    hosts.youtubeUrl,
    hosts.mixcloudUrl,
  ]) {
    if (url && !out.includes(url)) out.push(url);
  }
  return out;
}

export function hostUrlsForSlug(
  slug: string,
  ...known: Array<string | null | undefined>
): SetHostUrls {
  return hostUrlFillNull(
    {},
    hostUrlsFromKnown(...known),
    extraHostUrlsBySlug()[slug] ?? {},
  );
}

/** Fill-null Set.soundcloudUrl / youtubeUrl / mixcloudUrl. Leaves playbackUrl. */
export async function applySetHostUrls(
  prisma: PrismaClient,
): Promise<{ scanned: number; filled: number }> {
  const extras = extraHostUrlsBySlug();
  const sets = await prisma.set.findMany({
    select: {
      id: true,
      slug: true,
      playbackUrl: true,
      sourceUrl: true,
      soundcloudUrl: true,
      youtubeUrl: true,
      mixcloudUrl: true,
    },
  });
  let filled = 0;
  for (const row of sets) {
    const patch = hostUrlFillNull(
      {
        soundcloudUrl: row.soundcloudUrl,
        youtubeUrl: row.youtubeUrl,
        mixcloudUrl: row.mixcloudUrl,
      },
      harvestSetHostUrls({
        slug: row.slug,
        playbackUrl: row.playbackUrl,
        sourceUrl: row.sourceUrl,
      }),
      extras[row.slug] ?? {},
    );
    if (!Object.keys(patch).length) continue;
    await prisma.set.update({ where: { id: row.id }, data: patch });
    filled += 1;
  }
  return { scanned: sets.length, filled };
}
