/**
 * Canonical venue/event resolution.
 *
 * Seed + curated maps own stable slugs (e.g. edc-lv). Source titles that say
 * "EDC" / "EDC Las Vegas 2026" must land on that same Event — not a fork like
 * edc-las-vegas with zero website / zero discovery.
 */

import { inferListClubEvent } from "./discovery/clubLists";
import {
  inferDjMagClubEvent,
  resolveDjMagClubByName,
} from "./discovery/djmagClubs";
import { inferDjMagFestivalEvent } from "./discovery/djmagFestivals";

export type EventSocials = {
  website?: string;
  soundcloud?: string;
  instagram?: string;
  twitter?: string;
};

export type CanonicalEvent = {
  slug: string;
  name: string;
  kind: string;
  location?: string;
} & EventSocials;

/** Curated festival / venue URLs — never invent hosts. */
export const KNOWN_EVENTS: Record<string, CanonicalEvent> = {
  "edc-lv": {
    slug: "edc-lv",
    name: "EDC Las Vegas",
    kind: "festival",
    location: "Las Vegas Motor Speedway",
    website: "https://lasvegas.edc.com/",
    instagram: "https://www.instagram.com/edc_lasvegas/",
    twitter: "https://x.com/EDC_LasVegas",
  },
  "ultra-miami": {
    slug: "ultra-miami",
    name: "Ultra Music Festival",
    kind: "festival",
    location: "Bayfront Park, Miami",
    website: "https://ultramusicfestival.com/",
    instagram: "https://www.instagram.com/ultra/",
    twitter: "https://x.com/ultra",
  },
  "hard-summer": {
    slug: "hard-summer",
    name: "HARD Summer",
    kind: "festival",
    location: "Hollywood Park, Los Angeles",
    website: "https://hardfest.com/",
    instagram: "https://www.instagram.com/hardfest/",
    twitter: "https://x.com/hardfest",
    soundcloud: "https://soundcloud.com/hardfest",
  },
  coachella: {
    slug: "coachella",
    name: "Coachella",
    kind: "festival",
    location: "Empire Polo Club, Indio",
    website: "https://www.coachella.com/",
  },
  lollapalooza: {
    slug: "lollapalooza",
    name: "Lollapalooza",
    kind: "festival",
    location: "Grant Park, Chicago",
    website: "https://www.lollapalooza.com/",
  },
  "brooklyn-mirage": {
    slug: "brooklyn-mirage",
    name: "The Brooklyn Mirage",
    kind: "club",
    location: "Brooklyn, New York",
    website: "https://www.avantgardner.com/",
  },
  tomorrowland: {
    slug: "tomorrowland",
    name: "Tomorrowland",
    kind: "festival",
    location: "Boom, Belgium",
    website: "https://www.tomorrowland.com/",
    // Lineup page scanned every deep ingest (CDN + HTML + seed fallback).
    // See discovery/lineupSources.ts
  },
  "burning-man": {
    slug: "burning-man",
    name: "Burning Man",
    kind: "festival",
    location: "Black Rock City, Nevada",
    website: "https://burningman.org/",
  },
  "boiler-room": {
    slug: "boiler-room",
    name: "Boiler Room",
    kind: "livestream",
    website: "https://boilerroom.tv/",
  },
  cercle: {
    slug: "cercle",
    name: "Cercle",
    kind: "livestream",
    website: "https://www.cercle.io/",
  },
  mixmag: {
    slug: "mixmag",
    name: "Mixmag",
    kind: "livestream",
    website: "https://mixmag.net/",
  },
  "dj-mag": {
    slug: "dj-mag",
    name: "DJ Mag",
    kind: "livestream",
    website: "https://djmag.com/livesets",
    soundcloud: "https://soundcloud.com/djmag",
  },
  insomniac: {
    slug: "insomniac",
    name: "Insomniac",
    kind: "livestream",
    website: "https://www.insomniac.com/",
  },
  "nocturnal-wonderland": {
    slug: "nocturnal-wonderland",
    name: "Nocturnal Wonderland",
    kind: "festival",
    location: "San Bernardino, CA",
    website: "https://nocturnalwonderland.com/",
  },
  "beyond-wonderland": {
    slug: "beyond-wonderland",
    name: "Beyond Wonderland",
    kind: "festival",
    location: "San Bernardino, CA",
    website: "https://beyondwonderland.com/",
  },
  "escape-halloween": {
    slug: "escape-halloween",
    name: "Escape Halloween",
    kind: "festival",
    location: "San Bernardino, CA",
    website: "https://escapepsychocircus.com/",
  },
  dreamstate: {
    slug: "dreamstate",
    name: "Dreamstate",
    kind: "festival",
    location: "San Bernardino, CA",
    // Insomniac SoCal brand site (not dreamstate.eu).
    // Hub: https://www.insomniac.com/events/our-world/dreamstate/
    website: "https://socal.dreamstateusa.com/",
  },
  "countdown-nye": {
    slug: "countdown-nye",
    name: "Countdown NYE",
    kind: "festival",
    location: "San Bernardino, CA",
    website: "https://countdownnye.com/",
  },
  djoon: {
    slug: "djoon",
    name: "Djoon",
    kind: "club",
    location: "Paris, France",
    website: "https://shotgun.live/venues/djoonclub",
    instagram: "https://www.instagram.com/djoonclub/",
  },
  defected: {
    slug: "defected",
    name: "Defected",
    kind: "livestream",
    website: "https://defected.com/",
    instagram: "https://www.instagram.com/defectedrecords/",
    twitter: "https://x.com/defectedrec",
  },
  "ushuaia-ibiza": {
    slug: "ushuaia-ibiza",
    name: "Ushuaïa Ibiza",
    kind: "club",
    location: "Playa d'en Bossa, Ibiza",
    website: "https://www.theushuaiaexperience.com/en/club",
    instagram: "https://www.instagram.com/ushuaiaibiza/",
    twitter: "https://twitter.com/ushuaiaibiza",
  },
  stereohype: {
    slug: "stereohype",
    name: "STEREOHYPE",
    kind: "livestream",
    location: "London, UK",
    website: "https://www.stereohype.com/",
    soundcloud: "https://soundcloud.com/stereohypeglobal",
    instagram: "https://www.instagram.com/stereohype/",
  },
};

