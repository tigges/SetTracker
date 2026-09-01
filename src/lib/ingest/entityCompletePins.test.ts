import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  acronymMatchesHandle,
  decodeMojibake,
  evaluateEntityCompleteRow,
  isFallbackWebsiteHub,
  loadEntityCompletePins,
  mergeEntityCompletePins,
  isHttpsImageUrl,
  nameOverlapsHandle,
  parseEntityCompleteCsv,
  pinsFromAudit,
  applyEntityCompletePins,
  wishlistDjStubFromPin,
} from "./entityCompletePins";
import { WISHLIST_DEFAULTS } from "../wishlist";

assert.equal(decodeMojibake("\u00C3\u2020ON:MODE"), "ÆON:MODE");
assert.equal(decodeMojibake("\u00C3\u201Clafur Arnalds"), "Ólafur Arnalds");
assert.equal(decodeMojibake("Mal\u00C3\u00B3ne"), "Malóne");
assert.equal(nameOverlapsHandle("Coco María", "https://cocomaria.net/"), true);
assert.equal(nameOverlapsHandle("Noizu", "https://www.youtube.com/@NoizuSound"), true);
assert.equal(
  nameOverlapsHandle("Third Party", "https://www.youtube.com/@thirdpartychannel"),
  true,
);
assert.equal(
  nameOverlapsHandle("Fantasm", "https://www.instagram.com/fantasm_techno/"),
  false,
);
assert.equal(nameOverlapsHandle("Matroda", "https://www.youtube.com/@MATRODAMUSIC"), true);
assert.equal(nameOverlapsHandle("AC Slater", "https://x.com/djacslater"), true);
assert.equal(nameOverlapsHandle("Dr. Fresch", "https://www.youtube.com/@DrFreschTV"), true);
assert.equal(nameOverlapsHandle("elrow", "https://elrow.com/"), true);
assert.equal(nameOverlapsHandle("Westend", "https://www.itsthewestend.com/"), true);
assert.equal(nameOverlapsHandle("PLS&TY", "https://plsandty.com/"), true);
assert.equal(nameOverlapsHandle("Lucas", "https://www.lucasandsteve.com/"), false);
assert.equal(
  nameOverlapsHandle("I Hate Models", "https://www.ihatemodelsmusic.com/"),
  true,
);
assert.equal(
  nameOverlapsHandle("Marnik", "https://www.marnikofficial.com/"),
  true,
);
assert.equal(
  nameOverlapsHandle("Fantasm", "https://technomusicworld.com/artist/fantasm/about"),
  false,
);
assert.equal(
  nameOverlapsHandle("Lucas & Steve", "https://www.lucasandsteve.com/"),
  true,
);
assert.equal(
  nameOverlapsHandle("4444 OF A KIND", "https://www.youtube.com/@4444fourofakind"),
  true,
);
assert.equal(
  nameOverlapsHandle("4444 OF A KIND", "https://www.instagram.com/4444fourofakind/"),
  true,
);
assert.equal(
  nameOverlapsHandle("Adrián Mills", "https://soundcloud.com/adrianxmills"),
  true,
);
assert.equal(
  nameOverlapsHandle("Adrian Mills", "https://www.instagram.com/adrianxmills/"),
  true,
);
assert.equal(nameOverlapsHandle("Joris Voorn", "https://soundcloud.com/korolovadj"), false);
assert.equal(nameOverlapsHandle("Ferry Corsten", "https://www.instagram.com/someoneelse/"), false);
assert.equal(
  nameOverlapsHandle("BDK", "https://www.instagram.com/oficialbdk/"),
  true,
);
assert.equal(
  nameOverlapsHandle("BDK", "https://www.youtube.com/@OficialBDK"),
  true,
);
assert.equal(
  isHttpsImageUrl(
    "https://image-cdn-fa.spotifycdn.com/image/ab6761610000517490d742bdf4a26e4e6279efac",
  ),
  true,
);
assert.equal(nameOverlapsHandle("Bexxie", "https://bexxiemusic.com/"), true);
assert.equal(
  nameOverlapsHandle("Bexxie", "https://www.instagram.com/bexxiemusic/"),
  true,
);
assert.equal(
  isHttpsImageUrl(
    "https://bexxiemusic.com/cdn/shop/files/Bexxie---Exchange---Los-Angeles_-CA---15-November-2024---Photos-by-Alex-Cole-_alexcxle-7-shopify-banner.jpg?v=1735264425",
  ),
  true,
);
assert.equal(
  isHttpsImageUrl(
    "https://cdn-images.dzcdn.net/images/artist/d8315de10c16736f16b43549fb360448/250x250-000000-80-0-0.jpg",
  ),
  false,
);
assert.equal(
  isHttpsImageUrl(
    "https://i1.sndcdn.com/artworks-iCux6u9UHJRW2S5d-QYhDBg-t500x500.png",
  ),
  true,
);

assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "kyle-walker",
    name: "Kyle Walker",
    field: "",
    value: "",
    evidence: "@KyleWalker6ix has no published links — cannot confirm it is the DJ",
  }).drop,
  "cannot confirm",
);

assert.equal(
  evaluateEntityCompleteRow({
    kind: "festival",
    slug: "tomorrowland",
    name: "Tomorrowland",
    field: "youtube",
    value: "https://www.youtube.com/@tomorrowland",
    evidence: "official channel @tomorrowland",
  }).drop,
  "event has no youtube column",
);

