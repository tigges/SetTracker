import assert from "node:assert/strict";
import {
  mergeStatusCounts,
  pickHeroCollage,
  pickLandingSets,
  pickVenueMosaic,
  pickVisualFaces,
  setgraphTicks,
  type LandingSetFields,
} from "./homeLanding";

const now = Date.parse("2026-08-18T12:00:00Z");

function set(partial: Partial<LandingSetFields> & { id: string; title: string }): LandingSetFields {
  return {
    slug: partial.slug ?? partial.id,
    publishedAt: partial.publishedAt ?? "2026-08-01T00:00:00Z",
    performedAt: partial.performedAt ?? "2026-08-01T00:00:00Z",
    durationSec: partial.durationSec ?? 3600,
    trackCount: partial.trackCount ?? 20,
    densitySeverity: partial.densitySeverity ?? "ok",
    statusCounts: partial.statusCounts ?? { identified: 16, unresolved_id: 4 },
    venueTier: partial.venueTier ?? "festival",
    top100Rank: partial.top100Rank ?? null,
    festivalRank: partial.festivalRank ?? 3,
    clubRank: partial.clubRank ?? null,
    primaryDj: partial.primaryDj ?? { name: "Ada", slug: `dj-${partial.id}` },
    imageUrl: partial.imageUrl ?? `/sets/${partial.id}.jpg`,
    ...partial,
  };
}

const radarA = set({
  id: "a",
  title: "Ada Ultra 2026",
  top100Rank: 4,
  imageUrl: "/sets/a.jpg",
});
const radarB = set({
  id: "b",
  title: "Ben Tomorrowland 2026",
  top100Rank: 12,
  primaryDj: { name: "Ben", slug: "dj-b" },
  imageUrl: "/sets/b.jpg",
});
const filler = set({
  id: "c",
  title: "Club night",
  venueTier: "club",
  festivalRank: null,
  clubRank: null,
  top100Rank: null,
  imageUrl: "/sets/c.jpg",
  primaryDj: { name: "Cam", slug: "dj-c" },
});

const picked = pickLandingSets([filler, radarB, radarA], 3, now);
assert.equal(picked[0]?.id, "a");
assert.equal(picked[1]?.id, "b");
assert.ok(picked.some((s) => s.id === "c"));

const onlyFiller = pickLandingSets([filler], 3, now);
assert.deepEqual(
  onlyFiller.map((s) => s.id),
  ["c"],
);

assert.deepEqual(
  pickVisualFaces(
    [
      { src: "/a.jpg", label: "A" },
      { src: "  ", label: "blank" },
      { src: "/a.jpg", label: "dup" },
      { src: "/b.jpg", label: "B" },
    ],
    2,
  ),
  [
    { src: "/a.jpg", label: "A", accent: undefined, href: undefined },
    { src: "/b.jpg", label: "B", accent: undefined, href: undefined },
  ],
);

const mosaic = pickVenueMosaic(
  [
    { slug: "tml", name: "Tomorrowland", kind: "festival", imageUrl: "/v/tml.jpg", isBrowseReady: true },
    { slug: "amnesia", name: "Amnesia", kind: "club", imageUrl: "/v/amn.jpg", isBrowseReady: true },
    { slug: "stub", name: "Stub", kind: "festival", imageUrl: "/v/stub.jpg", isBrowseReady: false },
  ],
  "festival",
  6,
);
assert.deepEqual(
  mosaic.map((f) => f.href),
  ["/events/tml"],
);

const collage = pickHeroCollage({
  sets: [radarA],
  djs: [{ src: "/djs/ada.jpg", label: "Ada", href: "/djs/dj-a" }],
  venues: [{ src: "/v/tml.jpg", label: "Tomorrowland", href: "/events/tml" }],
  limit: 4,
});
assert.ok(collage.some((f) => f.src === "/sets/a.jpg"));
assert.ok(collage.some((f) => f.href === "/djs/dj-a"));

const ticks = setgraphTicks({ identified: 8, unresolved_id: 2 }, 10);
assert.equal(ticks.length, 10);
assert.equal(ticks.filter((t) => t === "identified").length, 8);
assert.equal(ticks.filter((t) => t === "unresolved_id").length, 2);
assert.deepEqual(setgraphTicks({}, 10), []);
assert.equal(setgraphTicks({ identified: 1 }, 0).length, 0);

const merged = mergeStatusCounts([
  { identified: 2, unparsed: 1 },
  { identified: 3, unresolved_id: 4 },
]);
assert.deepEqual(merged, {
  identified: 5,
  unresolved_id: 4,
  community_resolved: 0,
  unparsed: 1,
});
