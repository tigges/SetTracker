import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cueSecondsFromLocation,
  nearestPlayByCue,
  parseCueSeconds,
  setCueHref,
} from "./setCue";

describe("setCue", () => {
  it("builds a set href with an integer cue", () => {
    assert.equal(setCueHref("fisher-edc"), "/sets/fisher-edc");
    assert.equal(setCueHref("fisher-edc", 93), "/sets/fisher-edc?t=93");
    assert.equal(setCueHref("fisher-edc", 0), "/sets/fisher-edc?t=0");
    assert.equal(setCueHref("fisher-edc", 93.8), "/sets/fisher-edc?t=93");
  });

  it("parses t= seconds, YouTube style, and clocks", () => {
    assert.equal(parseCueSeconds("93"), 93);
    assert.equal(parseCueSeconds("93s"), 93);
    assert.equal(parseCueSeconds("1m33s"), 93);
    assert.equal(parseCueSeconds("1:33"), 93);
    assert.equal(parseCueSeconds("1:02:03"), 3723);
    assert.equal(parseCueSeconds(""), null);
    assert.equal(parseCueSeconds("nope"), null);
  });

  it("reads ?t= before #t=", () => {
    assert.equal(cueSecondsFromLocation("?t=40", "#t=9"), 40);
    assert.equal(cueSecondsFromLocation("", "#t=1m33s"), 93);
    assert.equal(cueSecondsFromLocation("?foo=1", "#t=12"), 12);
  });

  it("picks the nearest play to a cue", () => {
    const plays = [
      { id: "a", timestamp: 0 },
      { id: "b", timestamp: 90 },
      { id: "c", timestamp: 180 },
    ];
    assert.equal(nearestPlayByCue(plays, 93)?.id, "b");
    assert.equal(nearestPlayByCue(plays, 0)?.id, "a");
    assert.equal(nearestPlayByCue([], 10), null);
  });
});
