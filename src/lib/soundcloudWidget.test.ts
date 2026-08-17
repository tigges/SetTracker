import assert from "node:assert/strict";
import { cueSoundCloudWidget, type SoundCloudWidget } from "./soundcloudWidget";

function mockWidget(): SoundCloudWidget & {
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

console.log("soundcloudWidget.test.ts ok");
