import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { collapseConsecutivePlays, playCollapseKey } from "./playCollapse";

describe("playCollapse", () => {
  it("collapses consecutive fingerprint hits of the same song", () => {
    const roses = {
      artistName: "Timmy Trumpet, bradeazy, Richard Judge",
      title: "Roses (feat. Richard Judge)",
    };
    const rows = [
      { at: 60, ...roses },
      { at: 120, ...roses },
      { at: 180, ...roses },
      { at: 240, ...roses },
      {
        at: 300,
        artistName: "Timmy Trumpet",
        title: "Freaks",
      },
    ];
    const kept = collapseConsecutivePlays(rows);
    assert.equal(kept.length, 2);
    assert.equal(kept[0]!.at, 60);
    assert.equal(kept[1]!.title, "Freaks");
  });

  it("keeps a real replay that is not consecutive", () => {
    const rows = [
      { artistName: "A", title: "Opener" },
      { artistName: "B", title: "Middle" },
      { artistName: "A", title: "Opener" },
    ];
    const kept = collapseConsecutivePlays(rows);
    assert.equal(kept.length, 3);
    assert.equal(kept[0]!.title, "Opener");
    assert.equal(kept[2]!.title, "Opener");
  });

  it("does not collapse unidentified / acr-miss rows", () => {
    const rows = [
      { artistName: null, title: "acr-miss @ 1:00: no match" },
      { artistName: null, title: "acr-miss @ 2:00: no match" },
    ];
    assert.equal(playCollapseKey(rows[0]!), null);
    assert.equal(collapseConsecutivePlays(rows).length, 2);
  });

  it("uses trackSlug when present", () => {
    const rows = [
      { trackSlug: "roses-feat-richard-judge", artistName: "X", title: "Y" },
      { trackSlug: "roses-feat-richard-judge", artistName: "Z", title: "W" },
    ];
    assert.equal(collapseConsecutivePlays(rows).length, 1);
  });
});
