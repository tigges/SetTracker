import assert from "node:assert/strict";
import { KNOWN_EVENTS } from "./events";
import {
  artistSocialKeysFromPins,
  curatedEventSocialPatch,
  djMayClaimSocialUrl,
  eventMayClaimSocialUrl,
  eventSocialCleanupPatch,
  handleMatchesArtist,
  handleMatchesEvent,
  socialProfileKey,
} from "./eventSocials";

assert.equal(
  socialProfileKey("https://soundcloud.com/adambeyer"),
  "soundcloud:adambeyer",
);
assert.equal(
  socialProfileKey("https://x.com/andreaoliva1"),
  "twitter:andreaoliva1",
);
assert.equal(
  socialProfileKey("https://twitter.com/andreaoliva1/"),
  "twitter:andreaoliva1",
);
assert.equal(
  socialProfileKey("https://www.instagram.com/streetparade/"),
  "instagram:streetparade",
);
assert.equal(
  socialProfileKey("https://www.youtube.com/@fisher"),
  "youtube:fisher",
);
assert.equal(
  socialProfileKey("https://www.youtube.com/watch?v=Uq1WP8v3U4o"),
  null,
);
assert.equal(
  socialProfileKey("https://soundcloud.com/adambeyer/some-track"),
  null,
);

assert.equal(handleMatchesEvent("streetparade", "Street Parade"), true);
assert.equal(handleMatchesEvent("street-parade", "Street Parade"), true);
assert.equal(handleMatchesEvent("adambeyer", "Street Parade"), false);
assert.equal(handleMatchesEvent("andreaoliva1", "Street Parade"), false);
assert.equal(handleMatchesEvent("ultra", "Ultra Music Festival"), true);
assert.equal(handleMatchesEvent("edc_lasvegas", "EDC Las Vegas"), true);
assert.equal(handleMatchesEvent("hardfest", "HARD Summer"), true);

assert.equal(handleMatchesArtist("adambeyer", "Adam Beyer"), true);
assert.equal(handleMatchesArtist("andreaoliva1", "Andrea Oliva"), true);
assert.equal(handleMatchesArtist("adambeyer", "Street Parade"), false);
assert.equal(
  djMayClaimSocialUrl("Adam Beyer", "https://soundcloud.com/adambeyer"),
  true,
);
assert.equal(
  djMayClaimSocialUrl("FISHER", "https://soundcloud.com/adambeyer"),
  false,
);
assert.equal(
  djMayClaimSocialUrl("AFRO", "https://soundcloud.com/afrojack"),
  false,
);
assert.equal(
  djMayClaimSocialUrl("AFRO", "https://instagram.com/afrojack"),
  false,
);
assert.equal(
  djMayClaimSocialUrl("Afrojack", "https://soundcloud.com/afrojack"),
  true,
);
assert.equal(
  djMayClaimSocialUrl("ARTBAT", "https://soundcloud.com/artbatmusic"),
  true,
);
assert.equal(
  djMayClaimSocialUrl("Westend", "https://instagram.com/beatport"),
  false,
);

const pins = artistSocialKeysFromPins();
assert.ok(pins.has("instagram:realadambeyer"));

const emptyArtists = new Set<string>();
assert.equal(
  eventMayClaimSocialUrl(
    "Street Parade",
    "https://www.instagram.com/streetparade/",
    emptyArtists,
  ),
  true,
);
assert.equal(
  eventMayClaimSocialUrl(
    "Street Parade",
    "https://soundcloud.com/adambeyer",
    emptyArtists,
  ),
  false,
);
assert.equal(
  eventMayClaimSocialUrl(
    "Street Parade",
    "https://x.com/andreaoliva1",
    emptyArtists,
  ),
  false,
);
assert.equal(
  eventMayClaimSocialUrl(
    "Street Parade",
    "https://x.com/streetparadeZH",
    emptyArtists,
  ),
  true,
);
assert.equal(
  eventMayClaimSocialUrl(
    "Street Parade",
    "https://soundcloud.com/adambeyer",
    new Set(["soundcloud:adambeyer"]),
  ),
  false,
);

const street = KNOWN_EVENTS["street-parade"]!;
const curated = curatedEventSocialPatch(street);
assert.equal(curated.website, "https://www.streetparade.com/");
assert.equal(curated.instagram, "https://www.instagram.com/streetparade/");
assert.equal(curated.soundcloud, null);
assert.equal(curated.twitter, "https://x.com/streetparadeZH");

const dirty = eventSocialCleanupPatch(
  {
    name: "Street Parade",
    soundcloud: "https://soundcloud.com/adambeyer",
    instagram: "https://www.instagram.com/streetparade/",
    twitter: "https://x.com/andreaoliva1",
  },
  emptyArtists,
  street,
);
assert.equal(dirty.soundcloud, null);
assert.equal(dirty.twitter, "https://x.com/streetparadeZH");
assert.equal(dirty.instagram, undefined);

const scraped = eventSocialCleanupPatch(
  {
    name: "Street Parade",
    soundcloud: "https://soundcloud.com/adambeyer",
    twitter: "https://x.com/andreaoliva1",
    instagram: "https://www.instagram.com/streetparade/",
  },
  emptyArtists,
);
assert.equal(scraped.soundcloud, null);
assert.equal(scraped.twitter, null);
assert.equal(scraped.instagram, undefined);

console.log("eventSocials.test.ts ok");
