import assert from "node:assert/strict";
import {
  buildSuggestDjIssue,
  isSuggestDjReady,
  matchCatalogDj,
  suggestDjSlug,
} from "./suggestDj";

const catalog = [
  { slug: "fisher", name: "FISHER" },
  { slug: "bradeazy", name: "bradeazy" },
  { slug: "chris-lorenzo", name: "Chris Lorenzo" },
];

assert.equal(suggestDjSlug("John Summit"), "john-summit");
assert.equal(suggestDjSlug("dradeazy"), "bradeazy");
assert.equal(isSuggestDjReady({ name: "J" }), false);
assert.equal(isSuggestDjReady({ name: "  " }), false);
assert.equal(isSuggestDjReady({ name: "John Summit" }), true);

assert.deepEqual(matchCatalogDj("FISHER", catalog), {
  slug: "fisher",
  name: "FISHER",
});
assert.deepEqual(matchCatalogDj("dradeazy", catalog), {
  slug: "bradeazy",
  name: "bradeazy",
});
assert.equal(matchCatalogDj("John Summit", catalog), null);

const issue = buildSuggestDjIssue({
  name: "John Summit",
  soundcloud: "https://soundcloud.com/johnsummit",
  note: "EDC mainstage",
});
assert.match(issue.title, /^DJ suggest: John Summit$/);
assert.match(issue.body, /john-summit/);
assert.match(issue.body, /soundcloud\.com\/johnsummit/);
assert.match(issue.body, /EDC mainstage/);
assert.match(issue.url, /github\.com\/tigges\/SetTracker\/issues\/new\?/);
assert.match(issue.url, /John\+Summit|John%20Summit/);

console.log("suggestDj.test.ts ok");