/** Alternate name/slug keys → canonical slug. */
const ALIAS_TO_SLUG: Record<string, string> = {
  edc: "edc-lv",
  "edc-lv": "edc-lv",
  "edc-las-vegas": "edc-lv",
  "edc-lasvegas": "edc-lv",
  "edc-vegas": "edc-lv",
  "electric-daisy-carnival": "edc-lv",
  "electric-daisy-carnival-las-vegas": "edc-lv",
  ultra: "ultra-miami",
  "ultra-music-festival": "ultra-miami",
  hard: "hard-summer",
  hardfest: "hard-summer",
  "hard-fest": "hard-summer",
  "hard-summer-music-festival": "hard-summer",
  "holy-ship": "hard-summer",
  "boilerroom": "boiler-room",
  "boiler-room": "boiler-room",
  "dj-mag": "dj-mag",
  djmag: "dj-mag",
  "djmag-com": "dj-mag",
  mixmag: "mixmag",
  ushuaia: "ushuaia-ibiza",
  "ushuaia-ibiza": "ushuaia-ibiza",
  "ushuaiaibiza": "ushuaia-ibiza",
  stereohype: "stereohype",
  "stereo-hype": "stereohype",
  nocturnal: "nocturnal-wonderland",
  "nocturnal-wonderland": "nocturnal-wonderland",
  beyond: "beyond-wonderland",
  "beyond-wonderland": "beyond-wonderland",
  "beyond-wonderland-socal": "beyond-wonderland",
  escape: "escape-halloween",
  "escape-halloween": "escape-halloween",
  dreamstate: "dreamstate",
  "dreamstate-socal": "dreamstate",
  "dreamstate-usa": "dreamstate",
  dreamstateusa: "dreamstate",
  "dreamstate-us": "dreamstate",
  countdown: "countdown-nye",
  "countdown-nye": "countdown-nye",
  djoon: "djoon",
  djøøn: "djoon",
  "djoon-club": "djoon",
  "burning-man": "burning-man",
  burningman: "burning-man",
  "burning-man-festival": "burning-man",
  tomorrowland: "tomorrowland",
  "tomorrowland-belgium": "tomorrowland",
  "tomorrowland-belgium-2026": "tomorrowland",
  "tomorrowland-winter": "tomorrowland",
  "tomorrowland-brasil": "tomorrowland",
  "tomorrowland-brazil": "tomorrowland",
};