assert.equal(
  evaluateEntityCompleteRow({
    kind: "club",
    slug: "elrow",
    name: "elrow",
    field: "website",
    value: "https://djmag.com/top-100-clubs/elrow",
    evidence: "listicle",
  }).drop,
  "weak or invalid website",
);

const ok = evaluateEntityCompleteRow({
  kind: "dj",
  slug: "malaa",
  name: "Malaa",
  field: "instagram",
  value: "https://www.instagram.com/malaamusic/",
  evidence: "official channel Malaa",
});
assert.equal(ok.field, "instagram");
assert.match(ok.value ?? "", /malaamusic/);

const csv = readFileSync(
  join(process.cwd(), "data/crosscheck/entity-complete-audit.csv"),
  "utf8",
);
const { pins, dropped } = pinsFromAudit(parseEntityCompleteCsv(csv));
assert.ok(pins.some((p) => p.slug === "elrow" && p.website === "https://elrow.com"));
assert.ok(pins.some((p) => p.slug === "matroda" && p.youtube));
assert.ok(dropped.some((d) => d.slug === "kyle-walker"));
assert.ok(
  dropped.some(
    (d) => d.slug === "tomorrowland" && d.field === "youtube",
  ),
);
assert.equal(
  pins.some((p) => p.slug === "kyle-walker"),
  false,
);

assert.equal(isFallbackWebsiteHub("https://linktr.ee/hannahlaingdj"), true);
assert.equal(isFallbackWebsiteHub("https://space92.komi.io/"), true);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "hannah-laing",
    name: "Hannah Laing",
    field: "website",
    value: "https://linktr.ee/hannahlaingdj",
    evidence: "hub fallback",
  }).value,
  "https://linktr.ee/hannahlaingdj",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "space-92",
    name: "Space 92",
    field: "website",
    value: "https://space92.komi.io/",
    evidence: "hub fallback",
  }).value,
  "https://space92.komi.io",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "angelphroot",
    name: "Angelphroot",
    field: "website",
    value: "https://linktr.ee/angieloopi",
    evidence: "hub fallback",
  }).value,
  "https://linktr.ee/angieloopi",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "ahee",
    name: "AHEE",
    field: "website",
    value: "https://linktr.ee/",
    evidence: "empty hub",
  }).drop,
  "weak or invalid website",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "eli-brown",
    name: "Eli Brown",
    field: "website",
    value: "https://elibrownbeats.com/",
    evidence: "official",
  }).value,
  "https://elibrownbeats.com",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "coco-maria",
    name: "Coco María",
    field: "website",
    value: "https://cocomaria.net/",
    evidence: "official",
  }).value,
  "https://cocomaria.net",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "imanu",
    name: "IMANU",
    field: "website",
    value: "https://www.imanu.nu/",
    evidence: "official",
  }).value,
  "https://imanu.nu",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "rules",
    name: "Rules",
    field: "website",
    value: "https://thisisrules.com/",
    evidence: "official",
  }).value,
  "https://thisisrules.com",
);
assert.equal(
  nameOverlapsHandle("Chase", "https://chaseandstatus.co.uk/"),
  false,
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "vini-vici",
    name: "Vini Vici",
    field: "website",
    value: "https://djmag.com/top100djs/2025/32/vini-vici",
    evidence: "listicle",
  }).drop,
  "weak or invalid website",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "i-hate-models",
    name: "I Hate Models",
    field: "website",
    value: "https://en.wikipedia.org/wiki/I_Hate_Models",
    evidence: "encyclopedia",
  }).drop,
  "weak or invalid website",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "fantasm",
    name: "Fantasm",
    field: "website",
    value: "https://technomusicworld.com/artist/fantasm/about",
    evidence: "third-party bio",
  }).drop,
  "weak or invalid website",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "i-hate-models",
    name: "I Hate Models",
    field: "website",
    value: "https://www.ihatemodelsmusic.com/",
    evidence: "official",
  }).value,
  "https://ihatemodelsmusic.com",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "cloonee",
    name: "Cloonee",
    field: "bio",
    value:
      "Cloonee is a London, UK-based DJ, producer or electronic artist whose work centers on tech house / house, with a focus on club-ready releases and live sets.",
    evidence: "template",
  }).drop,
  "template bio",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "atlantis",
    name: "Atlantis",
    field: "bio",
    value:
      "Atlantis is a DJ, producer or electronic artist whose work centers on melodic house & techno, with a focus on club-ready releases and live sets.",
    evidence: "template",
  }).drop,
  "template bio",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "mau-p",
    name: "Mau P",
    field: "bio",
    value:
      "Dutch DJ and producer whose punchy, techno-leaning house records have made him a major contemporary club and festival act.",
    evidence: "producer",
  }).field,
  "bio",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "4444-of-a-kind",
    name: "4444 OF A KIND",
    field: "youtube",
    value: "https://www.youtube.com/@4444fourofakind",
    evidence: "official channel About",
  }).value,
  "https://www.youtube.com/@4444fourofakind",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "4444-of-a-kind",
    name: "4444 OF A KIND",
    field: "instagram",
    value: "https://www.instagram.com/4444fourofakind/",
    evidence: "official profile",
  }).value,
  "https://instagram.com/4444fourofakind",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "4444-of-a-kind",
    name: "4444 OF A KIND",
    field: "bio",
    value:
      "Exclusive live act of D-Block & S-te-Fan and Sub Zero Project. First release Waiting 4 is on Tomorrowland Music.",
    evidence: "official YouTube About",
  }).field,
  "bio",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "bradeazy",
    name: "bradeazy",
    field: "bio",
    value:
      "Miami-based DJ and producer bradeazy is a rising force in the electronic music scene, blending high-energy tech-house with the attitude and edge of viral internet culture.",
    evidence: "Beatport artist page",
  }).field,
  "bio",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "adrian-mills",
    name: "Adrián Mills",
    field: "soundcloud",
    value: "https://soundcloud.com/adrianxmills",
    evidence: "official profile",
  }).value,
  "https://soundcloud.com/adrianxmills",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "adrian-mills",
    name: "Adrián Mills",
    field: "instagram",
    value: "https://www.instagram.com/adrianxmills/",
    evidence: "official profile",
  }).value,
  "https://instagram.com/adrianxmills",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "adrian-mills",
    name: "Adrián Mills",
    field: "website",
    value: "https://ra.co/dj/adrianmills",
    evidence: "RA profile",
  }).drop,
  "weak or invalid website",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "adrian-mills",
    name: "Adrián Mills",
    field: "genre",
    value: "Techno",
    evidence: "official Facebook",
  }).value,
  "Techno",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "bullet-tooth",
    name: "Bullet Tooth",
    field: "genre",
    value: "UK Garage",
    evidence: "Beatport artist page",
  }).value,
  "UK Garage",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "mau-p",
    name: "Mau P",
    field: "homeCity",
    value: "Amsterdam, Netherlands",
    evidence: "producer",
  }).value,
  "Amsterdam, Netherlands",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "max-styler",
    name: "Max Styler",
    field: "homeCity",
    value: "Not found",
    evidence: "export placeholder",
  }).drop,
  "placeholder city",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "mau-p",
    name: "Mau P",
    field: "genre",
    value: "Tech House / House",
    evidence: "producer",
  }).value,
  "Tech House",
);

