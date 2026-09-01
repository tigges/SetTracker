import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  applyDjMagProfileHtml,
  loadDjMagTopDjs,
  needsDjMagProfile,
  parseBestKnownFromDjHtml,
  parseBioFromDjHtml,
  parseDjStyleFromDjHtml,
  parseHomeFromDjHtml,
} from "./djmagDjs";
import { composeDjMagStoredBio, isReplaceableDjBio } from "../../djBio";

const seed = JSON.parse(
  readFileSync(
    join(process.cwd(), "data/artist-seeds/djmag-top100-djs-2025.json"),
    "utf8",
  ),
) as {
  djs: Array<{
    rank: number;
    slug: string;
    name: string;
    website?: string;
    homeCity?: string;
    bio?: string;
    genre?: string;
  }>;
};

assert.equal(seed.djs.length, 100);
assert.equal(seed.djs[0]?.slug, "david-guetta");
assert.equal(seed.djs[4]?.slug, "armin-van-buuren");
assert.ok(seed.djs.some((d) => d.slug === "black-coffee"));
assert.ok(seed.djs.some((d) => d.slug === "fisher"));
assert.ok(
  seed.djs.filter((d) => d.website && !/djmag\.com/i.test(d.website)).length >=
    70,
  "expected most Top 100 DJs to have official websites",
);
assert.equal(
  seed.djs.find((d) => d.slug === "david-guetta")?.website,
  "https://davidguetta.com/",
);
assert.equal(
  seed.djs.find((d) => d.slug === "fred-again")?.website,
  "https://www.fredagain.com/",
);
assert.equal(
  seed.djs.find((d) => d.slug === "i-hate-models")?.website,
  "https://www.ihatemodelsmusic.com/",
);
assert.equal(
  seed.djs.find((d) => d.slug === "marnik")?.website,
  "https://www.marnikofficial.com/",
);

assert.equal(
  parseHomeFromDjHtml(
    `<p><strong>From:</strong> Paris, France</p><p><strong>DJ style:</strong> House</p>`,
  ),
  "Paris, France",
);

const guettaHtml = readFileSync(
  join(process.cwd(), "src/lib/ingest/discovery/fixtures/djmag-top100-dj-profile.html"),
  "utf8",
);
const technoHtml = readFileSync(
  join(process.cwd(), "src/lib/ingest/discovery/fixtures/djmag-top100-dj-techno.html"),
  "utf8",
);
assert.equal(parseHomeFromDjHtml(guettaHtml), "Paris, France");
assert.equal(parseDjStyleFromDjHtml(guettaHtml), null, "all forms is not a chip");
assert.equal(parseDjStyleFromDjHtml(technoHtml), "Techno");
assert.match(parseBioFromDjHtml(guettaHtml) ?? "", /still make music every single day/);
assert.match(parseBioFromDjHtml(technoHtml) ?? "", /techno stratosphere/);
assert.doesNotMatch(parseBioFromDjHtml(guettaHtml) ?? "", /Position 1/);
const applied = applyDjMagProfileHtml(
  {
    rank: 9,
    slug: "charlotte-de-witte",
    name: "Charlotte de Witte",
    djmagUrl: "https://djmag.com/top100djs/2025/9/charlotte-de-witte",
  },
  technoHtml,
);
assert.equal(applied.homeCity, "Ghent, Belgium");
assert.equal(applied.genre, "Techno");
assert.match(applied.bio ?? "", /MainStage/);
assert.equal(parseBestKnownFromDjHtml(guettaHtml), "Two Ibiza residencies and chart domination");
assert.equal(parseBestKnownFromDjHtml(technoHtml), "Bringing techno to the mainstage");
assert.equal(applied.bestKnownFor, "Bringing techno to the mainstage");
assert.match(
  composeDjMagStoredBio({
    bestKnownFor: "Bringing techno to the mainstage",
    bio: applied.bio,
  }) ?? "",
  /^Bringing techno to the mainstage\./,
);
assert.equal(
  isReplaceableDjBio(
    "Harnessing a distinct brand of artistry that knows no categorical bounds, the DJ, producer and record label head has cemented herself as one of the music industry's most in-demand names.",
  ),
  true,
);
assert.match(
  seed.djs.find((d) => d.slug === "david-guetta")?.bio ?? "",
  /still make music every single day/,
);
assert.match(
  seed.djs.find((d) => d.slug === "charlotte-de-witte")?.bio ?? "",
  /techno stratosphere/,
);
assert.equal(
  seed.djs.find((d) => d.slug === "charlotte-de-witte")?.genre,
  "Techno",
);
assert.equal(
  needsDjMagProfile({ homeCity: "Paris, France", bio: "DJ Mag Top 100 DJs 2025 · #1." }),
  true,
);
assert.equal(
  needsDjMagProfile({
    homeCity: "Paris, France",
    bio: "“It might sound crazy,” says David Guetta, “but I still make music every single day.",
  }),
  true,
);
assert.equal(
  needsDjMagProfile({
    homeCity: "Paris, France",
    bio: "“It might sound crazy,” says David Guetta, “but I still make music every single day.",
    bestKnownFor: "Two Ibiza residencies and chart domination",
  }),
  false,
);
const replaced = applyDjMagProfileHtml(
  {
    rank: 1,
    slug: "david-guetta",
    name: "David Guetta",
    djmagUrl: "https://djmag.com/top100djs/2025/1/david-guetta",
    bio: "DJ Mag Top 100 DJs 2025 · #1.",
  },
  guettaHtml,
);
assert.match(replaced.bio ?? "", /still make music/);
assert.equal(replaced.genre, undefined);

loadDjMagTopDjs().then((djs) => {
  assert.ok(djs.length >= 100, `expected 100 djs, got ${djs.length}`);
  console.log("djmagDjs.test.ts ok", djs.length);
});
