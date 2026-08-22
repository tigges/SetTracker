import assert from "node:assert/strict";
import {
  diagnoseVerdict,
  isControlTrackMatch,
  isExpectedYoutubeClipFail,
} from "./acrDiagnose";

assert.equal(isExpectedYoutubeClipFail("clip download failed (unavailable)"), true);
assert.equal(isExpectedYoutubeClipFail("YouTube bot-wall (File Scan is the CI path)"), true);
assert.equal(isExpectedYoutubeClipFail("ERROR invalid signature"), false);

assert.equal(
  isControlTrackMatch("Rick Astley", "Never Gonna Give You Up"),
  true,
);
assert.equal(isControlTrackMatch("Polystar", "Never Gonna Give You Up"), true);
assert.equal(isControlTrackMatch("Someone", "Love Hurts"), false);

const fsHit = diagnoseVerdict({
  identifyOk: false,
  identifyDetail: "clip download failed (unavailable)",
  identifyHit: false,
  fsConfigured: true,
  fsScanFailed: false,
  fsControlHit: true,
  fsControlDetail: "score 47",
});
assert.equal(fsHit.ok, true);
assert.match(fsHit.controlLabel, /file-scan/);

const fsMiss = diagnoseVerdict({
  identifyOk: false,
  identifyDetail: "clip download failed (unavailable)",
  identifyHit: false,
  fsConfigured: true,
  fsScanFailed: false,
  fsControlHit: false,
});
assert.equal(fsMiss.ok, false);
assert.match(fsMiss.failReason ?? "", /did not identify/);

const fsFail = diagnoseVerdict({
  identifyOk: false,
  identifyDetail: "YouTube bot-wall (File Scan is the CI path)",
  identifyHit: false,
  fsConfigured: true,
  fsScanFailed: true,
  fsControlHit: false,
});
assert.equal(fsFail.ok, false);
assert.match(fsFail.failReason ?? "", /submit\/poll/);

const noFsWall = diagnoseVerdict({
  identifyOk: false,
  identifyDetail: "clip download failed (unavailable)",
  identifyHit: false,
  fsConfigured: false,
  fsScanFailed: false,
  fsControlHit: false,
});
assert.equal(noFsWall.ok, true);

const identifyAuth = diagnoseVerdict({
  identifyOk: false,
  identifyDetail: "ERROR invalid signature",
  identifyHit: false,
  fsConfigured: true,
  fsScanFailed: false,
  fsControlHit: false,
});
assert.equal(identifyAuth.ok, false);

console.log("acrDiagnose.test.ts ok");
