import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { listableSets } from "./setList";

describe("listableSets", () => {
  it("keeps the denser host twin", () => {
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
      dominantProvenance: "1001tl",
    };
    const sc = {
      ...yt,
      id: "sc",
      slug: "sc-dom-creamfields",
      trackCount: 0,
      densitySeverity: "severe" as const,
      dominantProvenance: "soundcloud",
    };
    const kept = listableSets([sc, yt]);
    assert.equal(kept.length, 1);
    assert.equal(kept[0]!.id, "yt");
  });
});
