import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  compareRelatedTracks,
  isRelatedTrack,
  rankRelatedTracks,
  type RelatedTrackScore,
} from "./relatedTracks";

function row(
  partial: Partial<RelatedTrackScore> & { trackId: string },
): RelatedTrackScore {
  return {
    playCount: 2,
    setCount: 2,
    djCount: 2,
    eventCount: 1,
    sharedDjCount: 0,
    sameArtist: false,
    sameLabel: false,
    ...partial,
  };
}

describe("relatedTracks", () => {
  it("keeps tracks that share two DJs or the same artist / label", () => {
    assert.equal(
      isRelatedTrack(row({ trackId: "shared", sharedDjCount: 2 })),
      true,
    );
    assert.equal(
      isRelatedTrack(row({ trackId: "artist", sameArtist: true })),
      true,
    );
    assert.equal(
      isRelatedTrack(row({ trackId: "label", sameLabel: true })),
      true,
    );
    assert.equal(
      isRelatedTrack(row({ trackId: "one-dj", sharedDjCount: 1 })),
      false,
    );
  });

  it("ranks shared DJs ahead of same artist or label", () => {
    const shared = row({ trackId: "shared", sharedDjCount: 3 });
    const artist = row({ trackId: "artist", sameArtist: true, sharedDjCount: 1 });
    const label = row({ trackId: "label", sameLabel: true, sharedDjCount: 0 });
    const ranked = rankRelatedTracks([label, artist, shared], 8);
    assert.deepEqual(
      ranked.map((r) => r.trackId),
      ["shared", "artist", "label"],
    );
    assert.ok(compareRelatedTracks(shared, artist) < 0);
  });

  it("caps at eight and skips one-DJ misses", () => {
    const rows = Array.from({ length: 10 }, (_, i) =>
      row({
        trackId: `t${i}`,
        sharedDjCount: 2,
        djCount: 10 - i,
      }),
    );
    rows.push(row({ trackId: "skip", sharedDjCount: 1 }));
    const ranked = rankRelatedTracks(rows, 8);
    assert.equal(ranked.length, 8);
    assert.equal(ranked[0]?.trackId, "t0");
    assert.ok(!ranked.some((r) => r.trackId === "skip"));
  });
});
