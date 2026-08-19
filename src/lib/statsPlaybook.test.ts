import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildPlaybookItems,
  isWeakOrEmptyWebsite,
  leftoverHostInCatalog,
  leftoverHostOnQueue,
  weakChartWebsite,
} from "./statsPlaybook";

describe("statsPlaybook", () => {
  it("flags leftover hosts still sitting on the handle queue", () => {
    assert.equal(
      leftoverHostOnQueue({
        name: "Behind Cercle Odyssey I Chapter Four",
        hasHandle: false,
        setCount: 2,
      }),
      true,
    );
    assert.equal(
      leftoverHostOnQueue({
        name: "Live in Buenos Aires",
        hasHandle: false,
        setCount: 1,
      }),
      true,
    );
    assert.equal(
      leftoverHostOnQueue({
        name: "Rave Ukraine: DJ Sets",
        hasHandle: false,
        setCount: 3,
      }),
      true,
    );
    assert.equal(
      leftoverHostOnQueue({
        name: "Charlotte de Witte",
        hasHandle: false,
        setCount: 4,
      }),
      false,
    );
    assert.equal(
      leftoverHostOnQueue({
        name: "Live in Buenos Aires",
        hasHandle: false,
        setCount: 1,
        isJunk: true,
      }),
      false,
    );
    assert.equal(
      leftoverHostInCatalog({
        name: "Live in Buenos Aires",
        setCount: 1,
      }),
      true,
    );
  });

  it("treats empty and directory sites as weak", () => {
    assert.equal(isWeakOrEmptyWebsite(null), true);
    assert.equal(isWeakOrEmptyWebsite("https://djmag.com/top100clubs/1"), true);
    assert.equal(isWeakOrEmptyWebsite("https://fabriclondon.com/"), false);
    assert.equal(
      weakChartWebsite({ onChart: true, website: "https://ra.co/clubs/1" }),
      true,
    );
    assert.equal(
      weakChartWebsite({ onChart: false, website: null }),
      false,
    );
  });

  it("orders the seven operator steps", () => {
    const items = buildPlaybookItems({
      leftoverHosts: 4,
      tracksNeedIsrc: 17000,
      weakChartSites: 78,
      chartClubsNoCalendar: 88,
      starIdGaps: 120,
      handlesAfterHosts: 0,
    });
    assert.deepEqual(
      items.map((i) => i.step),
      [1, 2, 3, 4, 5, 6, 7],
    );
    assert.equal(items[0]?.count, 4);
    assert.equal(items[5]?.count, 0);
    assert.equal(items[1]?.href, "/exports/tracks-need-id.csv");
  });
});