const duoFromHalf = pinsFromAudit([
  {
    kind: "dj",
    slug: "lucas",
    name: "Lucas",
    field: "website",
    value: "https://www.lucasandsteve.com/",
    evidence: "official duo site",
  },
  {
    kind: "dj",
    slug: "lucas",
    name: "Lucas",
    field: "genre",
    value: "Trance / Psytrance",
    evidence: "half-name guess",
  },
]);
assert.equal(
  duoFromHalf.pins.some((p) => p.slug === "lucas"),
  false,
);
const duoPin = duoFromHalf.pins.find((p) => p.slug === "lucas-steve");
assert.ok(duoPin);
assert.equal(duoPin.website, "https://lucasandsteve.com");
assert.equal(duoPin.genre, undefined);
assert.ok(
  duoFromHalf.dropped.some(
    (d) => d.slug === "lucas" && d.reason === "atomic-act half genre",
  ),
);

const mergedHalf = mergeEntityCompletePins(
  [
    {
      kind: "dj",
      slug: "lucas",
      homeCity: "Maastricht, Netherlands",
    },
  ],
  [
    {
      kind: "dj",
      slug: "lucas-steve",
      website: "https://www.lucasandsteve.com/",
      genre: "House",
    },
  ],
);
assert.equal(mergedHalf.length, 1);
assert.equal(mergedHalf[0]?.slug, "lucas-steve");
assert.equal(mergedHalf[0]?.website, "https://www.lucasandsteve.com/");
assert.equal(mergedHalf[0]?.homeCity, "Maastricht, Netherlands");
assert.equal(mergedHalf[0]?.genre, "House");

const hubThenOfficial = mergeEntityCompletePins(
  [{ kind: "dj", slug: "green-velvet", website: "https://linktr.ee/officialgreenvelvet" }],
  [{ kind: "dj", slug: "green-velvet", website: "https://officialgreenvelvet.com" }],
);
assert.equal(hubThenOfficial[0]?.website, "https://officialgreenvelvet.com");
const officialThenHub = mergeEntityCompletePins(
  [{ kind: "dj", slug: "green-velvet", website: "https://officialgreenvelvet.com" }],
  [{ kind: "dj", slug: "green-velvet", website: "https://linktr.ee/officialgreenvelvet" }],
);
assert.equal(officialThenHub[0]?.website, "https://officialgreenvelvet.com");

// A label domain is not the artist's website, even when the artist links it
// that way. SHDW has no homepage, so his linktree is the fallback we keep.
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "shdw",
    name: "SHDW",
    field: "website",
    value: "https://mutual-rytm.com/",
    evidence: "operator paste",
  }).drop,
  "website name mismatch",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "shdw",
    name: "SHDW",
    field: "website",
    value: "https://linktr.ee/i.am.shdw",
    evidence: "operator paste",
  }).value,
  "https://linktr.ee/i.am.shdw",
);

// Acronym handles: Vision & Colour Music Festival → @vacfestival ("&" = and).
assert.equal(
  acronymMatchesHandle("Vision & Colour Music Festival", "vacfestival"),
  true,
);
assert.equal(
  acronymMatchesHandle("Vision & Colour Music Festival", "vacfest"),
  true,
);
assert.equal(
  acronymMatchesHandle("Vision & Colour Music Festival", "awakenings"),
  false,
  "a different act must not match",
);
assert.equal(
  acronymMatchesHandle("Amnesia Ibiza", "ai"),
  false,
  "two-word names give no usable acronym",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "festival",
    slug: "vision-colour-music-festival",
    name: "Vision & Colour Music Festival",
    field: "instagram",
    value: "https://www.instagram.com/vacfestival/",
    evidence: "operator paste",
  }).value,
  "https://instagram.com/vacfestival",
);
// The chart page is never an official website (it stays in the seed instead).
assert.equal(
  evaluateEntityCompleteRow({
    kind: "festival",
    slug: "vision-colour-music-festival",
    name: "Vision & Colour Music Festival",
    field: "website",
    value: "https://djmag.com/top100festivals/2026/62/vision-colour-music-festival",
    evidence: "operator paste",
  }).drop,
  "weak or invalid website",
);

