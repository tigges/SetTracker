import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hearthisSourceSlug } from "./adapter";
import { parseHearthisUrl } from "./client";
import { HEARTHIS_TRACKS } from "./tracks";

describe("hearthis curated tracks", () => {
  it("wires Robin Schulz Pacha via ht-{user}-{slugify(track)}", () => {
    const seed = HEARTHIS_TRACKS.find((t) =>
      /robin-schulz-live-aus-dem-pacha/i.test(t.url),
    );
    assert.ok(seed);
    const parsed = parseHearthisUrl(seed!.url);
    assert.deepEqual(parsed, {
      user: "toccoscuro",
      track: "1live-dj-session-mit-robin-schulz-live-aus-dem-pacha-ibiza-vom-0",
    });
    assert.equal(
      hearthisSourceSlug(parsed!.user, parsed!.track!),
      "ht-toccoscuro-1live-dj-session-mit-robin-schulz-live-aus-dem-pacha-ibiza-vom-0",
    );
    assert.equal(seed!.primaryArtist.slug, "robin-schulz");
    assert.equal(seed!.eventName, "Pacha Ibiza");
    assert.equal(seed!.performedOn, "2026-06-06");
  });

  it("wires Nico Moreno B2B Holy Priest EDC via ht-{user}-{slugify(track)}", () => {
    const seed = HEARTHIS_TRACKS.find((t) =>
      /nico-moreno-holy-priestaa-live-at-edc/i.test(t.url),
    );
    assert.ok(seed);
    const parsed = parseHearthisUrl(seed!.url);
    assert.deepEqual(parsed, {
      user: "edmliveset",
      track:
        "nico-moreno-holy-priestaa-live-at-edc-las-vegas-2026-las-vegas-usa-17-05-2026",
    });
    assert.equal(
      hearthisSourceSlug(parsed!.user, parsed!.track!),
      "ht-edmliveset-nico-moreno-holy-priestaa-live-at-edc-las-vegas-2026-las-vegas-usa-17-05-2026",
    );
    assert.equal(seed!.primaryArtist.slug, "nico-moreno");
    assert.equal(seed!.eventName, "EDC Las Vegas");
    assert.equal(seed!.performedOn, "2026-05-17");
  });
});
