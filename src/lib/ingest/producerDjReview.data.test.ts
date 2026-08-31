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
    assert.equal(isProducerDiscardName("8-track (Continuous Mix)"), true);
    assert.equal(
      isProducerDiscardName("Femi Koleoso of Ezra Collective"),
      true,
    );
    assert.equal(isProducerDiscardName("Knee Deep In Ibiza Mixed"), true);
    assert.equal(isProducerDiscardName("Le Grand Brand"), true);
    assert.equal(isProducerDiscardSlug("8-track-continuous-mix"), true);
    assert.equal(
      isProducerDiscardSlug("femi-koleoso-of-ezra-collective"),
      true,
    );
    assert.equal(isProducerDiscardSlug("knee-deep-in-ibiza-mixed"), true);
    assert.equal(isProducerDiscardSlug("le-grand-brand"), true);
    assert.equal(isProducerDiscardSlug("bart-skils"), false);
    assert.equal(isProducerDiscardSlug("mila-alias"), false);
    assert.equal(isProducerDiscardSlug("monateng-music"), true);
    assert.equal(isProducerDiscardName("Monateng Music"), true);
    assert.equal(isProducerDiscardName("Monateng"), true);
  });

  it("folds known leftovers onto real DJs", () => {
    assert.equal(PRODUCER_DJ_ALIASES["mau-p-sunrise"], "mau-p");
    assert.equal(
      PRODUCER_DJ_ALIASES["layton-giordani-space-miami-1-10-25"],
      "layton-giordani",
    );
    assert.equal(PRODUCER_DJ_ALIASES["maceo-plex-bart-skils"], "maceo-plex");
    assert.equal(PRODUCER_DJ_ALIASES["muchakk-mu540"], "mu540");
    assert.equal(isProducerDiscardSlug("muchakk-mu540"), true);
    assert.equal(isProducerDiscardName("MUCHAKK (Mu540"), true);
    assert.equal(isProducerDiscardName("MU540"), false);
    assert.equal(isProducerDiscardName("Mochakk"), false);
  });

  it("drops non-DJ / unverified identities without hiding real names", () => {
    assert.equal(isProducerDropSlug("sg-lewis"), true);
    assert.equal(isProducerDropSlug("sasha"), true);
    assert.equal(isProducerDropSlug("sonido-tupinamba"), true);
    assert.equal(isProducerDropSlug("teedo-love"), true);
    assert.equal(isProducerHiddenSlug("teedo-love"), true);
    assert.equal(isProducerHiddenSlug("franky-wah"), false);
    assert.equal(isProducerHiddenSlug("mila-alias"), false);
    assert.equal(isProducerDiscardName("Sasha"), false);
  });

  it("keeps verified handles as https profile URLs", () => {
    const franky = PRODUCER_KEEP.find((k) => k.slug === "franky-wah");
    assert.ok(franky);
    assert.match(franky!.socials.instagram!, /instagram\.com\/frankywahmusic/);
    assert.match(franky!.socials.youtube!, /youtube\.com\/@Frankywahmusic/);
    const tiffany = PRODUCER_KEEP.find((k) => k.slug === "tiffany-day");
    assert.match(tiffany!.socials.website!, /tiffdidwhat\.com/);
    const mila = PRODUCER_KEEP.find((k) => k.slug === "mila-alias");
    assert.match(mila!.socials.instagram!, /instagram\.com\/djmilaalias/);
    assert.match(mila!.socials.youtube!, /youtube\.com\/@Mila_Alias/);
    assert.match(mila!.socials.soundcloud!, /soundcloud\.com\/djmilaalias/);
    assert.equal(
      PRODUCER_KEEP.some((k) => k.slug === "sonido-tupinamba"),
      false,
    );
    assert.equal(
      PRODUCER_KEEP.some((k) => k.slug === "teedo-love"),
      false,
    );
    assert.equal(
      PRODUCER_KEEP.some((k) => k.slug === "monateng-music"),
      false,
    );
  });
});