// Country-domain official sites. The public suffix is stripped before matching,
// so an act's .be site is accepted like its .com would be — previously only the
// handful of TLDs in GENERIC_HANDLE_LEFTOVER passed and everything else read as
// a name mismatch.
assert.equal(
  nameOverlapsHandle("Omdat Het Kan", "https://www.omdathetkan.be/"),
  true,
);
assert.equal(nameOverlapsHandle("Charlotte de Witte", "https://charlottedewitte.be"), true);
assert.equal(nameOverlapsHandle("Kraftwerk", "https://kraftwerk.de"), true);
assert.equal(nameOverlapsHandle("Amelie Lens", "https://amelielens.nl"), true);
// Two-part suffixes leave "co"/"com", which the leftover list already allows.
assert.equal(nameOverlapsHandle("Annie Mac", "https://anniemac.co.uk"), true);
// Stripping the suffix must not start accepting somebody else's domain.
assert.equal(nameOverlapsHandle("Omdat Het Kan", "https://someotheract.be"), false);
assert.equal(nameOverlapsHandle("Mike Williams", "https://tiesto.com"), false);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "omdat-het-kan",
    name: "Omdat Het Kan",
    field: "website",
    value: "https://www.omdathetkan.be/",
    evidence: "operator paste, 200, og:title \"Omdat Het Kan\"",
  }).value,
  "https://omdathetkan.be",
);

// Valentino Khan — operator paste. First-party site + matching handles.
// Insomniac / Discogs hubs stay out of website. No TikTok / Facebook /
// Spotify-playlist / Apple Music columns. Genre left unset (house + trap
// + bass + hardstyle — do not invent one chip).
assert.equal(
  nameOverlapsHandle("Valentino Khan", "https://valentinokhan.com/"),
  true,
);
assert.equal(
  nameOverlapsHandle("Valentino Khan", "https://www.youtube.com/@ValentinoKhan"),
  true,
);
assert.equal(
  nameOverlapsHandle("Valentino Khan", "https://instagram.com/valentinokhan"),
  true,
);
assert.equal(
  nameOverlapsHandle("Valentino Khan", "https://x.com/ValentinoKhan"),
  true,
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "valentino-khan",
    name: "Valentino Khan",
    field: "website",
    value: "https://www.valentinokhan.com/",
    evidence: "operator paste, official site",
  }).value,
  "https://valentinokhan.com",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "valentino-khan",
    name: "Valentino Khan",
    field: "youtube",
    value: "https://www.youtube.com/@ValentinoKhan",
    evidence: "operator paste, channel About",
  }).value,
  "https://www.youtube.com/@ValentinoKhan",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "valentino-khan",
    name: "Valentino Khan",
    field: "instagram",
    value: "https://www.instagram.com/valentinokhan",
    evidence: "operator paste",
  }).value,
  "https://instagram.com/valentinokhan",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "valentino-khan",
    name: "Valentino Khan",
    field: "twitter",
    value: "https://twitter.com/ValentinoKhan",
    evidence: "operator paste",
  }).value,
  "https://x.com/ValentinoKhan",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "valentino-khan",
    name: "Valentino Khan",
    field: "homeCity",
    value: "Los Angeles, US",
    evidence: "operator paste, Los Angeles-based",
  }).value,
  "Los Angeles, US",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "valentino-khan",
    name: "Valentino Khan",
    field: "bio",
    value:
      "Los Angeles DJ and producer whose music spans house, trap, bass, and hardstyle. His House Party EP on Mad Decent, with Diplo, Chris Lorenzo, and Wuki, debuted at #1 on the Apple Music Dance charts.",
    evidence: "operator paste, official site About",
  }).field,
  "bio",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "valentino-khan",
    name: "Valentino Khan",
    field: "website",
    value: "https://www.insomniac.com/music/artists/valentino-khan/",
    evidence: "operator paste, promoter hub",
  }).drop,
  "weak or invalid website",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "valentino-khan",
    name: "Valentino Khan",
    field: "website",
    value: "https://www.discogs.com/artist/2697000-Valentino-Khan",
    evidence: "operator paste, marketplace wiki",
  }).drop,
  "weak or invalid website",
);
{
  const vk = loadEntityCompletePins().find((p) => p.slug === "valentino-khan");
  assert.ok(vk);
  assert.equal(vk.kind, "dj");
  assert.equal(vk.website, "https://valentinokhan.com");
  assert.equal(vk.instagram, "https://instagram.com/valentinokhan");
  assert.equal(vk.youtube, "https://www.youtube.com/@ValentinoKhan");
  assert.equal(vk.twitter, "https://x.com/ValentinoKhan");
  assert.equal(vk.homeCity, "Los Angeles, US");
  assert.ok(vk.bio?.includes("House Party EP"));
  assert.equal(vk.soundcloud, undefined);
  assert.equal(vk.genre, undefined);
  assert.equal(vk.imageUrl, undefined);
}
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "valentino-khan",
    name: "Valentino Khan",
    field: "website",
    value: "https://grokipedia.com/page/Valentino_Khan",
    evidence: "operator paste, encyclopedia",
  }).drop,
  "weak or invalid website",
);

