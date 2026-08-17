import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fmtDate, fmtRelative, listenLinks } from "./status";

describe("fmtRelative", () => {
  const now = Date.parse("2026-08-15T12:00:00Z");

  it("uses days and weeks for recent dates", () => {
    assert.equal(fmtRelative("2026-08-15T10:00:00Z", now), "today");
    assert.equal(fmtRelative("2026-08-14T12:00:00Z", now), "yesterday");
    assert.equal(fmtRelative("2026-08-10T12:00:00Z", now), "5d ago");
    assert.equal(fmtRelative("2026-07-20T12:00:00Z", now), "3w ago");
  });

  it("uses years after 12 months, not 148mo ago", () => {
    assert.equal(fmtRelative("2025-08-15T12:00:00Z", now), "1y ago");
    assert.equal(fmtRelative("2014-07-15T12:00:00Z", now), "12y ago");
  });
});

describe("fmtDate", () => {
  it("includes the year", () => {
    assert.match(fmtDate("2014-03-28T00:00:00Z"), /2014/);
  });
});

describe("listenLinks", () => {
  it("uses a canonical Beatport track URL when stored", () => {
    const links = listenLinks("Pressure", "AC Slater", {
      beatportUrl: "https://www.beatport.com/track/pressure/12345",
      setSourceUrl: "https://soundcloud.com/acslater/set",
    });
    assert.equal(links.beatport, "https://www.beatport.com/track/pressure/12345");
    assert.equal(links.beatportIsCanonical, true);
    assert.equal(links.soundcloud, "https://soundcloud.com/acslater/set");
    assert.match(links.youtube, /youtube\.com\/results/);
  });

  it("falls back to Beatport track search, not a 1001 link", () => {
    const links = listenLinks("Pressure", "AC Slater", {
      beatportUrl: "https://www.beatport.com/search?q=Pressure",
    });
    assert.match(links.beatport, /beatport\.com\/search\/tracks\?q=/);
    assert.equal(links.beatportIsCanonical, false);
    assert.equal(links.soundcloud, null);
  });
});
