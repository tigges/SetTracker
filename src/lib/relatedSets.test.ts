import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pickRelatedSets, scoreRelatedSet } from "./relatedSets";

const anchor = {
  slug: "yt-current",
  eventSlug: "tomorrowland",
  seriesSlug: "asot",
  primaryDjSlug: "armin-van-buuren",
};

describe("relatedSets", () => {
  it("prefers same event + DJ over same DJ only", () => {
    const sameEvent = scoreRelatedSet(anchor, {
      ...anchor,
      slug: "yt-tml",
      title: "Freedom",
      publishedAt: "2026-07-18",
      trackCount: 40,
      durationSec: 7200,
    });
    const sameDj = scoreRelatedSet(anchor, {
      slug: "yt-radio",
      eventSlug: null,
      seriesSlug: null,
      primaryDjSlug: "armin-van-buuren",
      title: "ASOT",
      publishedAt: "2026-08-13",
      trackCount: 40,
      durationSec: 7200,
    });
    assert.ok(sameEvent > sameDj);
  });

  it("drops the current slug and unrelated rows", () => {
    const picked = pickRelatedSets(anchor, [
      {
        slug: "yt-current",
        eventSlug: "tomorrowland",
        seriesSlug: "asot",
        primaryDjSlug: "armin-van-buuren",
        title: "self",
        publishedAt: "2026-07-18",
        trackCount: 40,
        durationSec: 7200,
      },
      {
        slug: "yt-other",
        eventSlug: "creamfields",
        seriesSlug: null,
        primaryDjSlug: "dom-dolla",
        title: "unrelated",
        publishedAt: "2026-08-23",
        trackCount: 40,
        durationSec: 5400,
      },
      {
        slug: "yt-asot",
        eventSlug: null,
        seriesSlug: "asot",
        primaryDjSlug: "armin-van-buuren",
        title: "ASOT 1290",
        publishedAt: "2026-08-13",
        trackCount: 41,
        durationSec: 7200,
      },
    ]);
    assert.equal(picked.length, 1);
    assert.equal(picked[0]!.item.slug, "yt-asot");
    assert.equal(picked[0]!.reason, "series");
  });
});
