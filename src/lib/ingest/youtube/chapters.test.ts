import assert from "node:assert/strict";
import { extractChapters } from "./client";

const chapters = extractChapters({
  chapteredPlayerBarRenderer: {
    chapters: [
      {
        chapterRenderer: {
          title: { simpleText: "Artist One - Track A" },
          startTimeMs: 0,
        },
      },
      {
        chapterRenderer: {
          title: { simpleText: "Artist Two - Track B" },
          startTimeMs: 180000,
        },
      },
    ],
  },
});

assert.equal(chapters.length, 2);
assert.equal(chapters[0]?.title, "Artist One - Track A");
assert.equal(chapters[0]?.startSec, 0);
assert.equal(chapters[1]?.startSec, 180);

console.log("chapters.test.ts ok");
