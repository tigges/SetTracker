import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  collapseHostTwins,
  compareNeedsIds,
  deepWeekLabel,
  diversifyByEvent,
  eventDiversityKey,
  groupByDeepWeek,
  hostTwinKey,
  PROVENANCE_HINT_LABEL,
  setMatchesTypeFilter,
  tracklistProvenanceHint,
} from "./feedQuality";

describe("feedQuality", () => {
  it("maps source + dominant provenance to a card hint", () => {
    assert.equal(tracklistProvenanceHint("YouTube", "yt-abc", "1001tl"), "1001tl");
    assert.equal(tracklistProvenanceHint("SoundCloud", "sc-x"), "comments");
    assert.equal(tracklistProvenanceHint("YouTube", "yt-x"), "credits");
    assert.equal(tracklistProvenanceHint(null, "yt-x", "fingerprint"), "fingerprint");
    assert.equal(PROVENANCE_HINT_LABEL["1001tl"], "tracklist");
    assert.equal(PROVENANCE_HINT_LABEL.fingerprint, "ID identification");
  });

  it("matches festival / radio / mix types for ingest and stats", () => {
    assert.equal(setMatchesTypeFilter({ type: "festival" }, "festival"), true);
    assert.equal(
      setMatchesTypeFilter({ type: "mix", venueTier: "festival" }, "festival"),
      true,
    );
    assert.equal(setMatchesTypeFilter({ type: "radio" }, "mix"), false);
    assert.equal(setMatchesTypeFilter({ type: "soundcloud" }, "mix"), true);
  });

  it("collapses YT + SC twins of the same festival set", () => {
    const yt = {
      id: "yt",
      slug: "yt-abc",
      title: "Dom Dolla | Creamfields 2025",
      primaryDjSlug: "dom-dolla",
      eventSlug: "creamfields",
      publishedAt: "2025-08-23T00:00:00Z",
      durationSec: 3600,
      trackCount: 46,
      densitySeverity: "ok" as const,
      sourceName: "YouTube",
      dominantProvenance: "1001tl",
    };
    const sc = {
      ...yt,
      id: "sc",
      slug: "sc-dom-creamfields",
      title: "Dom Dolla Live Creamfields Steel Yard 2025",
      trackCount: 8,
      densitySeverity: "thin" as const,
      sourceName: "SoundCloud",
      dominantProvenance: "soundcloud",
    };
    assert.equal(hostTwinKey(yt), hostTwinKey(sc));
    const kept = collapseHostTwins([sc, yt]);
    assert.equal(kept.length, 1);
    assert.equal(kept[0]!.id, "yt");
  });

  it("collapses a late SoundCloud upload of the same festival night", () => {
    const yt = {
      id: "yt",
      slug: "yt-FQj71mhobYw",
      title:
        "Joris Voorn B2B Korolova LIVE @ ULTRA MUSIC FESTIVAL MIAMI 2026 | RESISTANCE THE COVE",
      primaryDjSlug: "joris-voorn",
      eventSlug: "ultra-miami",
      publishedAt: "2026-04-01T00:00:00Z",
      durationSec: 7167,
      trackCount: 33,
      densitySeverity: "ok" as const,
      sourceName: "YouTube",
      dominantProvenance: "1001tl",
    };
    const sc = {
      ...yt,
      id: "sc",
      slug: "sc-korolovadj-joris-voorn-b2b-korolova-live",
      publishedAt: "2026-05-10T00:00:00Z",
      trackCount: 0,
      densitySeverity: "severe" as const,
      sourceName: "SoundCloud",
      dominantProvenance: "soundcloud",
    };
    assert.equal(hostTwinKey(yt), hostTwinKey(sc));
    const y2014 = {
      ...yt,
      id: "g14",
      slug: "yt-2014",
      title: "David Guetta | Miami Ultra Music Festival 2014",
      primaryDjSlug: "david-guetta",
      publishedAt: "2014-05-22T00:00:00Z",
      durationSec: 3709,
      trackCount: 20,
    };
    const y2024 = {
      ...y2014,
      id: "g24",
      slug: "yt-2024",
      title: "David Guetta | Miami Ultra Music Festival 2024",
      publishedAt: "2024-03-24T00:00:00Z",
      durationSec: 3549,
    };
    assert.notEqual(hostTwinKey(y2014), hostTwinKey(y2024));
    const kept = collapseHostTwins([sc, yt]);
    assert.equal(kept.length, 1);
    assert.equal(kept[0]!.id, "yt");
  });

  it("caps festival-season cards per event brand", () => {
    const out = diversifyByEvent(
      [
        { id: "1", eventSlug: "tomorrowland", title: "A TML" },
        { id: "2", eventSlug: "tomorrowland", title: "B TML" },
        { id: "3", eventSlug: "tomorrowland", title: "C TML" },
        { id: "4", eventSlug: null, title: "Alok | Untold 2026" },
      ],
      2,
    );
    assert.deepEqual(
      out.map((s) => s.id),
      ["1", "2", "4"],
    );
    assert.equal(eventDiversityKey({ title: "Lost Frequencies Tomorrowland 2026" }), "tomorrowland");
  });

  it("groups Deep catalog by week then month", () => {
    const now = Date.parse("2026-08-16T12:00:00Z");
    const groups = groupByDeepWeek(
      [
        { publishedAt: "2026-08-15T00:00:00Z" },
        { publishedAt: "2026-08-08T00:00:00Z" },
        { publishedAt: "2026-07-01T00:00:00Z" },
      ],
      now,
    );
    assert.deepEqual(
      groups.map((g) => g.label),
      ["This week", "Last week", "July 2026"],
    );
    assert.equal(deepWeekLabel("2026-08-16T00:00:00Z", now), "This week");
  });

  it("sorts needs-IDs by lowest identified ratio first", () => {
    const thin = {
      publishedAt: "2026-08-01",
      statusCounts: { identified: 1, unresolved_id: 20, community_resolved: 0, unparsed: 0 },
    };
    const dense = {
      publishedAt: "2026-08-02",
      statusCounts: { identified: 30, unresolved_id: 2, community_resolved: 0, unparsed: 0 },
    };
    assert.ok(compareNeedsIds(thin, dense) < 0);
  });
});