// GREG 99 — operator paste. Matching greg99music handles; no first-party
// site. Spotify artist URL has no pin column. Genre is the lead named
// chip (Afro House); Latin / Balearic stay in the bio.
assert.equal(
  nameOverlapsHandle("GREG 99", "https://www.youtube.com/@greg99music"),
  true,
);
assert.equal(
  nameOverlapsHandle("GREG 99", "https://instagram.com/greg99music"),
  true,
);
assert.equal(
  nameOverlapsHandle("GREG 99", "https://soundcloud.com/greg99music"),
  true,
);
assert.equal(
  nameOverlapsHandle("GREG 99", "https://x.com/greg99music"),
  true,
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "greg-99",
    name: "GREG 99",
    field: "youtube",
    value: "https://www.youtube.com/@greg99music",
    evidence: "operator paste, channel About",
  }).value,
  "https://www.youtube.com/@greg99music",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "greg-99",
    name: "GREG 99",
    field: "instagram",
    value: "https://www.instagram.com/greg99music",
    evidence: "operator paste",
  }).value,
  "https://instagram.com/greg99music",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "greg-99",
    name: "GREG 99",
    field: "soundcloud",
    value: "https://soundcloud.com/greg99music",
    evidence: "operator paste",
  }).value,
  "https://soundcloud.com/greg99music",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "greg-99",
    name: "GREG 99",
    field: "twitter",
    value: "https://twitter.com/greg99music",
    evidence: "operator paste",
  }).value,
  "https://x.com/greg99music",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "greg-99",
    name: "GREG 99",
    field: "homeCity",
    value: "Minas Gerais, Brazil",
    evidence: "operator paste, countryside of Minas Gerais",
  }).value,
  "Minas Gerais, Brazil",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "greg-99",
    name: "GREG 99",
    field: "genre",
    value: "Afro House",
    evidence: "operator paste, lead influence",
  }).value,
  "Afro House",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "greg-99",
    name: "GREG 99",
    field: "bio",
    value:
      "Minas Gerais producer whose sound mixes Afro House, Latin House, and Balearic vibes. Releases on Hellbent, Criterio, Nervous, and Moodchild; Still My Baby with Cloonee hit #1 on Beatport's global chart.",
    evidence: "operator paste, official About",
  }).field,
  "bio",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "greg-99",
    name: "GREG 99",
    field: "spotify",
    value: "https://open.spotify.com/artist/68ocQOFVB9wvLiC1C1WjYp",
    evidence: "operator paste",
  }).drop,
  "unknown field",
);
{
  const greg = loadEntityCompletePins().find((p) => p.slug === "greg-99");
  assert.ok(greg);
  assert.equal(greg.kind, "dj");
  assert.equal(greg.instagram, "https://instagram.com/greg99music");
  assert.equal(greg.youtube, "https://www.youtube.com/@greg99music");
  assert.equal(greg.soundcloud, "https://soundcloud.com/greg99music");
  assert.equal(greg.twitter, "https://x.com/greg99music");
  assert.equal(greg.homeCity, "Minas Gerais, Brazil");
  assert.equal(greg.genre, "Afro House");
  assert.ok(greg.bio?.includes("Still My Baby"));
  assert.equal(greg.website, undefined);
  assert.equal(greg.imageUrl, undefined);
}

// Malaa — operator paste fills SoundCloud + France on the existing pin.
// Insomniac artist hub is followable evidence (Bass House + balaclava bio)
// but never website. Grokipedia /page/Malaa is the same class. Facebook /
// Spotify have no pin columns. "Official YouTube Channel of Malaa" is not
// a bio.
assert.equal(
  nameOverlapsHandle("Malaa", "https://soundcloud.com/malaamusic"),
  true,
);
assert.equal(
  nameOverlapsHandle("Malaa", "https://www.youtube.com/@malaa_music"),
  true,
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "malaa",
    name: "Malaa",
    field: "soundcloud",
    value: "https://soundcloud.com/malaamusic",
    evidence: "operator paste, official channel",
  }).value,
  "https://soundcloud.com/malaamusic",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "malaa",
    name: "Malaa",
    field: "homeCity",
    value: "France",
    evidence: "operator paste, YouTube About + Insomniac Origin",
  }).value,
  "France",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "malaa",
    name: "Malaa",
    field: "genre",
    value: "Bass House",
    evidence: "insomniac.com/music/artists/malaa Genre",
  }).value,
  "Bass House",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "malaa",
    name: "Malaa",
    field: "bio",
    value:
      "French DJ and producer who has performed in a balaclava since 2015 and released Who Is Malaa mixes on SoundCloud. Debut Illicit EP and Notorious landed on Tchami's Confession; also known for Illegal Mixtapes and the NO REDEMPTION project with Tchami.",
    evidence: "insomniac.com/music/artists/malaa",
  }).field,
  "bio",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "malaa",
    name: "Malaa",
    field: "website",
    value: "https://www.insomniac.com/music/artists/malaa/",
    evidence: "operator paste, promoter hub",
  }).drop,
  "weak or invalid website",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "malaa",
    name: "Malaa",
    field: "website",
    value: "https://grokipedia.com/page/Malaa",
    evidence: "operator paste, encyclopedia",
  }).drop,
  "weak or invalid website",
);
{
  const malaa = loadEntityCompletePins().find((p) => p.slug === "malaa");
  assert.ok(malaa);
  assert.equal(malaa.instagram, "https://instagram.com/malaamusic");
  assert.equal(malaa.youtube, "https://www.youtube.com/@malaa_music");
  assert.equal(malaa.soundcloud, "https://soundcloud.com/malaamusic");
  assert.equal(malaa.twitter, "https://x.com/Malaamusic");
  assert.equal(malaa.homeCity, "France");
  assert.equal(malaa.genre, "Bass House");
  assert.ok(malaa.bio?.includes("Who Is Malaa"));
  assert.equal(malaa.website, undefined);
}

