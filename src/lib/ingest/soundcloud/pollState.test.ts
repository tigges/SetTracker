import assert from "node:assert/strict";
import { adaptiveLimit, type PollStateFile } from "./pollState";

const cold: PollStateFile = {
  updatedAt: null,
  shows: {
    "marten-horger": {
      lastUploadAt: "2026-07-03T00:00:00.000Z",
      recentUploadCount: 0,
      limit: 18,
      updatedAt: "2026-07-27T00:00:00.000Z",
    },
  },
};

assert.equal(adaptiveLimit("marten-horger", 50, cold), 50);
assert.equal(adaptiveLimit("quiet-dj", 12, cold), 12);
assert.equal(
  adaptiveLimit("quiet-dj", 12, {
    updatedAt: null,
    shows: {
      "quiet-dj": {
        lastUploadAt: null,
        recentUploadCount: 0,
        limit: 12,
        updatedAt: "",
      },
    },
  }),
  12,
);

const hot: PollStateFile = {
  updatedAt: null,
  shows: {
    cloonee: {
      lastUploadAt: new Date().toISOString(),
      recentUploadCount: 3,
      limit: 16,
      updatedAt: "",
    },
  },
};
assert.equal(adaptiveLimit("cloonee", 16, hot), 24);

console.log("pollState.test.ts ok");
