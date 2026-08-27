import assert from "node:assert/strict";
import { mergeCommunityKeeps, type CommunityKeep } from "./communityKeeps";
import type { RawPlay } from "./types";

function source(partial: Partial<RawPlay> & { position: number; timestamp: number }): RawPlay {
  return {
    idStatus: "unparsed",
    provenance: "soundcloud",
    rawText: "ID",
    ...partial,
  };
}

function keep(partial: Partial<CommunityKeep> & { position: number; timestamp: number }): CommunityKeep {
  return {
    trackTitle: "No Panties",
    artistName: "Fallon",
    idLabel: "Fallon - ID",
    note: "Suggested by suggest-id",
    ...partial,
  };
}

{
  // Inserted resolution at max(position)+1 must not overwrite source play 1
  // when the next ingest grows the tracklist.
  const plays = [
    source({ position: 1, timestamp: 90, rawText: "host ask" }),
    source({ position: 2, timestamp: 600, rawText: "other" }),
  ];
  const merged = mergeCommunityKeeps(plays, [
    keep({ position: 3, timestamp: 1972 }),
  ]);
  assert.equal(merged.length, 3);
  const inserted = merged.find((p) => p.timestamp === 1972);
  assert.ok(inserted);
  assert.equal(inserted!.idStatus, "community_resolved");
  assert.equal(inserted!.artistName, "Fallon");
  assert.equal(
    merged.find((p) => p.timestamp === 90)?.rawText,
    "host ask",
    "source cue at a different clock must survive",
  );
}

{
  // Same timestamp replaces the source row (overlay on a real cue).
  const plays = [
    source({ position: 1, timestamp: 1508, rawText: "unknown" }),
    source({ position: 2, timestamp: 2204, rawText: "other" }),
  ];
  const merged = mergeCommunityKeeps(plays, [
    keep({
      position: 11,
      timestamp: 1508,
      trackTitle: "Va Va Voom",
      artistName: "Joey London Style",
    }),
  ]);
  assert.equal(merged.length, 2);
  const hit = merged.find((p) => p.timestamp === 1508);
  assert.equal(hit?.artistName, "Joey London Style");
  assert.equal(hit?.trackTitle, "Va Va Voom");
  assert.equal(merged.find((p) => p.timestamp === 2204)?.rawText, "other");
}

{
  // Position fallback still works when the keep has no matching clock in source
  // but the stored position still names that cue (legacy overlay).
  const plays = [source({ position: 6, timestamp: 1508, rawText: "unknown" })];
  const merged = mergeCommunityKeeps(plays, [
    keep({ position: 6, timestamp: 1508, trackTitle: "Va Va Voom", artistName: "Joey London Style" }),
  ]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0]!.trackTitle, "Va Va Voom");
}

console.log("ingest/communityKeeps.test.ts ok");
