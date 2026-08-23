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
  it("timestamps SoundCloud to the set upload and keeps canonical Beatport", () => {
    const links = listenLinks("Pressure", "AC Slater", {
      beatportUrl: "https://www.beatport.com/track/pressure/12345",
      setSourceUrl: "https://soundcloud.com/acslater/set",
      startSec: 93,
    });
    assert.equal(links.beatport, "https://www.beatport.com/track/pressure/12345");
    assert.equal(links.beatportIsCanonical, true);
    assert.equal(
      links.soundcloud,
      "https://soundcloud.com/acslater/set#t=93",
    );
    assert.equal(links.youtube, null);
    assert.equal(links.spotify, null);
    assert.equal(links.spotifyIsCanonical, false);
  });

  it("timestamps YouTube playback and can keep a SoundCloud source", () => {
    const links = listenLinks("Pressure", "AC Slater", {
      setPlaybackUrl: "https://youtu.be/dQw4w9WgXcQ",
      setSourceUrl: "https://soundcloud.com/acslater/set",
      startSec: 40,
    });
    assert.equal(
      links.youtube,
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=40s",
    );
    assert.equal(links.soundcloud, "https://soundcloud.com/acslater/set#t=40");
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

  it("hides Beatport / Spotify / YouTube / SoundCloud when there is no real URL", () => {
    const links = listenLinks("Pressure", "AC Slater", {
      beatportUrl: "https://www.beatport.com/search?q=Pressure",
    });
    assert.equal(links.beatport, null);
    assert.equal(links.beatportIsCanonical, false);
    assert.equal(links.spotify, null);
    assert.equal(links.youtube, null);
    assert.equal(links.soundcloud, null);
  });
});
