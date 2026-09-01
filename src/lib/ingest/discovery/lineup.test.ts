import assert from "node:assert/strict";
import { LINEUP_SOURCES } from "./lineupSources";
import { PRESS_SEEDS } from "./pressSeeds";
import {
  allRelatedBySlug,
  linkCohort,
  loadRelations,
  relatedSlugsFor,
} from "./relations";
import type { RelationFile } from "./types";

assert.ok(LINEUP_SOURCES.some((s) => s.eventSlug === "tomorrowland"));
assert.ok(LINEUP_SOURCES.some((s) => s.eventSlug === "street-parade"));
assert.equal(
  LINEUP_SOURCES.find((s) => s.eventSlug === "street-parade")?.website,
  "https://www.streetparade.com/",
);
assert.ok(
  LINEUP_SOURCES.find((s) => s.eventSlug === "tomorrowland")?.lineupUrl?.includes(
    "line-up",
  ),
);
assert.ok(PRESS_SEEDS.some((p) => p.artists.includes("David Guetta")));
assert.ok(PRESS_SEEDS.some((p) => p.artists.includes("Marten Horger")));

const file: RelationFile = {
  version: 1,
  updatedAt: new Date().toISOString(),
  relations: [],
  venueArtists: {},
};
linkCohort(file, ["David Guetta", "Marten Horger", "Men Machine"], "test", 40);
assert.equal(file.relations.length, 3);

// Committed relations file should already link Guetta ↔ Horger
const live = loadRelations();
const related = relatedSlugsFor("marten-horger");
assert.ok(
  related.some((r) => r.slug === "david-guetta"),
  "expected Horger ↔ Guetta relation in data/artist-relations.json",
);
assert.ok((live.venueArtists.tomorrowland ?? []).includes("david-guetta"));
assert.ok(
  (allRelatedBySlug()["marten-horger"] ?? []).some((r) => r.slug === "david-guetta"),
);
const antiUpRelated = relatedSlugsFor("anti-up");
assert.ok(
  antiUpRelated.some((r) => r.slug === "chris-lake"),
  "expected Anti Up ↔ Chris Lake relation in data/artist-relations.json",
);
assert.ok(
  antiUpRelated.some((r) => r.slug === "chris-lorenzo"),
  "expected Anti Up ↔ Chris Lorenzo relation in data/artist-relations.json",
);

console.log("lineup.test.ts ok");
