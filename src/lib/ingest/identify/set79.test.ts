import assert from "node:assert/strict";
import { matchSet79Urls, SET79_HINT_TOKENS } from "./set79";

const locs = [
  "https://set79.com/tracklists/knock2-b2b-zedd-niteharts-san",
  "https://set79.com/tracklists/knock2-b2b-zedd-hard-summer-2026",
  "https://set79.com/tracklists/cole-terrazas-hard-summer-pink",
  "https://set79.com/tracklists/zedd-edc-las-vegas",
];

const knockHard = matchSet79Urls(
  locs,
  SET79_HINT_TOKENS.TL_KNOCK2_ZEDD_HARD_SUMMER_2026!,
);
assert.deepEqual(knockHard, [
  "https://set79.com/tracklists/knock2-b2b-zedd-hard-summer-2026",
]);
assert.equal(
  knockHard.includes(
    "https://set79.com/tracklists/knock2-b2b-zedd-niteharts-san",
  ),
  false,
);

const cole = matchSet79Urls(
  locs,
  SET79_HINT_TOKENS.TL_COLE_TERRAZAS_HARD_SUMMER_2026!,
);
assert.deepEqual(cole, [
  "https://set79.com/tracklists/cole-terrazas-hard-summer-pink",
]);
assert.deepEqual(
  matchSet79Urls(
    [
      "https://set79.com/tracklist/soundcloud.com/coleterrazas/ccb57f81-a6ef-4a4d-b187-8d7b1bd1302f",
    ],
    SET79_HINT_TOKENS.TL_COLE_TERRAZAS_HARD_SUMMER_2026!,
  ),
  [],
);

assert.deepEqual(matchSet79Urls(locs, ["knock2", "zedd"]), [
  "https://set79.com/tracklists/knock2-b2b-zedd-niteharts-san",
  "https://set79.com/tracklists/knock2-b2b-zedd-hard-summer-2026",
]);

console.log("identify/set79.test.ts ok");
