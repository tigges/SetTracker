import assert from "node:assert/strict";
import {
  isSuggestIdIssueTitle,
  mergeSuggestIdRow,
  parseSuggestIdIssueBody,
} from "./suggestIdIssue";
import { suggestIdSnippetText } from "./suggestIdSnippet";

assert.equal(isSuggestIdIssueTitle("ID suggest: sc-foo #2 → A – T"), true);
assert.equal(isSuggestIdIssueTitle("ID suggest: sc-foo @04:12 → A – T"), true);
assert.equal(isSuggestIdIssueTitle("chore: bump"), false);

const body = [
  "## ID suggestion",
  "",
  "- **Set:** `sc-jamie-jones-hot-rbot-radio-254`",
  "- **Position:** 12",
  "- **Timestamp:** 2900s",
  "",
  "### resolutions.json entry",
  "```json",
  suggestIdSnippetText({
    setSlug: "sc-jamie-jones-hot-rbot-radio-254",
    position: 12,
    timestamp: 2900,
    trackTitle: "Bust It BIG TROUBLE",
    artistName: "Hector Couto",
    suggestedBy: "suggest-id",
  }),
  "```",
].join("\n");

const parsed = parseSuggestIdIssueBody(body);
assert.deepEqual(parsed, {
  setSlug: "sc-jamie-jones-hot-rbot-radio-254",
  position: 12,
  timestamp: 2900,
  trackTitle: "Bust It BIG TROUBLE",
  artistName: "Hector Couto",
  suggestedBy: "suggest-id",
});

assert.equal(parseSuggestIdIssueBody("no fence"), null);
assert.equal(
  parseSuggestIdIssueBody('```json\n{"setSlug":"not-a-catalog"}\n```'),
  null,
);
assert.equal(
  parseSuggestIdIssueBody(
    '```json\n{"setSlug":"sc-x","position":1,"timestamp":10,"trackTitle":"T","artistName":""}\n```',
  ),
  null,
);

const first = mergeSuggestIdRow([], parsed!);
assert.equal(first.status, "added");
assert.equal(first.rows.length, 1);
const again = mergeSuggestIdRow(first.rows, parsed!);
assert.equal(again.status, "duplicate");
assert.equal(again.rows.length, 1);

console.log("suggestIdIssue.test.ts ok");
