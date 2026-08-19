import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isProducerDiscardName,
  isProducerDiscardSlug,
  isProducerDropSlug,
  isProducerHiddenSlug,
  PRODUCER_DJ_ALIASES,
  PRODUCER_KEEP,
} from "./producerDjReview.data";

describe("producerDjReview.data", () => {
  it("discards set-title and venue leftovers", () => {
    assert.equal(isProducerDiscardSlug("recovery-hot-air-balloon"), true);
    assert.equal(isProducerDiscardSlug("mash-up-universe"), true);
    assert.equal(isProducerDiscardSlug("w-hotels"), true);
    assert.equal(isProducerDiscardName("Sorry"), true);
    assert.equal(isProducerDiscardName("Two"), true);
    assert.equal(isProducerDiscardName("Hot Since 82"), false);
    assert.equal(
      isProducerDiscardName("Behind Cercle Odyssey I Chapter Four: Curtain"),
      true,
    );
    assert.equal(isProducerDiscardName("Live in Buenos Aires"), true);
    assert.equal(isProducerDiscardName("Rave UKraine"), true);
    assert.equal(isProducerDiscardSlug("live-in-buenos-aires"), true);
    assert.equal(isProducerDiscardSlug("rave-ukraine"), true);
    assert.equal(isProducerDiscardSlug("bart-skils"), false);
  });

  it("folds known leftovers onto real DJs", () => {
    assert.equal(PRODUCER_DJ_ALIASES["mau-p-sunrise"], "mau-p");
    assert.equal(
      PRODUCER_DJ_ALIASES["layton-giordani-space-miami-1-10-25"],
      "layton-giordani",
    );
    assert.equal(PRODUCER_DJ_ALIASES["maceo-plex-bart-skils"], "maceo-plex");
  });

  it("drops non-DJ / unverified identities without hiding real names", () => {
    assert.equal(isProducerDropSlug("sg-lewis"), true);
    assert.equal(isProducerDropSlug("sasha"), true);
    assert.equal(isProducerHiddenSlug("franky-wah"), false);
    assert.equal(isProducerDiscardName("Sasha"), false);
  });

  it("keeps verified handles as https profile URLs", () => {
    const franky = PRODUCER_KEEP.find((k) => k.slug === "franky-wah");
    assert.ok(franky);
    assert.match(franky!.socials.instagram!, /instagram\.com\/frankywahmusic/);
    assert.match(franky!.socials.youtube!, /youtube\.com\/@Frankywahmusic/);
    const tiffany = PRODUCER_KEEP.find((k) => k.slug === "tiffany-day");
    assert.match(tiffany!.socials.website!, /tiffdidwhat\.com/);
  });
});
