import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isBrandHostSlug,
  setHostHeadline,
} from "./brandHosts";

describe("brandHosts", () => {
  it("recognizes Insomniac as a brand host slug", () => {
    assert.equal(isBrandHostSlug("insomniac"), true);
    assert.equal(isBrandHostSlug("cercle"), true);
    assert.equal(isBrandHostSlug("dom-dolla"), false);
    assert.equal(isBrandHostSlug("bart-skils"), false);
  });

  it("headlines series for brand-host primaries", () => {
    assert.equal(
      setHostHeadline({
        title: "Night Owl Radio 482",
        primaryDj: { name: "INSOMNIAC", slug: "insomniac" },
        collaborators: [],
        seriesName: "Night Owl Radio",
        eventName: "Insomniac",
      }),
      "Night Owl Radio",
    );
  });

  it("keeps performing DJ headlines", () => {
    assert.equal(
      setHostHeadline({
        title: "Guest set",
        primaryDj: { name: "Loofy", slug: "loofy" },
        collaborators: [{ name: "D.O.D" }],
        seriesName: "Night Owl Radio",
        eventName: "Insomniac",
      }),
      "Loofy b2b D.O.D",
    );
  });
});
