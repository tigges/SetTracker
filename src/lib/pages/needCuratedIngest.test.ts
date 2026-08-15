import assert from "node:assert/strict";
import {
  decideCuratedIngest,
  fileNeedsCuratedIngest,
} from "./needCuratedIngest";

assert.equal(fileNeedsCuratedIngest("src/lib/ingest/soundcloud/tracks.ts"), true);
assert.equal(
  fileNeedsCuratedIngest("src/lib/ingest/tracklists1001/festivalCaptures20260814.ts"),
  true,
);
assert.equal(fileNeedsCuratedIngest("src/lib/ingest/youtube/videos.ts"), true);
assert.equal(fileNeedsCuratedIngest("src/lib/ingest/roster.ts"), true);
assert.equal(fileNeedsCuratedIngest("prisma/ingest.ts"), true);

assert.equal(fileNeedsCuratedIngest("src/lib/ingest/djSocialPins.data.ts"), false);
assert.equal(fileNeedsCuratedIngest("src/lib/ingest/discovery/knownHandles.ts"), false);
assert.equal(fileNeedsCuratedIngest("src/lib/ingest/events.ts"), false);
assert.equal(fileNeedsCuratedIngest("src/lib/ingest/sourceRemaps.ts"), false);
assert.equal(fileNeedsCuratedIngest("src/lib/ingest/soundcloud/tracks.test.ts"), false);
assert.equal(fileNeedsCuratedIngest("src/app/page.tsx"), false);
assert.equal(fileNeedsCuratedIngest("public/artists/1788-l.jpg"), false);
assert.equal(fileNeedsCuratedIngest("package.json"), false);

assert.deepEqual(
  decideCuratedIngest({
    eventName: "workflow_dispatch",
    changedFiles: ["src/lib/ingest/soundcloud/tracks.ts"],
  }),
  {
    run: false,
    reason: "workflow_dispatch uses cached catalog (no curated re-poll)",
  },
);

assert.equal(
  decideCuratedIngest({
    eventName: "workflow_dispatch",
    mode: "force",
    changedFiles: [],
  }).run,
  true,
);

assert.equal(
  decideCuratedIngest({
    eventName: "push",
    mode: "skip",
    changedFiles: ["src/lib/ingest/soundcloud/tracks.ts"],
  }).run,
  false,
);

assert.equal(
  decideCuratedIngest({
    eventName: "push",
    changedFiles: ["src/lib/ingest/djSocialPins.data.ts", "src/app/djs/page.tsx"],
  }).run,
  false,
);

const seedPush = decideCuratedIngest({
  eventName: "push",
  changedFiles: [
    "src/lib/ingest/soundcloud/tracks.ts",
    "src/lib/ingest/tracklists1001/festival2026.ts",
  ],
});
assert.equal(seedPush.run, false);
assert.match(seedPush.reason, /cached catalog/);

assert.equal(
  decideCuratedIngest({
    eventName: "push",
    changedFiles: [],
    hasPreviousSha: false,
  }).run,
  false,
);

assert.equal(
  decideCuratedIngest({
    eventName: "push",
    mode: "force",
    changedFiles: [],
  }).run,
  true,
);

console.log("needCuratedIngest.test.ts ok");
