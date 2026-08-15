import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  allow1001LiveFetch,
  playsFrom1001Urls,
  playsFromDescription1001Links,
} from "./client";

describe("1001 live fetch gate", () => {
  it("is off unless INGEST_ALLOW_1001_FETCH=1", () => {
    const prev = process.env.INGEST_ALLOW_1001_FETCH;
    delete process.env.INGEST_ALLOW_1001_FETCH;
    assert.equal(allow1001LiveFetch(), false);
    process.env.INGEST_ALLOW_1001_FETCH = "1";
    assert.equal(allow1001LiveFetch(), true);
    if (prev === undefined) delete process.env.INGEST_ALLOW_1001_FETCH;
    else process.env.INGEST_ALLOW_1001_FETCH = prev;
  });

  it("returns [] without hitting the network when fetch is off", async () => {
    const prev = process.env.INGEST_ALLOW_1001_FETCH;
    delete process.env.INGEST_ALLOW_1001_FETCH;
    const plays = await playsFrom1001Urls(
      [
        "https://www.1001tracklists.com/tracklist/1tfpw4qk/steve-angello-mainstage-tomorrowland-weekend-2-belgium-2026-07-24.html",
      ],
      3600,
    );
    assert.deepEqual(plays, []);
    const fromDesc = await playsFromDescription1001Links(
      "Tracklist: https://1001.tl/1tfpw4qk",
      3600,
    );
    assert.deepEqual(fromDesc, []);
    if (prev === undefined) delete process.env.INGEST_ALLOW_1001_FETCH;
    else process.env.INGEST_ALLOW_1001_FETCH = prev;
  });
});
