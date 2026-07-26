import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { inferFestivalEvent } from "../events";
import { CLUB_LIST_SOURCES, ensureClubListVenues } from "./clubLists";

assert.ok(CLUB_LIST_SOURCES.some((s) => s.id === "sixam-europe-33"));
assert.ok(CLUB_LIST_SOURCES.some((s) => s.id === "clubtickets-europe"));
assert.ok(CLUB_LIST_SOURCES.some((s) => s.id === "clubtickets-ibiza"));

const sixam = JSON.parse(
  readFileSync(
    join(process.cwd(), "data/venue-seeds/sixam-europe-33.json"),
    "utf8",
  ),
) as { clubs: Array<{ name: string }> };
assert.equal(sixam.clubs.length, 33);
assert.ok(sixam.clubs.some((c) => c.name === "DC-10"));
assert.ok(sixam.clubs.some((c) => c.name === "Spazio 900"));

// Title attach for list-only / aliased clubs
assert.equal(
  inferFestivalEvent("Amelie Lens at Rex Club Paris")?.slug,
  "rex-club",
);
assert.equal(
  inferFestivalEvent("Live from Tobacco Dock London")?.slug,
  "tobacco-dock",
);

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
ensureClubListVenues(prisma)
  .then(async (stats) => {
    assert.ok(stats.scraped >= 20, `expected 20+ scraped, got ${stats.scraped}`);
    console.log(
      "clubLists.test.ts ok",
      stats.scraped,
      "new",
      stats.newVenues.length,
      stats.bySource,
    );
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
