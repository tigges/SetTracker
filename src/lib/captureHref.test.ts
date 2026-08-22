import assert from "node:assert/strict";
import { capture1001StatsHref } from "./captureHref";

assert.equal(capture1001StatsHref(), "/stats#capture-1001");
assert.equal(capture1001StatsHref("   "), "/stats#capture-1001");
assert.equal(
  capture1001StatsHref(" Ultra Miami "),
  "/stats?q=Ultra%20Miami#capture-1001",
);
