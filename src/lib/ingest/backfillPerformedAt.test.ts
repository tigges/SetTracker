import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { derivePerformedAt } from "./derivePerformedAt";

describe("derivePerformedAt", () => {
  const now = Date.parse("2026-08-20T12:00:00Z");

  it("prefers a title calendar day", () => {
    const d = derivePerformedAt(
      "HoneyLuv @ ANTS Ushuaïa Ibiza 2026-06-17",
      "yt-abc",
      {},
      now,
    );
    assert.equal(d?.toISOString().slice(0, 10), "2026-06-17");
  });

  it("reads the night from a curated 1001 URL when the title has none", () => {
    const d = derivePerformedAt(
      "Chris Stussy | Boiler Room: Edinburgh",
      "yt-42XFNGZrpaQ",
      {
        "yt-42XFNGZrpaQ":
          "https://www.1001tracklists.com/tracklist/2787514k/chris-stassy-boiler-room-edinburgh-united-kingdom-2024-05-19.html",
      },
      now,
    );
    assert.equal(d?.toISOString().slice(0, 10), "2024-05-19");
  });

  it("does not invent July 1 from a year-only title", () => {
    assert.equal(
      derivePerformedAt(
        "Kölsch - Zurich Street Parade 2025 - ARTE Concert",
        "yt-x",
        {},
        now,
      ),
      null,
    );
  });
});