function keyOf(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function resolveEvent(
  name: string,
  opts?: { kind?: string; location?: string },
): CanonicalEvent {
  // Title / display-name heuristics first (e.g. "Tomorrowland Belgium").
  const inferred = inferFestivalEvent(name);
  if (inferred) {
    return {
      ...inferred,
      kind: opts?.kind || inferred.kind,
      location: opts?.location || inferred.location,
    };
  }

  const key = keyOf(name);
  const slug = ALIAS_TO_SLUG[key] ?? key;
  const known = KNOWN_EVENTS[slug];
  if (known) {
    return {
      ...known,
      kind: opts?.kind || known.kind,
      location: opts?.location || known.location,
    };
  }
  const club = resolveDjMagClubByName(name);
  if (club) {
    return {
      ...club,
      kind: opts?.kind || club.kind,
      location: opts?.location || club.location,
    };
  }
  return {
    slug,
    name: name.trim(),
    kind: opts?.kind ?? "event",
    location: opts?.location,
  };
}

/**
 * When a set title clearly names a festival / top club, attach that Event
 * instead of (or ahead of) a generic livestream channel brand.
 */
export function inferFestivalEvent(title: string): CanonicalEvent | null {
  const t = title.replace(/\s+/g, " ").trim();
  if (/\bedc\b/i.test(t) && !/\bedc\s*mexico\b|\bedc\s*orlando\b|\bedc\s*china\b/i.test(t)) {
    return KNOWN_EVENTS["edc-lv"];
  }
  if (/\bultra\b/i.test(t) && /\b(miami|music festival|umf)\b/i.test(t)) {
    return KNOWN_EVENTS["ultra-miami"];
  }
  if (/\bhard\s*(summer|fest|day of the dead|miami|nyc|sf)\b|\bholy\s*ship\b/i.test(t)) {
    return KNOWN_EVENTS["hard-summer"];
  }
  if (/\btomorrowland\b/i.test(t)) return KNOWN_EVENTS.tomorrowland;
  if (/\bburning\s*man\b/i.test(t)) return KNOWN_EVENTS["burning-man"];
  if (/\bcoachella\b/i.test(t)) return KNOWN_EVENTS.coachella;
  if (/\blollapalooza\b/i.test(t)) return KNOWN_EVENTS.lollapalooza;
  if (/\bnocturnal\s*wonderland\b/i.test(t)) {
    return KNOWN_EVENTS["nocturnal-wonderland"];
  }
  if (/\bbeyond\s*wonderland\b/i.test(t)) {
    return KNOWN_EVENTS["beyond-wonderland"];
  }
  if (/\bescape(\s*halloween|\s*psycho)?\b/i.test(t)) {
    return KNOWN_EVENTS["escape-halloween"];
  }
  if (/\bdreamstate\b/i.test(t)) return KNOWN_EVENTS.dreamstate;
  if (/\bcountdown(\s*nye)?\b/i.test(t)) return KNOWN_EVENTS["countdown-nye"];
  if (/\bboiler\s*room\b/i.test(t)) return KNOWN_EVENTS["boiler-room"];
  if (/\bcercle\b/i.test(t)) return KNOWN_EVENTS.cercle;
  // Prefer curated Ushuaïa socials over DJ Mag profile URL.
  if (/\bushua[iï]a\b/i.test(t)) return KNOWN_EVENTS["ushuaia-ibiza"];
  if (/\bstereo\s*hype\b/i.test(t)) return KNOWN_EVENTS.stereohype;
  if (/\bdjoon\b|\bdjøøn\b/i.test(t)) return KNOWN_EVENTS.djoon;
  // DJ Mag Top 100 Festivals / Clubs / other club listicles (not Mixmag.net).
  return (
    inferDjMagFestivalEvent(t) ??
    inferDjMagClubEvent(t) ??
    inferListClubEvent(t)
  );
}

export function eventSocialPayload(e: CanonicalEvent): EventSocials {
  return {
    website: e.website,
    soundcloud: e.soundcloud,
    instagram: e.instagram,
    twitter: e.twitter,
  };
}
