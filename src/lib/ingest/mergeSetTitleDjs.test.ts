import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveCanonicalFromSetTitleDj } from "./mergeSetTitleDjs";
import { guestFromSeriesByTitle } from "./artists";

describe("resolveCanonicalFromSetTitleDj", () => {
  it("folds Dom Dolla set-title accidents onto dom-dolla", () => {
    assert.deepEqual(
      resolveCanonicalFromSetTitleDj(
        "Dom Dolla // Dancefloor Currency",
        "dom-dolla-dancefloor-currency",
      ),
      { slug: "dom-dolla", name: "Dom Dolla" },
    );
    assert.deepEqual(
      resolveCanonicalFromSetTitleDj("Dom Dolla Warm Up", "dom-dolla-warm-up"),
      { slug: "dom-dolla", name: "Dom Dolla" },
    );
  });

  it("folds Odd Mob venue titles onto odd-mob", () => {
    assert.deepEqual(
      resolveCanonicalFromSetTitleDj(
        "Odd Mob at Seismic Dance Event 8.0",
        "odd-mob-at-seismic-dance-event-8-0",
      ),
      { slug: "odd-mob", name: "Odd Mob" },
    );
  });

  it("leaves festival mega-mix Night Owl crumbs as series-only (no Dj)", () => {
    assert.equal(
      resolveCanonicalFromSetTitleDj(
        "Day Trip Festival 2024 Mega-Mix",
        "day-trip-festival-2024-mega-mix",
      ),
      null,
    );
  });

  it("folds Defected Virtual Festival onto Dom Dolla via set title", () => {
    assert.deepEqual(
      resolveCanonicalFromSetTitleDj(
        "Defected Virtual Festival 4.0",
        "defected-virtual-festival-4-0",
        ["Defected Virtual Festival 4.0 - Dom Dolla"],
      ),
      { slug: "dom-dolla", name: "Dom Dolla" },
    );
  });

  it("folds WE1/WE2 duplicate DJs onto the main artist", () => {
    assert.deepEqual(
      resolveCanonicalFromSetTitleDj(
        "Armin van Buuren WE1",
        "armin-van-buuren-we1",
      ),
      { slug: "armin-van-buuren", name: "Armin van Buuren" },
    );
    assert.deepEqual(
      resolveCanonicalFromSetTitleDj("Odd Mob WE2", "odd-mob-we2"),
      { slug: "odd-mob", name: "Odd Mob" },
    );
  });

  it("maps date DJs from the owned set title, else drops them", () => {
    assert.deepEqual(
      resolveCanonicalFromSetTitleDj("June, 2026", "june-2026", [
        "Tomorrowland Friendship Mix with Steve Aoki - June, 2026",
      ]),
      { slug: "steve-aoki", name: "Steve Aoki" },
    );
    assert.equal(
      resolveCanonicalFromSetTitleDj("June, 2026", "june-2026", [
        "Tomorrowland Friendship Mix - June, 2026",
      ]),
      null,
    );
  });

  it("folds show-with-guest DJ names onto the performing artist", () => {
    assert.deepEqual(
      resolveCanonicalFromSetTitleDj(
        "Full Moon with Timmy Trumpet",
        "full-moon-with-timmy-trumpet",
      ),
      { slug: "timmy-trumpet", name: "Timmy Trumpet" },
    );
    assert.deepEqual(
      resolveCanonicalFromSetTitleDj(
        "Group Therapy 674 with Above & Beyond and Max Graham",
        "group-therapy-674-with-above-beyond-and-max-graham",
      ),
      { slug: "above-beyond", name: "Above & Beyond" },
    );
    assert.deepEqual(
      resolveCanonicalFromSetTitleDj("Goodboys Present", "goodboys-present"),
      { slug: "goodboys", name: "Goodboys" },
    );
    assert.deepEqual(
      resolveCanonicalFromSetTitleDj(
        "Goodboys Present",
        "goodboys-present",
        ["Goodboys Present — Club Mix"],
      ),
      { slug: "goodboys", name: "Goodboys" },
    );
  });

  it("folds Recovery balloon / Pirate Ship film hosts onto Hot Since 82", () => {
    assert.deepEqual(
      resolveCanonicalFromSetTitleDj(
        "Recovery (Hot Air Balloon)",
        "recovery-hot-air-balloon",
      ),
      { slug: "hot-since-82", name: "Hot Since 82" },
    );
    assert.deepEqual(
      resolveCanonicalFromSetTitleDj(
        "Recovery (Hot Air Balloon)",
        "recovery-hot-air-balloon",
        ["Hot Since 82 - Live From A Pirate Ship in Ibiza 2025"],
      ),
      { slug: "hot-since-82", name: "Hot Since 82" },
    );
  });

  it("folds Chris Lake Full onto Chris Lake", () => {
    assert.deepEqual(
      resolveCanonicalFromSetTitleDj("Chris Lake Full", "chris-lake-full"),
      { slug: "chris-lake", name: "Chris Lake" },
    );
    assert.deepEqual(
      resolveCanonicalFromSetTitleDj(
        "Chris Lake Full",
        "chris-lake-full",
        ["Chris Lake Full Set Live @ Outside Lands Festival 2024"],
      ),
      { slug: "chris-lake", name: "Chris Lake" },
    );
  });

  it("folds Laidback Luke SELECTS onto Laidback Luke", () => {
    assert.deepEqual(
      resolveCanonicalFromSetTitleDj(
        "Laidback Luke SELECTS",
        "laidback-luke-selects",
      ),
      { slug: "laidback-luke", name: "Laidback Luke" },
    );
  });

  it("reads the guest off a label radio title", () => {
    assert.equal(
      guestFromSeriesByTitle("Keinemusik Radio Show by Lara Bee 17.07.2026"),
      "Lara Bee",
    );
  });
});
