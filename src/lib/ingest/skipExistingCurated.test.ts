import assert from "node:assert/strict";
import {
  setExistingCuratedSlugs,
  shouldFetchCuratedSlug,
  skipExistingCuratedEnabled,
} from "./skipExistingCurated";

const prev = process.env.INGEST_SKIP_EXISTING_CURATED;
setExistingCuratedSlugs(["yt-already", "sc-already"]);

delete process.env.INGEST_SKIP_EXISTING_CURATED;
assert.equal(skipExistingCuratedEnabled(), false);
assert.equal(shouldFetchCuratedSlug("yt-already"), true);

process.env.INGEST_SKIP_EXISTING_CURATED = "1";
assert.equal(skipExistingCuratedEnabled(), true);
assert.equal(shouldFetchCuratedSlug("yt-already"), false);
assert.equal(shouldFetchCuratedSlug("sc-already"), false);
assert.equal(shouldFetchCuratedSlug("yt-new-seed"), true);
assert.equal(shouldFetchCuratedSlug(null), true);

setExistingCuratedSlugs(null);
assert.equal(shouldFetchCuratedSlug("yt-already"), true);

if (prev === undefined) delete process.env.INGEST_SKIP_EXISTING_CURATED;
else process.env.INGEST_SKIP_EXISTING_CURATED = prev;
setExistingCuratedSlugs(null);

console.log("skipExistingCurated.test.ts ok");
