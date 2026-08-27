import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  COMMENT_LIKELY_TALK,
  COMMENT_LOW_CONFIDENCE,
  COMMENT_NOT_DETECTED,
  UNKNOWN_TRACK_TITLE,
  displayPlayTitle,
  hasVendorDetectionCopy,
  parseWeakFingerprintHint,
  publicStatusLabel,
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
    assert.deepEqual(
      parseWeakFingerprintHint(
        "acr-miss @ 12:00: weak score 48: Amelie Lens - Exhale · ISRC BE6F51700012",
      ),
      { artist: "Amelie Lens", title: "Exhale" },
    );
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
      type: "festival",
    });
    assert.ok(published.length >= 15 && published.length <= 20);
    assert.ok(published.every((p) => !hasVendorDetectionCopy(p.title, p.rawText, p.idNote)));
    assert.ok(published.every((p) => p.detectionComment === COMMENT_NOT_DETECTED));
    assert.ok(published.some((p) => p.id.startsWith("expected:")));
    assert.ok(
      published
        .filter((p) => p.id.startsWith("expected:") || p.id.startsWith("talk:"))
        .every((p) => p.sourcePosition == null),
      "synthetic slots must not leak a stored Played.position",
    );
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

  it("keeps host comment times and drops chat on a radio show", () => {
    const plays = [
      play({
        id: "berlin",
        timestamp: 21,
        provenance: "soundcloud",
        title: "where's the Berlin set???",
        rawText: "where's the Berlin set???",
      }),
      play({
        id: "nein",
        timestamp: 792,
        provenance: "soundcloud",
        title: "Nein?",
        rawText: "Nein?",
      }),
      play({
        id: "ask",
        timestamp: 804,
        provenance: "soundcloud",
        idStatus: "unresolved_id",
        title: "ID - ID",
        idNote: "What is this track! I fkn love it!",
      }),
      play({
        id: "acid",
        timestamp: 1944,
        provenance: "soundcloud",
        idStatus: "unresolved_id",
        title: "Acid Is My Therapy",
        idNote: "Thank you for Supporting my Track 'Acid Is My Therapy'",
      }),
    ];
    const published = publishSetPlays(plays, {
      durationSec: 3441,
      genre: "Techno",
      type: "radio",
      title: "Amelie Lens Radio Show 015",
    });
    assert.ok(!published.some((p) => /Berlin|Nein/i.test(p.title)));
    const ask = published.find((p) => p.id === "ask");
    assert.ok(ask);
    assert.equal(ask!.timestamp, 804);
    assert.equal(ask!.title, UNKNOWN_TRACK_TITLE);
    assert.equal(ask!.idStatus, "unresolved_id");
    const acid = published.find((p) => /Acid Is My Therapy/i.test(p.title));
    assert.ok(acid);
    assert.equal(acid!.timestamp, 1944);
    assert.ok(published.length >= 12 && published.length <= 20);
    assert.ok(
      published
        .filter((p) => p.id.startsWith("expected:"))
        .every((p) => p.timestamp >= 150),
    );
  });

  it("labels weekly radio open and close as likely talk", () => {
    const published = publishSetPlays(
      [
        play({
          id: "ask",
          timestamp: 804,
          provenance: "soundcloud",
          idStatus: "unresolved_id",
          title: "ID - ID",
          idNote: "What is this track!",
        }),
      ],
      {
        durationSec: 3441,
        genre: "Techno",
        type: "radio",
        title: "Amelie Lens Radio Show 015",
      },
    );
    const talks = published.filter((p) => p.segmentKind === "talk");
    assert.equal(talks.length, 2);
    assert.equal(talks[0]!.timestamp, 0);
    assert.equal(talks[0]!.talkUntil, 150);
    assert.equal(talks[0]!.detectionComment, COMMENT_LIKELY_TALK);
    assert.equal(talks[1]!.timestamp, 3441 - 75);
    assert.ok(published.filter((p) => p.segmentKind !== "talk").every((p) => p.position > 0));
  });

  it("does not label talk on live-from-festival radio or when a cue sits in the open", () => {
    const live = publishSetPlays(
      [
        play({
          id: "hit",
          timestamp: 90,
          idStatus: "identified",
          title: "Exhale",
          artistName: "Amelie Lens",
          trackSlug: "exhale",
        }),
      ],
      {
        durationSec: 3600,
        genre: "Techno",
        type: "radio",
        title: "Exhale Radio 121 live from Tomorrowland",
      },
    );
    assert.equal(live.filter((p) => p.segmentKind === "talk").length, 0);

    const blocked = publishSetPlays(
      [
        play({
          id: "ask",
          timestamp: 30,
          provenance: "soundcloud",
          idStatus: "unresolved_id",
          title: "ID - ID",
          idNote: "id?",
        }),
      ],
      {
        durationSec: 3600,
        genre: "Techno",
        type: "radio",
        title: "Amelie Lens Radio Show 015",
      },
    );
    assert.ok(!blocked.some((p) => p.segmentKind === "talk" && p.timestamp === 0));
  });

  it("keeps a title-only first-party clock", () => {
    const published = publishSetPlays(
      [
        play({
          id: "yt1",
          timestamp: 0,
          provenance: "youtube",
          idStatus: "identified",
          title: "They Will Shade Us With Their Wings",
        }),
        play({
          id: "yt2",
          timestamp: 581,
          provenance: "youtube",
          idStatus: "identified",
          title: "Life Study 1",
        }),
      ],
      { durationSec: 3600, genre: "Other", type: "festival", title: "Max Richter" },
    );
    assert.equal(published.length, 2);
    assert.equal(published[0]!.title, "They Will Shade Us With Their Wings");
  });

  it("snaps a fingerprint hit onto a nearby host comment time", () => {
    const published = publishSetPlays(
      [
        play({
          id: "ask",
          timestamp: 800,
          provenance: "soundcloud",
          idStatus: "unresolved_id",
          title: "ID - ID",
          idNote: "What is this track!",
        }),
        play({
          id: "fp",
          timestamp: 830,
          provenance: "fingerprint",
          idStatus: "identified",
          title: "Exhale",
          artistName: "Amelie Lens",
          trackSlug: "exhale",
        }),
      ],
      { durationSec: 3600, genre: "Techno", type: "radio", title: "Radio Show 015" },
    );
    const row = published.find((p) => p.trackSlug === "exhale");
    assert.ok(row);
    assert.equal(row!.timestamp, 800);
    assert.equal(published.filter((p) => p.trackSlug === "exhale").length, 1);
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
    assert.equal(
      shouldFillExpectedSlots({
        durationSec: 3441,
        namedCount: 0,
        placeholderCount: 0,
        spineCount: 0,
        idAskCount: 3,
        droppedChat: true,
        genre: "Techno",
        type: "radio",
        title: "Amelie Lens Radio Show 015",
      }),
      true,
    );
    assert.equal(
      shouldFillExpectedSlots({
        durationSec: 3600,
        namedCount: 2,
        placeholderCount: 8,
        spineCount: 12,
        interpolatedSpine: true,
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

describe("listener-facing unknown copy", () => {
  it("maps leftover Unknown titles to Unknown track", () => {
    assert.equal(displayPlayTitle("Unknown"), UNKNOWN_TRACK_TITLE);
    assert.equal(displayPlayTitle("unknown tracks"), UNKNOWN_TRACK_TITLE);
    assert.equal(displayPlayTitle("Exhale"), "Exhale");
  });

  it("labels unresolved rows as Unknown track, not Unresolved ID", () => {
    assert.equal(
      publicStatusLabel({
        idStatus: "unresolved_id",
        detectionComment: null,
        segmentKind: "track",
      }),
      UNKNOWN_TRACK_TITLE,
    );
    assert.equal(
      publicStatusLabel({
        idStatus: "unparsed",
        detectionComment: COMMENT_NOT_DETECTED,
        segmentKind: "track",
      }),
      COMMENT_NOT_DETECTED,
    );
  });
});
