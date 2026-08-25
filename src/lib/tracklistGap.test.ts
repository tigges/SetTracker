import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isActionableTracklistGap,
  isLivestreamHubFeedTitle,
  isLivestreamHubTitle,
  isSourceCompleteRadioStub,
  setPageIsPublished,
  tracklistGapReason,
} from "./tracklistGap";

const now = Date.parse("2026-08-16T12:00:00.000Z");

describe("tracklistGap", () => {
  it("weekly radio with one cue is source-complete, not a capture job", () => {
    assert.equal(
      isSourceCompleteRadioStub({
        title: "Korolova - Captive Soul 91",
        type: "soundcloud",
        playCount: 1,
        durationSec: 3600,
      }),
      true,
    );
    assert.equal(
      isActionableTracklistGap(
        {
          title: "Hardwell On Air 531",
          type: "radio",
          playCount: 1,
          durationSec: 3589,
          publishedAt: "2026-07-01T00:00:00.000Z",
          top100Rank: 12,
        },
        now,
      ),
      false,
    );
    assert.equal(
      isActionableTracklistGap(
        {
          title: "Hot Robot Radio 235",
          type: "radio",
          playCount: 6,
          durationSec: 57 * 60,
          publishedAt: "2026-04-08T00:00:00.000Z",
          top100Rank: 40,
        },
        now,
      ),
      false,
    );
    assert.equal(
      isActionableTracklistGap(
        {
          title: "Korolova - Captive Soul 90",
          type: "radio",
          playCount: 4,
          durationSec: 3600,
          publishedAt: "2026-07-01T00:00:00.000Z",
          top100Rank: 80,
        },
        now,
      ),
      false,
    );
    assert.equal(
      isActionableTracklistGap(
        {
          title: "Eric Prydz presents EPIC Radio 036",
          type: "radio",
          playCount: 6,
          durationSec: 63 * 60,
          publishedAt: "2026-07-01T00:00:00.000Z",
          top100Rank: 20,
        },
        now,
      ),
      false,
    );
    assert.equal(
      isActionableTracklistGap(
        {
          title: "Hardwell On Air 527 YEARMIX 2025",
          type: "radio",
          playCount: 6,
          durationSec: 3600,
          publishedAt: "2026-01-02T00:00:00.000Z",
          top100Rank: 12,
        },
        now,
      ),
      true,
    );
    assert.equal(
      isActionableTracklistGap(
        {
          title: "Protocol Radio 731 by Nicky Romero (PRR731)",
          type: "radio",
          playCount: 16,
          durationSec: 57 * 60 + 13,
          publishedAt: "2026-08-14T00:00:00.000Z",
          top100Rank: 40,
        },
        now,
      ),
      false,
    );
    assert.equal(
      isActionableTracklistGap(
        {
          title: "PRISMATIC by Tiësto 032",
          type: "radio",
          playCount: 20,
          durationSec: 60 * 60,
          publishedAt: "2026-08-08T00:00:00.000Z",
          top100Rank: 5,
        },
        now,
      ),
      false,
    );
    assert.equal(
      isActionableTracklistGap(
        {
          title: "Spectrum Radio 485 Joris Voorn | Brno,Czech Republic",
          type: "radio",
          playCount: 15,
          durationSec: 60 * 60,
          publishedAt: "2026-08-12T00:00:00.000Z",
          top100Rank: 5,
        },
        now,
      ),
      false,
    );
    assert.equal(
      isActionableTracklistGap(
        {
          title: "Group Therapy 690 with Above & Beyond and Estiva",
          type: "radio",
          playCount: 27,
          durationSec: 2 * 3600,
          publishedAt: "2026-08-14T00:00:00.000Z",
          top100Rank: 61,
        },
        now,
      ),
      false,
    );
    assert.equal(
      isActionableTracklistGap(
        {
          title: "Nora En Pure - Purified Radio 520",
          type: "radio",
          playCount: 13,
          durationSec: 60 * 60,
          publishedAt: "2026-08-10T00:00:00.000Z",
          top100Rank: 80,
        },
        now,
      ),
      false,
    );
    assert.equal(
      isActionableTracklistGap(
        {
          title: "Nora En Pure - Purified Radio 519",
          type: "radio",
          playCount: 3,
          durationSec: 60 * 60,
          publishedAt: "2026-08-03T00:00:00.000Z",
          top100Rank: 80,
        },
        now,
      ),
      false,
    );
    assert.equal(
      isActionableTracklistGap(
        {
          title: "Smash The House Radio ep. 689",
          type: "festival",
          eventKind: "festival",
          playCount: 0,
          durationSec: 3600,
          publishedAt: "2026-08-10T00:00:00.000Z",
          top100Rank: 5,
        },
        now,
      ),
      false,
    );
  });

  it("empty shells have no set page; official empties and thin playbacks do", () => {
    assert.equal(
      setPageIsPublished({
        title: "Giuseppe Ottaviani at Luminosity Beach Festival 2026",
        playCount: 0,
        durationSec: 3600,
      }),
      false,
    );
    assert.equal(
      setPageIsPublished({
        title: "4444 OF A KIND Freedom WE1 | Tomorrowland 2026",
        playCount: 0,
        durationSec: 3600,
        playbackUrl: "https://www.youtube.com/watch?v=VuwLOFniScA",
        type: "festival",
        eventKind: "festival",
      }),
      true,
    );
    assert.equal(
      setPageIsPublished({
        title: "Joel Corry Live @ Edge NYC",
        playCount: 1,
        durationSec: 152 * 60,
      }),
      true,
    );
  });

  it("drops archive playbacks whose title year is older than last year", () => {
    assert.equal(
      isActionableTracklistGap(
        {
          title: "Alan Walker | Tomorrowland Belgium 2018",
          type: "festival",
          eventKind: "festival",
          eventSlug: "tomorrowland",
          playCount: 0,
          durationSec: 3600,
          publishedAt: "2026-08-01T00:00:00.000Z",
          editionYear: 2026,
          top100Rank: 40,
        },
        now,
      ),
      false,
    );
    assert.equal(
      isActionableTracklistGap(
        {
          title: "Timmy Trumpet LIVE @ Ultra Music Festival Miami 2023",
          type: "festival",
          eventKind: "festival",
          eventSlug: "ultra-miami",
          playCount: 0,
          durationSec: 3600,
          publishedAt: "2026-07-20T00:00:00.000Z",
          top100Rank: 30,
        },
        now,
      ),
      false,
    );
    assert.equal(
      isActionableTracklistGap(
        {
          title: "FISHER — EDC Orlando 2024",
          type: "festival",
          eventKind: "festival",
          playCount: 0,
          durationSec: 3600,
          publishedAt: "2026-08-10T00:00:00.000Z",
          top100Rank: 8,
        },
        now,
      ),
      false,
    );
  });

  it("queues this-year chart playbacks with a duration gap", () => {
    assert.equal(
      isActionableTracklistGap(
        {
          title: "Joel Corry Live @ Edge NYC",
          type: "festival",
          eventKind: "club",
          playCount: 1,
          durationSec: 152 * 60,
          publishedAt: "2026-06-01T00:00:00.000Z",
          top100Rank: 40,
          primaryDjSlug: "joel-corry",
        },
        now,
      ),
      true,
    );
    assert.equal(
      isActionableTracklistGap(
        {
          title: "Giuseppe Ottaviani at Luminosity Beach Festival 2026",
          type: "festival",
          eventKind: "festival",
          playCount: 0,
          durationSec: 3600,
          publishedAt: "2026-06-20T00:00:00.000Z",
          top100Rank: 80,
        },
        now,
      ),
      true,
    );
    assert.match(
      tracklistGapReason({
        title: "Joel Corry Live @ Edge NYC",
        playCount: 1,
        durationSec: 152 * 60,
        publishedAt: "2026-06-01T00:00:00.000Z",
      }),
      /severe/,
    );
  });

  it("drops hearthis hobby mixes, previews, livestream hubs, and uncharted long mixes", () => {
    assert.equal(
      isActionableTracklistGap(
        {
          title: "Tektural Sounds and Friends @Querfunk",
          type: "mix",
          sourceName: "hearthis.at",
          playCount: 0,
          durationSec: 7200,
          publishedAt: "2026-08-08T00:00:00.000Z",
        },
        now,
      ),
      false,
    );
    assert.equal(
      isActionableTracklistGap(
        {
          title: "A State of Trance 2026 - Mix 2: Frequency [Preview]",
          type: "soundcloud",
          playCount: 0,
          durationSec: 600,
          publishedAt: "2026-01-01T00:00:00.000Z",
          top100Rank: 4,
        },
        now,
      ),
      false,
    );
    assert.equal(isLivestreamHubTitle("Mainstage - Tomorrowland 2026 LIVE"), true);
    assert.equal(isLivestreamHubFeedTitle("Mainstage - Tomorrowland 2026 LIVE"), true);
    assert.equal(
      isLivestreamHubFeedTitle("Amelie Lens | Freedom Stage | Tomorrowland 2026 LIVE"),
      false,
    );
    assert.equal(
      isActionableTracklistGap(
        {
          title: "Mainstage - Tomorrowland 2026 LIVE",
          type: "festival",
          eventKind: "festival",
          festivalRank: 1,
          playCount: 0,
          durationSec: 3600,
          publishedAt: "2026-07-25T00:00:00.000Z",
        },
        now,
      ),
      false,
    );
    assert.equal(
      isActionableTracklistGap(
        {
          title: "Project.x - Progressive World #17",
          type: "mix",
          playCount: 2,
          durationSec: 100 * 3600,
          publishedAt: "2026-07-01T00:00:00.000Z",
        },
        now,
      ),
      false,
    );
  });
});
