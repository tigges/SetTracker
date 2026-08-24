import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  COMMENT_LOW_CONFIDENCE,
  COMMENT_NOT_DETECTED,
  hasVendorDetectionCopy,
  parseWeakFingerprintHint,
  publishListTally,
  publishSetPlays,
  shouldFillExpectedSlots,
  type PublishablePlay,
} from "./publishPlays";

function play(partial: Partial<PublishablePlay> & { id: string }): PublishablePlay {
  return {
    position: 1,
    timestamp: 0,
    idStatus: "unparsed",
    provenance: "fingerprint",
    title: "Unknown",
    artistName: null,
    rawText: null,
    idNote: null,
    trackSlug: null,
    ...partial,
  };
}

describe("weak hint parse", () => {
  it("reads artist / title from a weak-score note", () => {
    const hint = parseWeakFingerprintHint(
      "weak score 48: Amelie Lens - Exhale",
    );
    assert.deepEqual(hint, { artist: "Amelie Lens", title: "Exhale" });
  });

  it("ignores vendor miss text without a name", () => {
    assert.equal(parseWeakFingerprintHint("acr-miss @ 12:00: no ACRCloud match"), null);
    assert.equal(hasVendorDetectionCopy("acr-miss @ 12:00: no match"), true);
  });
});

describe("publishSetPlays", () => {
  it("projects a fingerprint miss grid to expected techno slots", () => {
    const plays = Array.from({ length: 69 }, (_, i) =>
      play({
        id: `m${i}`,
        position: i + 1,
        timestamp: i * 60,
        rawText: `acr-miss @ ${i}:00: no ACRCloud match`,
        title: `acr-miss @ ${i}:00: no ACRCloud match`,
      }),
    );
    const published = publishSetPlays(plays, {
      durationSec: 3600,
      genre: "Techno",
      type: "radio",
    });
    assert.ok(published.length >= 15 && published.length <= 20);
    assert.ok(published.every((p) => !hasVendorDetectionCopy(p.title, p.rawText, p.idNote)));
    assert.ok(published.every((p) => p.detectionComment === COMMENT_NOT_DETECTED));
    assert.ok(published.some((p) => p.id.startsWith("expected:")));
  });

  it("keeps a low-confidence hint and asks to confirm", () => {
    const plays = [
      play({
        id: "w1",
        timestamp: 600,
        idStatus: "unparsed",
        rawText: "ID @ 10:00 (fingerprint weak)",
        title: "ID @ 10:00 (fingerprint weak)",
        idNote: "weak score 48: Amelie Lens - Exhale",
      }),
      ...Array.from({ length: 20 }, (_, i) =>
        play({
          id: `m${i}`,
          timestamp: i * 90,
          title: `acr-miss @ ${i}`,
          rawText: `acr-miss @ ${i}: no match`,
        }),
      ),
    ];
    const published = publishSetPlays(plays, {
      durationSec: 3600,
      genre: "Techno",
      type: "radio",
    });
    const hint = published.find((p) => p.suggestedTitle === "Exhale");
    assert.ok(hint);
    assert.equal(hint!.artistName, "Amelie Lens");
    assert.equal(hint!.title, "Exhale");
    assert.equal(hint!.idStatus, "unresolved_id");
    assert.equal(hint!.detectionComment, COMMENT_LOW_CONFIDENCE);
    assert.ok(!hasVendorDetectionCopy(hint!.title, hint!.idNote));
  });

  it("does not invent slots on a first-party clock list", () => {
    const plays = Array.from({ length: 16 }, (_, i) =>
      play({
        id: `s${i}`,
        timestamp: i * 210,
        idStatus: "identified",
        provenance: "1001tl",
        title: `Track ${i}`,
        artistName: "Someone",
        trackSlug: `track-${i}`,
      }),
    );
    const extras = Array.from({ length: 40 }, (_, i) =>
      play({
        id: `m${i}`,
        timestamp: 30 + i * 60,
        title: `acr-miss @ ${i}`,
        rawText: `acr-miss @ ${i}: no match`,
      }),
    );
    const published = publishSetPlays([...plays, ...extras], {
      durationSec: 3600,
      genre: "Techno",
      type: "festival",
    });
    assert.equal(published.length, 16);
    assert.ok(published.every((p) => p.provenance === "1001tl"));
  });

  it("never drops a confirmed fingerprint ID", () => {
    const plays = [
      play({
        id: "hit",
        timestamp: 120,
        idStatus: "identified",
        title: "I See You",
        artistName: "Amelie Lens",
        trackSlug: "i-see-you",
      }),
      ...Array.from({ length: 30 }, (_, i) =>
        play({
          id: `m${i}`,
          timestamp: 200 + i * 60,
          title: `acr-miss @ ${i}`,
          rawText: `acr-miss @ ${i}: no match`,
        }),
      ),
    ];
    const published = publishSetPlays(plays, {
      durationSec: 3600,
      genre: "Techno",
    });
    assert.ok(published.some((p) => p.trackSlug === "i-see-you"));
    assert.ok(published.length >= 15);
  });
});

describe("shouldFillExpectedSlots", () => {
  it("fills a miss grid and skips a thin source list without probes", () => {
    assert.equal(
      shouldFillExpectedSlots({
        durationSec: 3600,
        namedCount: 0,
        placeholderCount: 69,
        spineCount: 0,
        genre: "Techno",
      }),
      true,
    );
    assert.equal(
      shouldFillExpectedSlots({
        durationSec: 3600,
        namedCount: 6,
        placeholderCount: 0,
        spineCount: 6,
        genre: "House",
      }),
      false,
    );
  });
});

describe("publishListTally", () => {
  it("replaces an all-miss hour with expected unparsed slots", () => {
    const published = publishListTally(
      {
        counts: {
          identified: 0,
          unresolved_id: 0,
          community_resolved: 0,
          unparsed: 69,
        },
        trackCount: 69,
        fingerprintUnparsed: 69,
        spineCount: 0,
      },
      { durationSec: 3600, genre: "Techno", type: "radio" },
    );
    assert.ok(published.trackCount >= 15 && published.trackCount <= 20);
    assert.equal(published.counts.unparsed, published.trackCount);
    assert.equal(published.counts.identified, 0);
  });

  it("hides misses on a 1001 list without adding slots", () => {
    const published = publishListTally(
      {
        counts: {
          identified: 16,
          unresolved_id: 0,
          community_resolved: 0,
          unparsed: 40,
        },
        trackCount: 56,
        fingerprintUnparsed: 40,
        spineCount: 16,
      },
      { durationSec: 3600, genre: "Techno" },
    );
    assert.equal(published.trackCount, 16);
    assert.equal(published.counts.unparsed, 0);
    assert.equal(published.counts.identified, 16);
  });
});
