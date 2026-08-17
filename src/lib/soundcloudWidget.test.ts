import assert from "node:assert/strict";
import { cueSoundCloudWidget, type SoundCloudWidget } from "./soundcloudWidget";

function mockWidget(durationMs?: number): SoundCloudWidget & {
  seeks: number[];
  plays: number;
} {
  const seeks: number[] = [];
  let plays = 0;
  return {
    seeks,
    get plays() {
      return plays;
    },
    bind() {},
    seekTo(ms) {
      seeks.push(ms);
    },
    play() {
      plays += 1;
    },
    getDuration(cb) {
      if (durationMs != null) cb(durationMs);
    },
  };
}

const fromStart = mockWidget();
cueSoundCloudWidget(fromStart, 0, true);
assert.deepEqual(fromStart.seeks, [0]);
assert.equal(fromStart.plays, 1);

const secondCue = mockWidget();
cueSoundCloudWidget(secondCue, 588, true);
assert.deepEqual(secondCue.seeks, [588_000]);
assert.equal(secondCue.plays, 1);

const noPlay = mockWidget();
cueSoundCloudWidget(noPlay, 12.9, false);
assert.deepEqual(noPlay.seeks, [12_000]);
assert.equal(noPlay.plays, 0);

const clamped = mockWidget(266_000);
cueSoundCloudWidget(clamped, 588, true);
assert.equal(clamped.seeks.at(-1), 265_750);
assert.equal(clamped.plays, 2);

console.log("soundcloudWidget.test.ts ok");
