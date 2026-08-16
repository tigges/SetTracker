import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { placeRightAlignedPopover } from "./popoverPlace";

describe("placeRightAlignedPopover", () => {
  it("right-aligns to the trigger when there is room", () => {
    const pos = placeRightAlignedPopover({
      trigger: { bottom: 80, right: 360 },
      menuWidth: 256,
      viewportWidth: 390,
      viewportHeight: 800,
    });
    assert.equal(pos.width, 256);
    assert.equal(pos.left, 360 - 256);
    assert.equal(pos.top, 88);
  });

  it("shifts right when a mid-row trigger would overflow the left edge", () => {
    const pos = placeRightAlignedPopover({
      trigger: { bottom: 200, right: 180 },
      menuWidth: 256,
      viewportWidth: 390,
      viewportHeight: 800,
    });
    assert.equal(pos.left, 16);
    assert.ok(pos.left + pos.width <= 390 - 16);
  });

  it("shrinks to the viewport on very narrow phones", () => {
    const pos = placeRightAlignedPopover({
      trigger: { bottom: 120, right: 264 },
      menuWidth: 256,
      viewportWidth: 280,
      viewportHeight: 568,
    });
    assert.equal(pos.width, 280 - 32);
    assert.equal(pos.left, 16);
    assert.equal(pos.left + pos.width, 264);
  });
});
