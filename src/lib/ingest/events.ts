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
    instagram: "https://instagram.com/coachella",
    twitter: "https://x.com/coachella",
  },
  lollapalooza: {
    slug: "lollapalooza",
    name: "Lollapalooza",
    kind: "festival",
    location: "Grant Park, Chicago",
    website: "https://www.lollapalooza.com/",
    instagram: "https://instagram.com/lollapalooza",
    twitter: "https://x.com/lollapalooza",
  },
  "lollapalooza-chile": {
    slug: "lollapalooza-chile",
    name: "Lollapalooza Chile",
    kind: "festival",
    location: "Chile",
    // No official site in the operator paste — do not invent a host.
    // Banco de Chile Stage is a stage, not a separate event.
  },
  "brooklyn-mirage": {
    slug: "brooklyn-mirage",
    name: "The Brooklyn Mirage",
    kind: "club",
    location: "Brooklyn, New York",
    website: "https://www.avantgardner.com/",
    instagram: "https://instagram.com/thebrooklynmirage",
  },
  elrow: {
    slug: "elrow",
    name: "elrow",
    kind: "club",
    location: "various",
    website: "https://elrow.com/",
    instagram: "https://www.instagram.com/elrowofficial/",
    twitter: "https://x.com/elrow_",
  },
  "pacha-ibiza": {
    slug: "pacha-ibiza",
    name: "Pacha Ibiza",
    kind: "club",
    location: "Ibiza, Spain",
    website: "https://www.pacha.com/",
  },
  "amnesia-ibiza": {
    slug: "amnesia-ibiza",
    name: "Amnesia Ibiza",
    kind: "club",
    location: "San Rafael, Ibiza",
    website: "https://www.amnesia.es/",
  },
  "amnesia-cap-dagde": {
    slug: "amnesia-cap-dagde",
    name: "Amnesia Cap d'Agde",
    kind: "club",
    location: "Cap d'Agde, France",
    website: "https://amnesia.fr/",
  },
  "warehouse-project": {
    slug: "warehouse-project",
    name: "The Warehouse Project",
    kind: "club",
    location: "Manchester, UK",
    website: "https://thewarehouseproject.com/",
  },
  "concourse-project": {
    slug: "concourse-project",
    name: "The Concourse Project",
    kind: "club",
    location: "Austin, Texas",
    website: "https://www.concourseproject.com/",
  },
  "avalon-hollywood": {
    slug: "avalon-hollywood",
    name: "AVALON Hollywood",
    kind: "club",
    location: "Los Angeles, US",
    website: "https://www.avalonhollywood.com/",
  },
  "silo-dallas": {
    slug: "silo-dallas",
    name: "SILO Dallas",
    kind: "club",
    location: "Dallas, US",
    website: "https://www.silodallas.com/",
  },
  "dc-10": {
    slug: "dc-10",
    name: "DC-10",
    kind: "club",
    location: "Ibiza, Spain",
    website: "https://www.dc10ibiza.com/",
  },
  "academy-la": {
    slug: "academy-la",
    name: "Academy LA",
    kind: "club",
    location: "Los Angeles, US",
    website: "https://www.academyla.com/",
  },
  "exchange-la": {
    slug: "exchange-la",
    name: "Exchange LA",
    kind: "club",
    location: "Los Angeles, US",
    website: "https://exchangela.com/",
  },
  tomorrowland: {
    slug: "tomorrowland",
    name: "Tomorrowland",
    kind: "festival",
    location: "Boom, Belgium",
    website: "https://www.tomorrowland.com/",
    soundcloud: "https://soundcloud.com/tomorrowland",
    // Lineup page scanned every deep ingest (CDN + HTML + seed fallback).
    // See discovery/lineupSources.ts — Tomorrowland YT playlist + SC in festivalDrops.
    instagram: "https://instagram.com/tomorrowland",
    twitter: "https://x.com/tomorrowland",
  },
  parookaville: {
    slug: "parookaville",
    name: "Parookaville",
    kind: "festival",
    location: "Weeze, Germany",
    website: "https://parookaville.com/",
    instagram: "https://instagram.com/parookaville",
  },
  "burning-man": {
    slug: "burning-man",
    name: "Burning Man",
    kind: "festival",
    location: "Black Rock City, Nevada",
    website: "https://burningman.org/",
    soundcloud: "https://soundcloud.com/burningman",
    instagram: "https://instagram.com/burningman",
    twitter: "https://x.com/burningman",
  },
  "boiler-room": {
    slug: "boiler-room",
    name: "Boiler Room",
    kind: "livestream",
    website: "https://boilerroom.tv/",
  },
  // Immersive event organiser / agency — never a DJ. Official site cercle.io.
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
    soundcloud: "https://soundcloud.com/insomniacevents",
    instagram: "https://www.instagram.com/insomniac/",
  },
  "nocturnal-wonderland": {
    slug: "nocturnal-wonderland",
    name: "Nocturnal Wonderland",
    kind: "festival",
    location: "San Bernardino, CA",
    website: "https://nocturnalwonderland.com/",
    instagram: "https://instagram.com/nocturnalwland",
    twitter: "https://x.com/nocturnalwland",
  },
  "beyond-wonderland": {
    slug: "beyond-wonderland",
    name: "Beyond Wonderland",
    kind: "festival",
    location: "San Bernardino, CA",
    website: "https://beyondwonderland.com/",
    instagram: "https://instagram.com/beyondwland",
    twitter: "https://x.com/beyondwland",
  },
  "escape-halloween": {
    slug: "escape-halloween",
    name: "Escape Halloween",
    kind: "festival",
    location: "San Bernardino, CA",
    website: "https://escapepsychocircus.com/",
    instagram: "https://instagram.com/escapehalloween",
    twitter: "https://x.com/escapehalloween",
  },
  dreamstate: {
    slug: "dreamstate",
    name: "Dreamstate",
    kind: "festival",
    location: "San Bernardino, CA",
    // Insomniac SoCal brand site (not dreamstate.eu).
    // Hub: https://www.insomniac.com/events/our-world/dreamstate/
    website: "https://socal.dreamstateusa.com/",
    instagram: "https://instagram.com/dreamstateusa",
    twitter: "https://x.com/DreamstateUSA",
  },
  "countdown-nye": {
    slug: "countdown-nye",
    name: "Countdown NYE",
    kind: "festival",
    location: "San Bernardino, CA",
    website: "https://countdownnye.com/",
    instagram: "https://instagram.com/countdownnye",
    twitter: "https://x.com/countdown_nye",
  },
  djoon: {
    slug: "djoon",
    name: "Djoon",
    kind: "club",
    location: "Paris, France",
    website: "https://djoon.com/",
    instagram: "https://www.instagram.com/djoonclub/",
    soundcloud: "https://soundcloud.com/djoon",
    twitter: "https://x.com/djoonclub",
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
  untold: {
    slug: "untold",
    name: "Untold Festival",
    kind: "festival",
    location: "Cluj-Napoca, Romania",
    website: "https://untold.com/",
    instagram: "https://www.instagram.com/untoldfestival/",
  },
  creamfields: {
    slug: "creamfields",
    name: "Creamfields",
    kind: "festival",
    location: "Daresbury, UK",
    website: "https://www.creamfields.com/",
    instagram: "https://www.instagram.com/creamfields/",
  },
  "creamfields-chile": {
    slug: "creamfields-chile",
    name: "Creamfields Chile",
    kind: "festival",
    location: "Club Hípico, Santiago, Chile",
    website: "https://www.creamfields.cl/",
    instagram: "https://www.instagram.com/creamfields_cl/",
  },
  defqon1: {
    slug: "defqon1",
    name: "Defqon.1",
    kind: "festival",
    location: "Biddinghuizen, Netherlands",
    website: "https://www.defqon1.nl/",
    instagram: "https://instagram.com/defqon1",
  },
  "electric-love": {
    slug: "electric-love",
    name: "Electric Love",
    kind: "festival",
    location: "Salzburg, Austria",
    website: "https://www.electriclove.at/",
    instagram: "https://instagram.com/electricloveaut",
    twitter: "https://x.com/electricloveaut",
  },
  parklife: {
    slug: "parklife",
    name: "Parklife",
    kind: "festival",
    location: "Heaton Park, Manchester",
    website: "https://www.parklife.uk.com/",
    soundcloud: "https://soundcloud.com/parklifefestival",
    instagram: "https://instagram.com/parklife",
    twitter: "https://x.com/Parklifefest",
  },
  "time-warp": {
    slug: "time-warp",
    name: "Time Warp",
    kind: "festival",
    location: "Mannheim, Germany",
    website: "https://www.time-warp.de/",
    soundcloud: "https://soundcloud.com/time-warp",
    instagram: "https://instagram.com/timewarp_official",
  },
  mysteryland: {
    slug: "mysteryland",
    name: "Mysteryland",
    kind: "festival",
    location: "Haarlemmermeer, Netherlands",
    website: "https://mysteryland.id-t.com/",
    soundcloud: "https://soundcloud.com/mysterylandmusic",
    instagram: "https://instagram.com/mysteryland_official",
    twitter: "https://x.com/mysteryland",
  },
  awakenings: {
    slug: "awakenings",
    name: "Awakenings",
    kind: "festival",
    location: "Amsterdam, Netherlands",
    website: "https://www.awakenings.nl/",
  },
  "nameless-festival": {
    slug: "nameless-festival",
    name: "Nameless Festival",
    kind: "festival",
    location: "Lecco, Lake Como, Italy",
    website: "https://www.namelessfestival.it/en/",
  },
  "stereo-montreal": {
    slug: "stereo-montreal",
    name: "Stereo Montréal",
    kind: "club",
    location: "Montréal, Canada",
    // No official site in the operator paste — do not invent a host.
  },
  "lost-horizon-festival": {
    slug: "lost-horizon-festival",
    name: "Lost Horizon Festival",
    kind: "festival",
    // Beatport Live 2020 virtual festival. No official site in the paste —
    // do not invent a host. Gas Tower is a stage, not a separate event.
  },
  "club-space": {
    slug: "club-space",
    name: "Club Space",
    kind: "club",
    location: "Miami, United States",
    website: "https://www.clubspace.com/",
  },
  "street-parade": {
    slug: "street-parade",
    name: "Street Parade",
    kind: "festival",
    location: "Zürich, Switzerland",
    website: "https://www.streetparade.com/",
    instagram: "https://www.instagram.com/streetparade/",
    twitter: "https://x.com/streetparadeZH",
    // No official SoundCloud — the site's first SC links are lineup artists.
  },
  "nature-one": {
    slug: "nature-one",
    name: "Nature One",
    kind: "festival",
    location: "Germany",
    website: "https://www.nature-one.de/",
    soundcloud: "https://soundcloud.com/official-nature-one",
    instagram: "https://instagram.com/natureonefestival",
    twitter: "https://x.com/natureone",
  },
  "dance-valley": {
    slug: "dance-valley",
    name: "Dance Valley",
    kind: "festival",
    location: "Netherlands",
    website: "https://www.dancevalley.com/",
    instagram: "https://www.instagram.com/dancevalley/",
  },
  "one-world-radio": {
    slug: "one-world-radio",
    name: "One World Radio",
    kind: "radio",
    location: "Tomorrowland",
  },
  "808-festival": {
    slug: "808-festival",
    name: "808 Festival",
    kind: "festival",
    location: "Bangkok, Thailand",
    website: "https://808festival.net/",
  },
  "together-festival": {
    slug: "together-festival",
    name: "Together Festival",
    kind: "festival",
    location: "Bangkok, Thailand",
    website: "https://togetherfestival.net/",
  },
  "white-party-bangkok": {
    slug: "white-party-bangkok",
    name: "White Party Bangkok",
    kind: "festival",
    location: "Bangkok, Thailand",
    website: "https://whitepartybangkok.com/",
    instagram: "https://www.instagram.com/whitepartybkk/",
  },
  "sunset-neon": {
    slug: "sunset-neon",
    name: "Sunset By Neon",
    kind: "festival",
    location: "Kuala Lumpur, Malaysia",
    website: "https://sunsetbyneon.asia/",
    instagram: "https://www.instagram.com/sunsetbyneon/",
  },
  "pitch-music-arts": {
    slug: "pitch-music-arts",
    name: "Pitch Music & Arts",
    kind: "festival",
    location: "Mafeking, Grampians, Victoria, Australia",
    website: "https://www.pitchfestival.com.au/",
    soundcloud: "https://soundcloud.com/pitchfestival",
  },
  "gmo-sonic": {
    slug: "gmo-sonic",
    name: "GMO Sonic",
    kind: "festival",
    // Indoor festival brand. 2026 Makuhari Messe; 2027 GMO Arena Saitama.
    location: "Makuhari Messe, Chiba, Japan",
    website: "https://sonic.gmo/en/",
    instagram: "https://www.instagram.com/gmosonic/",
    twitter: "https://x.com/gmosonic",
  },
  "magic-of-tomorrowland": {
    slug: "magic-of-tomorrowland",
    name: "The Magic Of Tomorrowland",
    kind: "festival",
    location: "Shanghai (touring), China",
    website: "https://magicoftomorrowland.com/",
  },
  "vision-colour-music-festival": {
    slug: "vision-colour-music-festival",
    name: "Vision & Colour Music Festival",
    kind: "festival",
    location: "Hengqin (touring), China",
    // VAC has no first-party www — IG is the official channel.
    instagram: "https://www.instagram.com/vacfestival/",
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
  elrow: "elrow",
  "el-row": "elrow",
  pacha: "pacha-ibiza",
  "pacha-ibiza": "pacha-ibiza",
  amnesia: "amnesia-ibiza",
  "amnesia-ibiza": "amnesia-ibiza",
  "amnesia-cap-dagde": "amnesia-cap-dagde",
  "amnesia-cap-d-agde": "amnesia-cap-dagde",
  "amnesia-agde": "amnesia-cap-dagde",
  "amnesia-france": "amnesia-cap-dagde",
  "amnesia-fr": "amnesia-cap-dagde",
  "warehouse-project": "warehouse-project",
  "the-warehouse-project": "warehouse-project",
  "club-space": "club-space",
  "club-space-miami": "club-space",
  "space-miami": "club-space",
  "concourse-project": "concourse-project",
  "the-concourse-project": "concourse-project",
  "avalon-hollywood": "avalon-hollywood",
  avalon: "avalon-hollywood",
  "silo-dallas": "silo-dallas",
  silo: "silo-dallas",
  "dc-10": "dc-10",
  dc10: "dc-10",
  "academy-la": "academy-la",
  "exchange-la": "exchange-la",
  "burning-man": "burning-man",
  burningman: "burning-man",
  "burning-man-festival": "burning-man",
  tomorrowland: "tomorrowland",
  "tomorrowland-belgium": "tomorrowland",
  "tomorrowland-belgium-2026": "tomorrowland",
  "tomorrowland-winter": "tomorrowland",
  "tomorrowland-brasil": "tomorrowland",
  "tomorrowland-brazil": "tomorrowland",
  parookaville: "parookaville",
  "parookaville-festival": "parookaville",
  untold: "untold",
  "untold-festival": "untold",
  creamfields: "creamfields",
  "creamfields-chile": "creamfields-chile",
  "creamfields-chile-2026": "creamfields-chile",
  defqon1: "defqon1",
  "defqon-1": "defqon1",
  "electric-love": "electric-love",
  parklife: "parklife",
  "time-warp": "time-warp",
  timewarp: "time-warp",
  mysteryland: "mysteryland",
  awakenings: "awakenings",
  "awakenings-festival": "awakenings",
  "street-parade": "street-parade",
  streetparade: "street-parade",
  "zurich-street-parade": "street-parade",
  "zuerich-street-parade": "street-parade",
  "zurcher-street-parade": "street-parade",
  "brooklyn-mirage": "brooklyn-mirage",
  "the-brooklyn-mirage": "brooklyn-mirage",
  "nature-one": "nature-one",
  natureone: "nature-one",
  "dance-valley": "dance-valley",
  dancevalley: "dance-valley",
  "one-world-radio": "one-world-radio",
  oneworldradio: "one-world-radio",
  "tomorrowland-one-world-radio": "one-world-radio",
  "808-festival": "808-festival",
  "together-festival": "together-festival",
  "white-party-bangkok": "white-party-bangkok",
  "sunset-neon": "sunset-neon",
  "sunset-by-neon": "sunset-neon",
  "pitch-music-arts": "pitch-music-arts",
  "pitch-festival": "pitch-music-arts",
  "gmo-sonic": "gmo-sonic",
  "magic-of-tomorrowland": "magic-of-tomorrowland",
  "the-magic-of-tomorrowland": "magic-of-tomorrowland",
  "vision-colour-music-festival": "vision-colour-music-festival",
  "vac-festival": "vision-colour-music-festival",
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
  if (/\bone\s*world\s*radio\b/i.test(t)) {
    return KNOWN_EVENTS["one-world-radio"];
  }
  if (/\bmagic\s+of\s+tomorrowland\b/i.test(t)) {
    return KNOWN_EVENTS["magic-of-tomorrowland"];
  }
  if (/\btomorrowland\b/i.test(t)) return KNOWN_EVENTS.tomorrowland;
  if (
    /\b(freedom\s*stage|main\s*stage|mainstage)\b/i.test(t) &&
    /\b(belgium|weekend|we\s*[12]|boom)\b/i.test(t)
  ) {
    return KNOWN_EVENTS.tomorrowland;
  }
  if (/\bparookaville\b/i.test(t)) return KNOWN_EVENTS.parookaville;
  if (/\bburning\s*man\b/i.test(t)) return KNOWN_EVENTS["burning-man"];
  if (/\bcoachella\b/i.test(t)) return KNOWN_EVENTS.coachella;
  // Chile before generic Lollapalooza — Chicago site must not win this title.
  if (/\blollapalooza\s+chile\b/i.test(t)) {
    return KNOWN_EVENTS["lollapalooza-chile"];
  }
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
  if (/\buntold\b/i.test(t) && !/\bdubai\b/i.test(t)) return KNOWN_EVENTS.untold;
  // Chile before generic Creamfields — UK Daresbury must not win Santiago titles.
  if (
    /\bcreamfields\s+chile\b/i.test(t) ||
    (/\bcreamfields\b/i.test(t) && /\b(santiago|club\s+h[ií]pico)\b/i.test(t))
  ) {
    return KNOWN_EVENTS["creamfields-chile"];
  }
  if (/\bcreamfields\b/i.test(t)) return KNOWN_EVENTS.creamfields;
  if (/\bdefqon\.?\s*1\b/i.test(t)) return KNOWN_EVENTS.defqon1;
  if (/\belectric\s*love\b/i.test(t)) return KNOWN_EVENTS["electric-love"];
  if (/\bparklife\b/i.test(t)) return KNOWN_EVENTS.parklife;
  if (/\btime\s*warp\b/i.test(t)) return KNOWN_EVENTS["time-warp"];
  if (/\bmysteryland\b/i.test(t)) return KNOWN_EVENTS.mysteryland;
  if (/\bawakenings\b/i.test(t)) return KNOWN_EVENTS.awakenings;
  if (/\bstreet\s*parade\b/i.test(t)) return KNOWN_EVENTS["street-parade"];
  if (/\bnature\s*one\b/i.test(t)) return KNOWN_EVENTS["nature-one"];
  if (/\bdance\s*valley\b/i.test(t)) return KNOWN_EVENTS["dance-valley"];
  if (/\belrow\b/i.test(t)) return KNOWN_EVENTS.elrow;
  if (/\bnameless\s+festival\b/i.test(t)) {
    return KNOWN_EVENTS["nameless-festival"];
  }
  // Require "festival" — bare Lost Horizon is the novel / film, not this event.
  if (/\blost\s+horizon\s+festival\b/i.test(t)) {
    return KNOWN_EVENTS["lost-horizon-festival"];
  }
  // Require Montréal — bare "stereo" is STEREOHYPE / Stereo Love / stereoBLOOM.
  if (/\bstereo\s+montr[eé]al\b/i.test(t)) {
    return KNOWN_EVENTS["stereo-montreal"];
  }
  if (/\bclub\s+space\b|\bspace\s+miami\b/i.test(t)) {
    return KNOWN_EVENTS["club-space"];
  }
  if (
    /\bamnesia\b/i.test(t) &&
    /\b(cap\s*d['’]?agde|agde|amnesia\.fr)\b/i.test(t)
  ) {
    return KNOWN_EVENTS["amnesia-cap-dagde"];
  }
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
