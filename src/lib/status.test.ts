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
  it("uses a canonical Beatport /track URL when stored", () => {
    const links = listenLinks("Pressure", "AC Slater", {
      beatportUrl: "https://www.beatport.com/track/pressure/12345",
    });
    assert.equal(links.beatport, "https://www.beatport.com/track/pressure/12345");
    assert.equal(links.beatportIsCanonical, true);
    assert.match(links.spotify, /open\.spotify\.com\/search/);
    assert.equal(links.spotifyIsCanonical, false);
  });

  it("uses a canonical Spotify track URL when stored", () => {
    const links = listenLinks("Beautiful Now", "Zedd", {
      spotifyUrl: "https://open.spotify.com/track/2ISSQPb9LHHiV6ng2NXosL?si=x",
    });
    assert.equal(
      links.spotify,
      "https://open.spotify.com/track/2ISSQPb9LHHiV6ng2NXosL",
    );
    assert.equal(links.spotifyIsCanonical, true);
  });

  it("strips query params from stored Beatport /track URLs", () => {
    const links = listenLinks("Pressure", "AC Slater", {
      beatportUrl: "https://www.beatport.com/track/pressure/1?foo=1",
    });
    assert.equal(links.beatport, "https://www.beatport.com/track/pressure/1");
    assert.equal(links.beatportIsCanonical, true);
  });

  it("falls back to store search when the stored URL is not a /track page", () => {
    const links = listenLinks("Pressure", "AC Slater", {
      beatportUrl: "https://www.beatport.com/search?q=Pressure",
    });
    assert.match(links.beatport, /beatport\.com\/search\/tracks\?q=/);
    assert.equal(links.beatportIsCanonical, false);
    assert.match(links.spotify, /open\.spotify\.com\/search/);
    assert.equal(links.spotifyIsCanonical, false);
  });
});
