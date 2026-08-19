import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { inferFestivalEvent } from "../events";
import {
  djMagFestivalToEvent,
  inferDjMagFestivalEvent,
  loadDjMagTopFestivals,
} from "./djmagFestivals";

const seed = JSON.parse(
  readFileSync(
    join(process.cwd(), "data/venue-seeds/djmag-top100-festivals-2026.json"),
    "utf8",
  ),
) as {
  festivals: Array<{
    rank: number;
    slug: string;
    name: string;
    djmagUrl: string;
    website?: string;
  }>;
};

assert.equal(seed.festivals.length, 100);
assert.equal(seed.festivals[0]?.slug, "tomorrowland");
assert.equal(seed.festivals[1]?.slug, "edc-las-vegas");
assert.ok(
  seed.festivals.filter((f) => f.website && !/djmag\.com/i.test(f.website))
    .length >= 70,
  "expected most Top 100 Festivals to have official websites",
);
assert.equal(
  seed.festivals.find((f) => f.slug === "amf")?.website,
  "https://www.amsterdammusicfestival.com/",
);
assert.equal(
  seed.festivals.find((f) => f.slug === "808-festival")?.website,
  "https://808festival.net/",
);
assert.equal(
  seed.festivals.find((f) => f.slug === "gmo-sonic")?.website,
  "https://sonic.gmo/en/",
);
assert.equal(
  seed.festivals.find((f) => f.slug === "magic-of-tomorrowland")?.website,
  "https://magicoftomorrowland.com/",
);
assert.equal(
  djMagFestivalToEvent(
    seed.festivals.find((f) => f.slug === "vision-colour-music-festival")!,
  ).instagram,
  "https://www.instagram.com/vacfestival/",
);
assert.equal(
  djMagFestivalToEvent(seed.festivals.find((f) => f.slug === "gmo-sonic")!)
    .kind,
  "festival",
);

const tl = djMagFestivalToEvent(seed.festivals[0]!);
assert.equal(tl.slug, "tomorrowland");
assert.equal(tl.website, "https://www.tomorrowland.com/");

const edc = djMagFestivalToEvent(seed.festivals[1]!);
assert.equal(edc.slug, "edc-lv");
assert.ok(edc.website?.includes("edc.com"));

assert.equal(
  inferFestivalEvent("Amelie Lens at Parookaville 2025")?.slug,
  "parookaville",
);
assert.equal(
  inferDjMagFestivalEvent("Live from Time Warp Mannheim")?.slug,
  "time-warp",
);

loadDjMagTopFestivals().then((fests) => {
  assert.ok(fests.length >= 100, `expected 100 festivals, got ${fests.length}`);
  console.log("djmagFestivals.test.ts ok", fests.length);
});
