import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  appleMixRowsToPlays,
  parseAppleDuration,
  parseAppleMusicMixTracklist,
  stripMixedTag,
} from "./parse";

describe("parseAppleDuration", () => {
  it("reads mm:ss segment lengths", () => {
    assert.equal(parseAppleDuration("4:48"), 4 * 60 + 48);
    assert.equal(parseAppleDuration("3:16"), 3 * 60 + 16);
    assert.equal(parseAppleDuration("1:02:03"), 3723);
    assert.equal(parseAppleDuration("??"), null);
  });
});

describe("stripMixedTag", () => {
  it("keeps the catalog title and records Mixed", () => {
    assert.deepEqual(stripMixedTag("I Wonder If You Know (Mixed)"), {
      title: "I Wonder If You Know",
      mixName: "Mixed",
    });
    assert.deepEqual(stripMixedTag("My Love (2024) [Mixed]"), {
      title: "My Love (2024)",
      mixName: "Mixed",
    });
  });
});

describe("appleMixRowsToPlays", () => {
  it("accumulates official Apple Music segment lengths into start clocks", () => {
    const plays = appleMixRowsToPlays([
      { artistName: "Alok, SOMETHING ELSE", trackTitle: "I Wonder If You Know (Mixed)", durationSec: 4 * 60 + 48 },
      { artistName: "Adam Port, Stryv, Malachiii", trackTitle: "Move (Mixed)", durationSec: 3 * 60 + 16 },
      { artistName: "Route 94, Jess Glynne, Alex Wann", trackTitle: "My Love (2024) [Mixed]", durationSec: 3 * 60 + 13 },
      { artistName: "Imael Angel, HUGEL, Ultra Naté", trackTitle: "Movin' To The Sun (Mixed)", durationSec: 3 * 60 + 51 },
      { artistName: "Joëlla Jackson, Nick Curly", trackTitle: "Attention (Mixed)", durationSec: 3 * 60 + 48 },
      { artistName: "CamelPhat, Elderbrook", trackTitle: "Cola (Mixed)", durationSec: 3 * 60 + 36 },
      { artistName: "Toman", trackTitle: "Verano en NY (Mixed)", durationSec: 2 * 60 + 50 },
    ]);
    assert.equal(plays.length, 7);
    assert.equal(plays[0]!.timestamp, 0);
    assert.equal(plays[0]!.trackTitle, "I Wonder If You Know");
    assert.equal(plays[0]!.mixName, "Mixed");
    assert.equal(plays[0]!.provenance, "applemusic");
    assert.equal(plays[1]!.timestamp, 4 * 60 + 48);
    assert.equal(plays[2]!.timestamp, 8 * 60 + 4);
    assert.equal(plays[3]!.timestamp, 11 * 60 + 17);
    assert.equal(plays[4]!.timestamp, 15 * 60 + 8);
    assert.equal(plays[5]!.timestamp, 18 * 60 + 56);
    assert.equal(plays[6]!.timestamp, 22 * 60 + 32);
    assert.equal(plays[6]!.artistName, "Toman");
  });
});

describe("parseAppleMusicMixTracklist", () => {
  it("reads stacked Apple Music album rows", () => {
    const plays = parseAppleMusicMixTracklist(`
1
I Wonder If You Know (Mixed)
Alok, SOMETHING ELSE
4:48
2
Move (Mixed)
Adam Port, Stryv, Malachiii
3:16
3
My Love (2024) [Mixed]
Route 94, Jess Glynne, Alex Wann
3:13
`);
    assert.equal(plays.length, 3);
    assert.equal(plays[0]!.timestamp, 0);
    assert.equal(plays[1]!.timestamp, 288);
    assert.equal(plays[2]!.timestamp, 484);
  });
});
