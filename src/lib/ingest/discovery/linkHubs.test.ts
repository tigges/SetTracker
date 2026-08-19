import assert from "node:assert/strict";
import { isLinkHub } from "./linkHubs";

assert.equal(isLinkHub("https://linktr.ee/bartskils"), true);
assert.equal(isLinkHub("https://solo.to/korolova.dj"), true);
assert.equal(isLinkHub("https://ra.co/dj/korolova"), false);
assert.equal(isLinkHub("https://www.korolova.com/"), false);

console.log("linkHubs.test.ts ok");
