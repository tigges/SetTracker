import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  atlasCities,
  atlasCountries,
  chartKicker,
  filterAtlasPins,
  projectMercator,
  type AtlasPin,
} from "./atlas/mapMath";
import {
  ATLAS_YEAR,
  atlasPinsFromVenues,
  loadAtlasVenues,
  lookupAtlasVenue,
} from "./atlas/seed";
import { loadDjMagClubRankBySlug } from "./djmagClubRanks";
import { loadDjMagFestivalRankBySlug } from "./djmagFestivalRanks";
import { resolveFeedRanks } from "./feedPriorityResolve";

function pin(partial: Partial<AtlasPin> & Pick<AtlasPin, "id" | "name">): AtlasPin {
  return {
    kind: "club",
    rank: 1,
    slug: "x",
    chartSlug: "x",
    city: "Ibiza",
    country: "Spain",
    loc: "Ibiza, Spain",
    lat: 38.9,
    lng: 1.4,
    change: "Non-mover",
    approx: false,
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
    ];
    assert.equal(
      filterAtlasPins(pins, { type: "club", q: "", country: "", city: "" }).length,
      2,
    );
    assert.equal(
      filterAtlasPins(pins, {
        type: "both",
        q: "ibiza",
        country: "",
        city: "",
      }).map((p) => p.id).join(),
      "c1",
    );
    assert.equal(
      filterAtlasPins(pins, {
        type: "both",
        q: "",
        country: "Spain",
        city: "Madrid",
      }).map((p) => p.name).join(),
      "Fabrik",
    );
    assert.deepEqual(atlasCountries(pins), ["Belgium", "Spain"]);
    assert.deepEqual(atlasCities(pins, "Spain"), ["Ibiza", "Madrid"]);
    assert.equal(chartKicker("festival", 1), "Festival · No. 1");
    assert.equal(chartKicker("club", 4), "Club · No. 4");
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