// Anti Up — operator paste. Matching @antiup / antiupmusic handles.
// Slogan bio only — drop the +1 phone and @chrislake handle dump.
// Facebook has no pin column. SoundCloud was not in this paste.
// DJ Fresh Grokipedia is an encyclopedia, not a website.
assert.equal(
  nameOverlapsHandle("Anti Up", "https://www.youtube.com/@antiup"),
  true,
);
assert.equal(
  nameOverlapsHandle("Anti Up", "https://instagram.com/antiupmusic"),
  true,
);
assert.equal(
  nameOverlapsHandle("Anti Up", "https://x.com/antiupmusic"),
  true,
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "anti-up",
    name: "Anti Up",
    field: "youtube",
    value: "https://www.youtube.com/@antiup",
    evidence: "operator paste, channel About",
  }).value,
  "https://www.youtube.com/@antiup",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "anti-up",
    name: "Anti Up",
    field: "instagram",
    value: "https://www.instagram.com/antiupmusic",
    evidence: "operator paste",
  }).value,
  "https://instagram.com/antiupmusic",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "anti-up",
    name: "Anti Up",
    field: "twitter",
    value: "https://twitter.com/antiupmusic",
    evidence: "operator paste",
  }).value,
  "https://x.com/antiupmusic",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "anti-up",
    name: "Anti Up",
    field: "homeCity",
    value: "United States",
    evidence: "operator paste, YouTube About",
  }).value,
  "United States",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "anti-up",
    name: "Anti Up",
    field: "bio",
    value: "Never established. Never limited. Keep calm? Says who?",
    evidence: "operator paste, channel About",
  }).field,
  "bio",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "anti-up",
    name: "Anti Up",
    field: "website",
    value: "https://grokipedia.com/page/dj_fresh_american_dj",
    evidence: "operator paste, encyclopedia",
  }).drop,
  "weak or invalid website",
);
{
  const anti = loadEntityCompletePins().find((p) => p.slug === "anti-up");
  assert.ok(anti);
  assert.equal(anti.kind, "dj");
  assert.equal(anti.instagram, "https://instagram.com/antiupmusic");
  assert.equal(anti.youtube, "https://www.youtube.com/@antiup");
  assert.equal(anti.twitter, "https://x.com/antiupmusic");
  assert.equal(anti.homeCity, "United States");
  assert.equal(anti.bio, "Never established. Never limited. Keep calm? Says who?");
  assert.equal(anti.soundcloud, undefined);
  assert.equal(anti.website, undefined);
  assert.equal(anti.genre, undefined);
  assert.doesNotMatch(anti.bio ?? "", /\+1|323|@chrislake/i);
}

// Jauz — operator paste. jauzofficial.com + matching @jauzofficial
// handles. Channel /c/ ID is not a handle. Bite This
// (heybitethis.com) is the label, not the artist site. "Official
// YouTube for Jauz" is not a bio. Booking email stays out.
assert.equal(
  nameOverlapsHandle("Jauz", "https://jauzofficial.com"),
  true,
);
assert.equal(
  nameOverlapsHandle("Jauz", "https://www.youtube.com/@jauzofficial"),
  true,
);
assert.equal(
  nameOverlapsHandle("Jauz", "https://www.heybitethis.com/"),
  false,
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "jauz",
    name: "Jauz",
    field: "website",
    value: "https://jauzofficial.com",
    evidence: "operator paste, official site",
  }).value,
  "https://jauzofficial.com",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "jauz",
    name: "Jauz",
    field: "youtube",
    value: "https://www.youtube.com/@jauzofficial",
    evidence: "operator paste, channel About",
  }).value,
  "https://www.youtube.com/@jauzofficial",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "jauz",
    name: "Jauz",
    field: "youtube",
    value: "https://www.youtube.com/channel/UCoFl689sYMJfI1pZxWqlQgg",
    evidence: "operator paste, channel id",
  }).drop,
  "youtube name mismatch",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "jauz",
    name: "Jauz",
    field: "instagram",
    value: "https://www.instagram.com/jauzofficial",
    evidence: "operator paste",
  }).value,
  "https://instagram.com/jauzofficial",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "jauz",
    name: "Jauz",
    field: "soundcloud",
    value: "https://soundcloud.com/jauzofficial",
    evidence: "operator paste",
  }).value,
  "https://soundcloud.com/jauzofficial",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "jauz",
    name: "Jauz",
    field: "twitter",
    value: "https://twitter.com/jauzofficial",
    evidence: "operator paste",
  }).value,
  "https://x.com/jauzofficial",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "jauz",
    name: "Jauz",
    field: "homeCity",
    value: "United States",
    evidence: "operator paste, YouTube About",
  }).value,
  "United States",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "jauz",
    name: "Jauz",
    field: "website",
    value: "https://www.heybitethis.com/",
    evidence: "operator paste, Bite This label",
  }).drop,
  "website name mismatch",
);
{
  const jauz = loadEntityCompletePins().find((p) => p.slug === "jauz");
  assert.ok(jauz);
  assert.equal(jauz.kind, "dj");
  assert.equal(jauz.website, "https://jauzofficial.com");
  assert.equal(jauz.instagram, "https://instagram.com/jauzofficial");
  assert.equal(jauz.youtube, "https://www.youtube.com/@jauzofficial");
  assert.equal(jauz.soundcloud, "https://soundcloud.com/jauzofficial");
  assert.equal(jauz.twitter, "https://x.com/jauzofficial");
  assert.equal(jauz.homeCity, "United States");
  assert.equal(jauz.bio, undefined);
  assert.equal(jauz.genre, undefined);
  assert.equal(jauz.imageUrl, undefined);
}

