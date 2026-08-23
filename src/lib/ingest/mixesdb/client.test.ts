import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  allowMixesdbLiveFetch,
  playsFromDescriptionMixesdbLinks,
  playsFromMixesdbUrls,
} from "./client";

describe("MixesDB live fetch gate", () => {
  it("is off unless INGEST_ALLOW_MIXESDB_FETCH=1", () => {
    const prev = process.env.INGEST_ALLOW_MIXESDB_FETCH;
    delete process.env.INGEST_ALLOW_MIXESDB_FETCH;
    assert.equal(allowMixesdbLiveFetch(), false);
    process.env.INGEST_ALLOW_MIXESDB_FETCH = "1";
    assert.equal(allowMixesdbLiveFetch(), true);
    if (prev === undefined) delete process.env.INGEST_ALLOW_MIXESDB_FETCH;
    else process.env.INGEST_ALLOW_MIXESDB_FETCH = prev;
  });

  it("returns [] without hitting the network when fetch is off", async () => {
    const prev = process.env.INGEST_ALLOW_MIXESDB_FETCH;
    delete process.env.INGEST_ALLOW_MIXESDB_FETCH;
    const plays = await playsFromMixesdbUrls(
      ["https://www.mixesdb.com/w/2026-08-07_-_Korolova_-_Captive_Soul_098"],
      3600,
    );
    assert.deepEqual(plays, []);
    const fromDesc = await playsFromDescriptionMixesdbLinks(
      "Tracklist: https://www.mixesdb.com/w/2026-08-07_-_Korolova_-_Captive_Soul_098",
      3600,
    );
    assert.deepEqual(fromDesc, []);
    if (prev === undefined) delete process.env.INGEST_ALLOW_MIXESDB_FETCH;
    else process.env.INGEST_ALLOW_MIXESDB_FETCH = prev;
  });
});
