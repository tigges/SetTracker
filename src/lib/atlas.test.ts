import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ATLAS_INITIAL_VIEW,
  atlasAccent,
  atlasCities,
  atlasCountries,
  atlasClusterRadius,
  atlasPinClass,
  atlasPinIdFromTarget,
  atlasPinsNear,
  atlasTapMoved,
  atlasViewBox,
  toggleAtlasKind,
  chartKicker,
  filterAtlasPins,
  flyToSpan,
  projectMercator,
  spreadCoincidentPins,
  viewBoxContains,
  type AtlasPin,
} from "./atlas/mapMath";
import {
  ATLAS_DJ_YEAR,
  ATLAS_YEAR,
  atlasPins,
  atlasPinsFromDjs,
  atlasPinsFromVenues,
  loadAtlasDjs,
  loadAtlasVenues,
  lookupAtlasDj,
  lookupAtlasVenue,
} from "./atlas/seed";
import { loadDjMagClubRankBySlug } from "./djmagClubRanks";
import { loadDjMagFestivalRankBySlug } from "./djmagFestivalRanks";
import { loadDjMagTop100RankBySlug } from "./djmagTop100";
import { resolveFeedRanks } from "./feedPriorityResolve";

function pin(partial: Partial<AtlasPin> & Pick<AtlasPin, "id" | "name">): AtlasPin {
  return {
    kind: "club",
    rank: 1,
    year: 2026,
    slug: "x",
    chartSlug: "x",
    city: "Ibiza",
    country: "Spain",
    loc: "Ibiza, Spain",
    lat: 38.9,
    lng: 1.4,
    change: "Non-mover",
    approx: false,
    src: null,
    note: null,
    prec: null,
    nomap: false,
    x: 0,
    y: 0,
    setCount: 0,
    imageUrl: null,
    href: null,
    ...partial,
  };
}

