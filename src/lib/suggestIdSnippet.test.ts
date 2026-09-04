import assert from "node:assert/strict";
import {
  buildSuggestIdSnippet,
  suggestIdIssueTitle,
  suggestIdSnippetText,
} from "./suggestIdSnippet";

const snippet = buildSuggestIdSnippet({
  setSlug: "sc-jamie-jones-hot-rbot-radio-254",
  position: 6,
  timestamp: 1508,
  artist: "  Fallon ",
  title: " No Panties  ",
});

assert.equal(snippet.setSlug, "sc-jamie-jones-hot-rbot-radio-254");
assert.equal(snippet.position, 6);
assert.equal(snippet.artistName, "Fallon", "artist is trimmed");
assert.equal(snippet.trackTitle, "No Panties", "title is trimmed");
assert.equal(snippet.suggestedBy, "suggest-id");

// The clock must ship. Set pages renumber position for display, so
// applyResolutions matches on timestamp; a snippet without it can resolve the
// wrong cue while reporting success. resolutions.test.ts rejects committed rows
// that lack it, so dropping it here would make every new suggestion unusable.
assert.equal(snippet.timestamp, 1508);
assert.ok(
  Object.keys(snippet).includes("timestamp"),
  "timestamp must be part of the pasted snippet",
);

// Pasted text has to be valid JSON for data/resolutions.json.
const parsed = JSON.parse(suggestIdSnippetText(snippet));
assert.deepEqual(parsed, snippet);

assert.equal(
  suggestIdIssueTitle({
    setSlug: "sc-foo",
    timestamp: 252,
    artist: "A",
    title: "T",
  }),
  "ID suggest: sc-foo @04:12 → A – T",
);
assert.match(
  suggestIdIssueTitle({
    setSlug: "yt-bar",
    timestamp: 3723,
    artist: "A",
    title: "T",
  }),
  /@1:02:03/,
);

console.log("suggestIdSnippet.test.ts ok");
