import assert from "node:assert/strict";
import {
  catalogDayKey,
  formatCatalogDay,
  groupNewSetsByCreatedDay,
  newSetsHeadline,
  type NewSetRow,
} from "./statsNewSets";

function row(
  slug: string,
  createdAt: string,
  extra: Partial<NewSetRow> = {},
): NewSetRow {
  return {
    slug,
    title: extra.title ?? slug,
    type: extra.type ?? "festival",
    createdAt,
    primaryDj: extra.primaryDj ?? slug,
    primaryDjSlug: extra.primaryDjSlug ?? slug,
  };
}

assert.equal(catalogDayKey("2026-09-01T18:40:00.000Z"), "2026-09-01");
assert.equal(catalogDayKey("2026-09-01T00:10:00.000Z"), "2026-09-01");
assert.equal(formatCatalogDay("2026-09-01"), "Sep 1");

const grouped = groupNewSetsByCreatedDay(
  [
    row("a", "2026-09-01T20:00:00.000Z", { primaryDj: "FISHER" }),
    row("b", "2026-09-01T16:00:00.000Z", { primaryDj: "Chris Lake" }),
    row("c", "2026-09-01T12:00:00.000Z", { primaryDj: "FISHER" }),
    row("d", "2026-08-31T22:00:00.000Z", { primaryDj: "Dom Dolla" }),
    row("e", "2026-08-30T08:00:00.000Z", { primaryDj: "Mau P" }),
    row("f", "2026-08-29T08:00:00.000Z", { primaryDj: "Older" }),
  ],
  3,
);
assert.equal(grouped.length, 3);
assert.equal(grouped[0]?.iso, "2026-09-01");
assert.equal(grouped[0]?.count, 3);
assert.deepEqual(grouped[0]?.names, ["FISHER", "Chris Lake"]);
assert.equal(grouped[1]?.iso, "2026-08-31");
assert.equal(grouped[2]?.iso, "2026-08-30");
assert.ok(!grouped.some((d) => d.iso === "2026-08-29"));

assert.equal(
  newSetsHeadline(grouped, Date.parse("2026-09-01T21:00:00.000Z")),
  "3 today · 5 in 3 catalog days",
);
assert.equal(
  newSetsHeadline(grouped, Date.parse("2026-09-02T12:00:00.000Z")),
  "3 yesterday · 5 in 3 catalog days",
);
assert.equal(
  newSetsHeadline([grouped[2]!], Date.parse("2026-09-01T21:00:00.000Z")),
  "1 on Aug 30",
);
assert.equal(newSetsHeadline([]), "No new sets in this export");

console.log("statsNewSets.test.ts ok");