describe("DJ Mag 2026 atlas seed", () => {
  it("covers ranks 1–100 for clubs and festivals with catalog aliases", () => {
    const venues = loadAtlasVenues();
    assert.equal(ATLAS_YEAR, 2026);
    assert.equal(venues.length, 200);
    const clubs = venues.filter((v) => v.kind === "club");
    const fests = venues.filter((v) => v.kind === "festival");
    assert.equal(clubs.length, 100);
    assert.equal(fests.length, 100);
    assert.deepEqual(
      clubs.map((v) => v.rank).sort((a, b) => a - b),
      Array.from({ length: 100 }, (_, i) => i + 1),
    );
    assert.deepEqual(
      fests.map((v) => v.rank).sort((a, b) => a - b),
      Array.from({ length: 100 }, (_, i) => i + 1),
    );

    const unvrs = lookupAtlasVenue("unvrs");
    assert.equal(unvrs?.rank, 1);
    assert.equal(unvrs?.kind, "club");
    assert.equal(unvrs?.name, "[UNVRS]");
    assert.equal(typeof unvrs?.lat, "number");
    assert.equal(unvrs?.change, "New entry");

    const edc = lookupAtlasVenue("edc-lv");
    assert.equal(edc?.rank, 2);
    assert.equal(edc?.chartSlug, "edc-las-vegas");
    assert.equal(lookupAtlasVenue("edc-las-vegas")?.slug, "edc-lv");

    const ultra = lookupAtlasVenue("ultra-miami");
    assert.equal(ultra?.rank, 4);
    assert.equal(ultra?.chartSlug, "ultra-music-festival");

    const ushuaia = lookupAtlasVenue("ushuaia-ibiza");
    assert.equal(ushuaia?.rank, 3);
    assert.equal(ushuaia?.kind, "club");

    assert.equal(
      lookupAtlasVenue("808-festival")?.website,
      "https://808festival.net/",
    );
    assert.equal(lookupAtlasVenue("gmo-sonic")?.website, "https://sonic.gmo/en/");
    assert.equal(
      lookupAtlasVenue("magic-of-tomorrowland")?.website,
      "https://magicoftomorrowland.com/",
    );

    const approx = venues.filter((v) => v.approx);
    assert.ok(approx.length >= 20, "city-level pins stay flagged");
    assert.ok(
      venues.every((v) => Number.isFinite(v.lat) && Number.isFinite(v.lng)),
    );
  });

  it("projects pins and joins catalog set counts", () => {
    const boom = projectMercator(4.3815363, 51.0879335);
    assert.ok(boom.x > 500 && boom.x < 540);
    assert.ok(boom.y > 300 && boom.y < 380);

    const pins = atlasPinsFromVenues(loadAtlasVenues(), new Map([
      ["tomorrowland", { slug: "tomorrowland", setCount: 12, imageUrl: "/t.jpg" }],
      ["unvrs", { slug: "unvrs", setCount: 0, imageUrl: null }],
    ]));
    const tml = pins.find((p) => p.slug === "tomorrowland");
    assert.equal(tml?.href, "/events/tomorrowland");
    assert.equal(tml?.setCount, 12);
    assert.equal(tml?.imageUrl, "/t.jpg");
    assert.equal(tml?.year, 2026);
    const missing = pins.find((p) => p.slug === "greenvalley");
    assert.equal(missing?.href, null);
    assert.equal(missing?.setCount, 0);
  });

  it("filters by type, country, city, and search", () => {
    const pins = [
      pin({ id: "c1", name: "Hï Ibiza", kind: "club", city: "Ibiza", country: "Spain" }),
      pin({
        id: "f1",
        name: "Tomorrowland",
        kind: "festival",
        city: "Boom",
        country: "Belgium",
        loc: "De Schorre, Boom, Belgium",
      }),
      pin({
        id: "c2",
        name: "Fabrik",
        kind: "club",
        city: "Madrid",
        country: "Spain",
        loc: "Madrid, Spain",
      }),
      pin({
        id: "d1",
        name: "David Guetta",
        kind: "dj",
        year: 2025,
        city: "Paris",
        country: "France",
        loc: "Paris, France",
        src: "Paris, France",
      }),
    ];
    assert.equal(
      filterAtlasPins(pins, { type: "club", q: "", country: "", city: "" }).length,
      2,
    );
    assert.equal(
      filterAtlasPins(pins, { type: "dj", q: "", country: "", city: "" }).map((p) => p.name).join(),
      "David Guetta",
    );
    assert.equal(
      filterAtlasPins(pins, {
        type: "all",
        q: "ibiza",
        country: "",
        city: "",
      }).map((p) => p.id).join(),
      "c1",
    );
    assert.equal(
      filterAtlasPins(pins, {
        type: "all",
        q: "guetta",
        country: "",
        city: "",
      }).map((p) => p.id).join(),
      "d1",
    );
    assert.equal(
      filterAtlasPins(pins, {
        type: "all",
        q: "",
        country: "Spain",
        city: "Madrid",
      }).map((p) => p.name).join(),
      "Fabrik",
    );
    assert.deepEqual(atlasCountries(pins), ["Belgium", "France", "Spain"]);
    assert.deepEqual(atlasCities(pins, "Spain"), ["Ibiza", "Madrid"]);
    assert.equal(chartKicker("festival", 1), "Festival · No. 1");
    assert.equal(chartKicker("club", 4), "Club · No. 4");
    assert.equal(chartKicker("dj", 1, 2025), "DJ · No. 1 · 2025");
    assert.equal(atlasAccent("dj"), "var(--violet)");
    assert.equal(atlasPinClass("dj"), "atlas-pin-dj");
    assert.equal(atlasTapMoved({ x: 0, y: 0 }, { x: 3, y: 3 }), false);
    assert.equal(atlasTapMoved({ x: 0, y: 0 }, { x: 10, y: 0 }), true);
    assert.equal(atlasPinIdFromTarget(null), null);
    assert.deepEqual(
      filterAtlasPins(pins, {
        kinds: ["festival", "dj"],
        q: "",
        country: "",
        city: "",
      }).map((p) => p.id).sort(),
      ["d1", "f1"],
    );
    assert.deepEqual(toggleAtlasKind(["festival", "club"], "dj"), [
      "festival",
      "club",
      "dj",
    ]);
    assert.deepEqual(toggleAtlasKind(["festival", "club"], "club"), [
      "festival",
    ]);
    assert.equal(
      filterAtlasPins(pins, { kinds: [], q: "", country: "", city: "" }).length,
      0,
    );
    const cluster = atlasPinsNear(
      [
        pin({ id: "a", name: "A", x: 10, y: 10 }),
        pin({ id: "b", name: "B", x: 12, y: 10 }),
        pin({ id: "c", name: "C", x: 80, y: 80 }),
      ],
      { x: 10, y: 10 },
      5,
    );
    assert.deepEqual(cluster.map((p) => p.id), ["a", "b"]);
    assert.ok(atlasClusterRadius(900) >= 6);
  });
});

