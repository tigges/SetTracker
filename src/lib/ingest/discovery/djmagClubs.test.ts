import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { inferFestivalEvent } from "../events";
import {
  inferDjMagClubEvent,
  isDjMagProfileUrl,
  loadDjMagTopClubs,
  normalizeClubWebsite,
  parseLocationFromClubHtml,
  parseOfficialWebsiteFromClubHtml,
  resolveDjMagClubByName,
} from "./djmagClubs";

const seed = JSON.parse(
  readFileSync(
    join(process.cwd(), "data/venue-seeds/djmag-top100-clubs-2026.json"),
    "utf8",
  ),
) as {
  clubs: Array<{
    rank: number;
    slug: string;
    name: string;
    website?: string;
  }>;
};

assert.equal(seed.clubs.length, 100);
assert.equal(seed.clubs[0]?.slug, "unvrs");
assert.equal(seed.clubs[2]?.name.includes("Ushua"), true);

assert.equal(
  parseOfficialWebsiteFromClubHtml(`
    <div class="field field--name-field-club-reference">Savaya</div>
    <div class="field--name-field-intro">
      <p><a href="https://www.savaya.com/">savaya.com</a><br />
      Bali cliffs blurb</p>
    </div>
    <a href="https://www.djmagchina.cn/">DJ Mag China</a>
  `),
  "https://www.savaya.com/",
);
assert.equal(
  parseOfficialWebsiteFromClubHtml(`
    <div class="field--name-field-intro">
      <p><a href="//unvrs.com">unvrs.com</a></p>
    </div>
  `),
  "https://unvrs.com/",
);
assert.equal(
  parseOfficialWebsiteFromClubHtml(`
    <div class="field--name-field-intro">
      <p><a href="http://fabriclondon.com/">fabriclondon.com</a></p>
    </div>
  `),
  "https://fabriclondon.com/",
);
assert.equal(
  parseOfficialWebsiteFromClubHtml(`
    <div class="field--name-field-intro">
      <p><a href="https://www.clubspace.com/">clubspace.com</a></p>
    </div>
    <a href="https://www.djmagchina.cn/">noise</a>
  `),
  "https://www.clubspace.com/",
);
assert.equal(
  parseOfficialWebsiteFromClubHtml(`
    <a href="https://www.djmagchina.cn/">DJ Mag China</a>
    <footer>no club intro</footer>
  `),
  null,
);
assert.equal(normalizeClubWebsite("https://bootshaus.tv"), "https://bootshaus.tv/");
assert.equal(
  isDjMagProfileUrl("https://djmag.com/top100clubs/2026/5/savaya"),
  true,
);
assert.equal(isDjMagProfileUrl("https://www.savaya.com/"), false);
assert.equal(
  parseLocationFromClubHtml(
    `<p><strong>Location:</strong> Ibiza, Spain&nbsp;</p>`,
  ),
  "Ibiza, Spain",
);

// Warm seed cache without network by resolving from seed file
assert.equal(resolveDjMagClubByName("Berghain")?.slug, "berghain");
assert.equal(resolveDjMagClubByName("Hï Ibiza")?.slug, "hi-ibiza");
assert.equal(
  inferDjMagClubEvent("Amelie Lens at Bootshaus Cologne")?.slug,
  "bootshaus",
);
assert.equal(
  inferFestivalEvent("Chris Lake live at Ushuaïa Ibiza")?.slug,
  "ushuaia-ibiza",
);
// Ambiguous short names must not match
assert.equal(inferDjMagClubEvent("Lost in Sound Vol 3"), null);

loadDjMagTopClubs().then((clubs) => {
  assert.ok(clubs.length >= 100, `expected 100+ clubs, got ${clubs.length}`);
  console.log("djmagClubs.test.ts ok", clubs.length);
});