// BROHUG — operator paste. wearebrohug.com + matching @brohugofficial
// YT/IG/SC. Discogs /artist/5120339-Brohug is followable evidence
// (X @wearebrohug, Stockholm, Bass House, short profile) but never
// website. Facebook has no pin column.
assert.equal(
  nameOverlapsHandle("BROHUG", "https://www.wearebrohug.com/"),
  true,
);
assert.equal(
  nameOverlapsHandle("BROHUG", "https://www.youtube.com/@brohugofficial"),
  true,
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "brohug",
    name: "BROHUG",
    field: "website",
    value: "https://www.wearebrohug.com/",
    evidence: "operator paste, official site",
  }).value,
  "https://wearebrohug.com",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "brohug",
    name: "BROHUG",
    field: "youtube",
    value: "https://www.youtube.com/@brohugofficial",
    evidence: "operator paste, channel About",
  }).value,
  "https://www.youtube.com/@brohugofficial",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "brohug",
    name: "BROHUG",
    field: "instagram",
    value: "https://www.instagram.com/brohugofficial/",
    evidence: "operator paste",
  }).value,
  "https://instagram.com/brohugofficial",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "brohug",
    name: "BROHUG",
    field: "soundcloud",
    value: "https://soundcloud.com/brohugofficial",
    evidence: "operator paste",
  }).value,
  "https://soundcloud.com/brohugofficial",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "brohug",
    name: "BROHUG",
    field: "facebook",
    value: "https://www.facebook.com/brohugofficial/",
    evidence: "operator paste",
  }).drop,
  "unknown field",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "brohug",
    name: "BROHUG",
    field: "website",
    value: "https://www.discogs.com/artist/5120339-Brohug",
    evidence: "operator paste, marketplace wiki",
  }).drop,
  "weak or invalid website",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "brohug",
    name: "BROHUG",
    field: "twitter",
    value: "https://twitter.com/wearebrohug",
    evidence: "discogs.com/artist/5120339-Brohug urls",
  }).value,
  "https://x.com/wearebrohug",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "brohug",
    name: "BROHUG",
    field: "homeCity",
    value: "Stockholm, Sweden",
    evidence: "discogs.com/artist/5120339-Brohug profile",
  }).value,
  "Stockholm, Sweden",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "brohug",
    name: "BROHUG",
    field: "genre",
    value: "Bass House",
    evidence: "discogs.com/artist/5120339-Brohug profile bass-house",
  }).value,
  "Bass House",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "brohug",
    name: "BROHUG",
    field: "bio",
    value:
      "The Swedish bass-house band from Stockholm, which started its activity in 2015.",
    evidence: "discogs.com/artist/5120339-Brohug profile",
  }).field,
  "bio",
);
{
  const brohug = loadEntityCompletePins().find((p) => p.slug === "brohug");
  assert.ok(brohug);
  assert.equal(brohug.kind, "dj");
  assert.equal(brohug.website, "https://wearebrohug.com");
  assert.equal(brohug.instagram, "https://instagram.com/brohugofficial");
  assert.equal(brohug.youtube, "https://www.youtube.com/@brohugofficial");
  assert.equal(brohug.soundcloud, "https://soundcloud.com/brohugofficial");
  assert.equal(brohug.twitter, "https://x.com/wearebrohug");
  assert.equal(brohug.homeCity, "Stockholm, Sweden");
  assert.equal(brohug.genre, "Bass House");
  assert.ok(brohug.bio?.includes("Stockholm"));
  assert.equal(brohug.imageUrl, undefined);
}

{
  const faster = loadEntityCompletePins().find((p) => p.slug === "faster-horses");
  assert.ok(faster);
  assert.equal(faster.kind, "dj");
  assert.equal(
    faster.imageUrl,
    "https://i1.sndcdn.com/artworks-iCux6u9UHJRW2S5d-QYhDBg-t500x500.png",
  );
  assert.ok(
    !faster.imageUrl?.includes("d8315de10c16736f16b43549fb360448"),
    "Deezer silhouette must not stay pinned",
  );
}