describe("DJ Mag 2025 atlas DJs", () => {
  it("covers ranks 1–100 and joins catalog slugs", () => {
    const rows = loadAtlasDjs();
    assert.equal(ATLAS_DJ_YEAR, 2025);
    assert.equal(rows.length, 100);
    assert.deepEqual(
      rows.map((d) => d.rank).sort((a, b) => a - b),
      Array.from({ length: 100 }, (_, i) => i + 1),
    );

    const guetta = lookupAtlasDj("david-guetta");
    assert.equal(guetta?.rank, 1);
    assert.equal(guetta?.name, "David Guetta");
    assert.equal(guetta?.prec, "city");
    assert.equal(guetta?.nomap, false);
    assert.equal(guetta?.country, "France");

    const claptone = lookupAtlasDj("claptone");
    assert.equal(claptone?.rank, 30);
    assert.equal(claptone?.nomap, true);
    assert.ok(claptone?.note?.toLowerCase().includes("undisclosed"));

    const countryPins = rows.filter((d) => d.prec === "country" && !d.nomap);
    assert.ok(countryPins.length >= 60, "most DJs are country-level");
    assert.ok(
      rows.every((d) => Number.isFinite(d.lat) && Number.isFinite(d.lng)),
    );

    const chart = loadDjMagTop100RankBySlug();
    assert.equal(chart.get("david-guetta"), 1);
    for (const d of rows) {
      assert.equal(chart.get(d.slug), d.rank, d.slug);
    }

    const pins = atlasPinsFromDjs(rows, new Map([
      ["david-guetta", { slug: "david-guetta", setCount: 4, imageUrl: "/g.jpg" }],
    ]));
    const g = pins.find((p) => p.slug === "david-guetta");
    assert.equal(g?.href, "/djs/david-guetta");
    assert.equal(g?.setCount, 4);
    assert.equal(g?.year, 2025);
    assert.equal(g?.nomap, false);
    assert.equal(g?.instagram, "https://www.instagram.com/davidguetta/");
    assert.equal(g?.soundcloud, "https://soundcloud.com/davidguetta");
    assert.equal(g?.youtube, "https://www.youtube.com/@davidguetta");
    const missing = pins.find((p) => p.slug === "claptone");
    assert.equal(missing?.href, null);
    assert.equal(missing?.nomap, true);
    const noSet = pins.find((p) => p.slug === "martin-garrix");
    assert.equal(noSet?.setCount, 0);
    assert.equal(noSet?.nomap, true);
  });

  it("spirals stacked country pins and skips nomap on the combined map", () => {
    const stacked = spreadCoincidentPins([
      { x: 10, y: 10 },
      { x: 10, y: 10 },
      { x: 10, y: 10, nomap: true },
    ]);
    assert.equal(stacked[0].x, 10);
    assert.notEqual(stacked[1].x, 10);
    assert.equal(stacked[2].x, 10);

    const pins = atlasPins(
      loadAtlasVenues(),
      loadAtlasDjs(),
      new Map(),
      new Map(),
    );
    assert.equal(pins.length, 300);
    assert.equal(pins.filter((p) => p.kind === "dj").length, 100);
    assert.equal(
      pins.filter((p) => p.kind === "dj" && !p.nomap).length,
      0,
      "empty catalog → DJ pins stay list-only",
    );
    const nl = pins.filter(
      (p) => p.kind === "dj" && p.country === "Netherlands" && !p.nomap,
    );
    const keys = new Set(nl.map((p) => `${p.x.toFixed(2)}/${p.y.toFixed(2)}`));
    assert.equal(keys.size, nl.length, "Dutch DJs must not share one pixel");
    assert.equal(flyToSpan({ kind: "dj", prec: "country", nomap: false }), 240);
    assert.equal(flyToSpan({ kind: "festival", prec: null, nomap: false }), 80);
  });

  it("default world view keeps land and Top 100 pins in a desktop pane", () => {
    const vb = atlasViewBox(ATLAS_INITIAL_VIEW, 900, 560);
    assert.deepEqual(
      vb.map((n) => Math.round(n)),
      [50, 150, 900, 560],
    );
    const boom = projectMercator(4.37, 51.09);
    const split = projectMercator(16.44, 43.51);
    assert.ok(viewBoxContains(vb, boom.x, boom.y), "Tomorrowland in default frame");
    assert.ok(viewBoxContains(vb, split.x, split.y), "Ultra Europe in default frame");
    assert.ok(viewBoxContains(vb, 500, 430), "frame center is on the land path");
  });
});

describe("DJ Mag club ranks", () => {
  it("loads club #1 and wires feed ranks without clobbering festivals", () => {
    const clubs = loadDjMagClubRankBySlug();
    assert.equal(clubs.get("unvrs"), 1);
    assert.equal(clubs.get("ushuaia-ibiza"), 3);
    assert.equal(clubs.get("hi-ibiza"), 4);

    const fests = loadDjMagFestivalRankBySlug();
    assert.equal(fests.get("tomorrowland"), 1);
    assert.equal(fests.get("edc-lv"), 2);

    const clubSet = resolveFeedRanks({
      primaryDjSlug: null,
      eventSlug: "ushuaia-ibiza",
      eventKind: "club",
      setType: "festival",
      durationSec: 3600,
      trackCount: 20,
    });
    assert.equal(clubSet.clubRank, 3);
    assert.equal(clubSet.festivalRank, null);
    assert.equal(clubSet.spotlight, "top-club");

    const festSet = resolveFeedRanks({
      primaryDjSlug: "martin-garrix",
      eventSlug: "tomorrowland",
      eventKind: "festival",
      setType: "festival",
      durationSec: 3600,
      trackCount: 40,
    });
    assert.equal(festSet.festivalRank, 1);
    assert.equal(festSet.clubRank, null);
  });
});