{
  const bexxie = loadEntityCompletePins().find((p) => p.slug === "bexxie");
  assert.ok(bexxie);
  assert.equal(bexxie.kind, "dj");
  assert.equal(bexxie.website, "https://bexxiemusic.com");
  assert.equal(bexxie.instagram, "https://instagram.com/bexxiemusic");
  assert.equal(bexxie.youtube, "https://www.youtube.com/@bexxiemusic");
  assert.match(bexxie.imageUrl ?? "", /bexxiemusic\.com\/cdn\/shop\/files\/Bexxie/);
}
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "bexxie",
    name: "Bexxie",
    field: "website",
    value: "https://bexxiemusic.com/",
    evidence: "operator paste, official site",
  }).value,
  "https://bexxiemusic.com",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "bexxie",
    name: "Bexxie",
    field: "imageUrl",
    value:
      "https://bexxiemusic.com/cdn/shop/files/Bexxie---Exchange---Los-Angeles_-CA---15-November-2024---Photos-by-Alex-Cole-_alexcxle-7-shopify-banner.jpg?v=1735264425",
    evidence: "operator paste, official homepage hero",
  }).field,
  "imageUrl",
);

{
  const bdk = loadEntityCompletePins().find((p) => p.slug === "bdk");
  assert.ok(bdk);
  assert.equal(bdk.kind, "dj");
  assert.equal(
    bdk.imageUrl,
    "https://image-cdn-fa.spotifycdn.com/image/ab6761610000517490d742bdf4a26e4e6279efac",
  );
  assert.equal(bdk.instagram, "https://instagram.com/oficialbdk");
  assert.equal(bdk.youtube, "https://www.youtube.com/@OficialBDK");
  assert.equal(bdk.genre, undefined);
  assert.ok(
    !bdk.imageUrl?.includes("3186191e16afc811cac6be4d037b3cbf"),
    "wrong Deezer BDK RIDERS art",
  );
}
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "bdk",
    name: "BDK",
    field: "instagram",
    value: "https://www.instagram.com/oficialbdk/",
    evidence: "operator paste",
  }).value,
  "https://instagram.com/oficialbdk",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "bdk",
    name: "BDK",
    field: "youtube",
    value: "https://www.youtube.com/@OficialBDK",
    evidence: "operator paste",
  }).value,
  "https://www.youtube.com/@OficialBDK",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "bdk",
    name: "BDK",
    field: "imageUrl",
    value:
      "https://image-cdn-fa.spotifycdn.com/image/ab6761610000517490d742bdf4a26e4e6279efac",
    evidence: "operator paste, Spotify artist oembed",
  }).value,
  "https://image-cdn-fa.spotifycdn.com/image/ab6761610000517490d742bdf4a26e4e6279efac",
);
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "faster-horses",
    name: "Faster Horses",
    field: "imageUrl",
    value:
      "https://cdn-images.dzcdn.net/images/artist/d8315de10c16736f16b43549fb360448/250x250-000000-80-0-0.jpg",
    evidence: "deezer artist placeholder",
  }).drop,
  "image url not allowed",
);

// Fields with no Dj column must drop rather than be coerced somewhere else.
for (const field of ["tiktok", "facebook", "spotify", "deezer"]) {
  assert.equal(
    evaluateEntityCompleteRow({
      kind: "dj",
      slug: "mu540",
      name: "MU540",
      field,
      value: "https://example.com/mu540",
      evidence: "operator paste",
    }).drop,
    "unknown field",
    `${field} has no Dj column and must drop`,
  );
}
// An Instagram post URL is not a profile handle.
assert.equal(
  evaluateEntityCompleteRow({
    kind: "dj",
    slug: "mike-williams",
    name: "Mike Williams",
    field: "instagram",
    value: "https://www.instagram.com/p/DcToLAXycHO/",
    evidence: "operator paste",
  }).drop,
  "handle name mismatch",
);

{
  const vk = loadEntityCompletePins().find((p) => p.slug === "valentino-khan");
  const stub = wishlistDjStubFromPin(vk!);
  assert.ok(stub);
  assert.equal(stub.name, "Valentino Khan");
  assert.equal(stub.website, "https://valentinokhan.com");
  assert.equal(stub.instagram, "https://instagram.com/valentinokhan");
  assert.ok(stub.bio?.includes("House Party EP"));
}
{
  const random = loadEntityCompletePins().find((p) => p.slug === "aqutie");
  assert.ok(random);
  assert.equal(wishlistDjStubFromPin(random), null);
}
assert.equal(
  wishlistDjStubFromPin({ kind: "festival", slug: "valentino-khan" }),
  null,
);
{
  const empties = [
    "valentino-khan",
    "greg-99",
    "malaa",
    "jauz",
    "brohug",
    "anti-up",
    "tchami",
  ];
  for (const slug of empties) {
    const pin = loadEntityCompletePins().find((p) => p.slug === slug);
    assert.ok(pin, `${slug} pin`);
    const stub = wishlistDjStubFromPin(pin);
    assert.ok(stub, `${slug} wishlist stub`);
    assert.equal(
      stub.name,
      WISHLIST_DEFAULTS.find((d) => d.slug === slug)?.name,
    );
  }
}

{
  const created: string[] = [];
  applyEntityCompletePins(
    {
      dj: {
        findUnique: async () => null,
        create: async ({ data }: { data: { slug: string } }) => {
          created.push(data.slug);
          return data;
        },
      },
      event: { findUnique: async () => null },
    } as never,
    [
      {
        kind: "dj",
        slug: "valentino-khan",
        website: "https://valentinokhan.com",
      },
      {
        kind: "dj",
        slug: "aqutie",
        soundcloud: "https://soundcloud.com/aqutie",
      },
    ],
  )
    .then((out) => {
      assert.equal(out.created, 1);
      assert.deepEqual(created, ["valentino-khan"]);
      console.log("entityCompletePins.test.ts ok");
    })
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    });
}
