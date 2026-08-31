import assert from "node:assert/strict";
import {
  CAPTURE_QUEUE_LIMIT,
  CAPTURE_QUEUE_RESERVE,
  buildCaptureQueueFromNeeds,
  captureEventBucket,
  capturePerEventCap,
  captureFocusYear,
  capturePerformanceYear,
  captureQueueLabel,
  captureQueueYear,
  captureSearchQuery,
  captureSearchWhen,
  isCaptureRealNight,
  isFocusChartCaptureNeed,
  isFocusYearCaptureNeed,
  isStaleYearCaptureNeed,
  isStaleYearCapturePreset,
  isStudioMonthSpecial,
  presetFromNeed,
  scoreCaptureNeed,
  skipCaptureNeed,
  type CaptureNeedRow,
} from "./nextCaptures";
import { TRACKLIST_1001_BY_SOURCE_SLUG } from "./tracklists1001/festival2026";

const now = Date.parse("2026-08-15T01:00:00Z");

function row(partial: Partial<CaptureNeedRow> & Pick<CaptureNeedRow, "slug" | "title">): CaptureNeedRow {
  return {
    primaryDj: "Test DJ",
    type: "festival",
    publishedAt: "2026-08-01T00:00:00Z",
    durationSec: 60 * 60,
    playCount: 2,
    plays1001: 0,
    identifiedStrong: 0,
    top100Rank: null,
    isFestival: true,
    festivalSeason: true,
    density: "severe",
    ...partial,
  };
}

const mapped = new Set(Object.keys(TRACKLIST_1001_BY_SOURCE_SLUG));

assert.equal(
  skipCaptureNeed(row({ slug: "yt-hgbAN8NFNu0", title: "Aoki Friendship Mix" }), mapped, now),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "ht-toccoscuro-robin-schulz-sugar-radio-555",
      title: "Robin Schulz - Sugar Radio 555",
      primaryDj: "Robin Schulz",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-robin-schulz-robin-schulz-dj-set-live-pacha-ibiza",
      title: "Robin Schulz DJ Set live @Pacha, Ibiza",
      primaryDj: "Robin Schulz",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-eric-prydz-eric-prydz-presents-epic-1",
      title: "Eric Prydz presents EPIC Radio 026",
      primaryDj: "Eric Prydz",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({ slug: "yt-short1", title: "Freedom Stage Shorts", durationSec: 90 }),
    mapped,
    now,
  ),
  "short",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-oldradio",
      title: "Old radio 2017",
      type: "radio",
      isFestival: false,
      festivalSeason: false,
      publishedAt: "2017-03-01T00:00:00Z",
      density: "ok",
      playCount: 20,
    }),
    mapped,
    now,
  ),
  "archive-title",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-tml-2018-reupload",
      title: "Alan Walker | Tomorrowland Belgium 2018",
      eventSlug: "tomorrowland",
      festivalSeason: true,
      publishedAt: "2026-08-01T00:00:00Z",
      playCount: 0,
      density: "severe",
    }),
    mapped,
    now,
  ),
  "archive-title",
);

const recentEmpty = row({
  slug: "yt-recent-empty",
  title: "Someone WE1 | Tomorrowland 2026",
  eventSlug: "tomorrowland",
  playCount: 0,
  density: "severe",
});
const oldGuetta = row({
  slug: "yt-old-guetta",
  title: "David Guetta Ultra 2017",
  primaryDj: "David Guetta",
  eventSlug: "ultra-miami",
  publishedAt: "2017-03-24T00:00:00Z",
  festivalSeason: false,
  top100Rank: 2,
  playCount: 3,
  density: "severe",
});
assert.ok(
  scoreCaptureNeed(recentEmpty, now) > scoreCaptureNeed(oldGuetta, now),
  "recent TML gap must outrank a 2017 Ultra leftover",
);
assert.ok(
  scoreCaptureNeed({ ...recentEmpty, editionGap: true }, now) >
    scoreCaptureNeed(recentEmpty, now),
  "edition-gap rows get a capture boost",
);

const queue = buildCaptureQueueFromNeeds([oldGuetta, recentEmpty], {
  limit: 10,
  nowMs: now,
});
assert.equal(queue[0]?.slug, "yt-recent-empty");
assert.ok(!queue.some((p) => p.slug === "yt-hgbAN8NFNu0"));
assert.equal(
  skipCaptureNeed(
    row({ slug: "yt-NTLDGnoWIRg", title: "Men Machine Exclusive Mix" }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({ slug: "yt-bxb6Tglooc4", title: "ASOT 1290" }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({ slug: "yt-zHAUZ02aCwo", title: "Alok WE2 | Tomorrowland 2026" }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-knJyJPP45dg",
      title: "Vintage Culture Live at EDC Las Vegas, Neon Garden (Club Space)",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-kmMYCg-igjc",
      title: "Vintage Culture live @ Só Track Boa Festival, Brasil 2026",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-OVex0rm7ZR4",
      title: "Vintage Culture @ Pacha Ibiza, Affairs (2026)",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-6bJZPDKlq7o",
      title: "Vintage Culture @ Sunset Yacht Party - New York City 2023",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-OXwK0CSmXzY",
      title: "Hardwell On Air 527 YEARMIX 2025",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-hardwell-hardwell-on-air-527-yearmix",
      title: "Hardwell On Air 527 YEARMIX 2025",
      type: "radio",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-i-mFuxbGHzg",
      title: "Reinier Zonneveld | Awakenings Festival 2025",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-jamie-jones-hot-robot-radio-225",
      title: "Hot Robot Radio 225",
      type: "radio",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-jamie-jones-hot-robot-radio-239",
      title: "Hot Robot Radio 239",
      type: "radio",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-vintageculturemusic-vintage-culture-b2b-arodes-at-burning-man-2024",
      title: "Vintage Culture b2b Arodes at Burning Man 2024",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-SeKRNa26kug",
      title: "Vintage Culture b2b Arodes at Burning Man 2024, Black Rock City",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-soEFl73peVA",
      title: "Joel Corry Epic Rooftop Set From Edge NYC",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-joelcorry-edgenyc",
      title: "Joel Corry Live @ Edge NYC",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-Rgx-wT9FDaE",
      title: "Protocol Radio 731 by Nicky Romero (PRR731)",
      type: "radio",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-sashaofficial-sasha-eclipse-mix-12-8-26",
      title: "Sasha Eclipse Mix 12/8/26",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-0-s_qZRWElA",
      title: "Miss Monique @ Ibiza Yacht Sunset '26",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-blP5J6BUG0M",
      title: "PRISMATIC by Tiësto 032",
      type: "radio",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-yTRvLrtsM9I",
      title: "Spectrum Radio 485 Joris Voorn | Brno,Czech Republic",
      type: "radio",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-B05MAbsCOLA",
      title: "Nicky Romero LIVE at Tomorrowland 2026 - Mainstage",
      type: "festival",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-phWKhIwgiTo",
      title: "Group Therapy 690 with Above & Beyond and Estiva",
      type: "radio",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-k4Drn6AwAdk",
      title: "Max Styler @ Opulent Temple, Burning Man 2024",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-maxstyler-max-styler-live-opulent-temple-burning-man-2024",
      title: "Max Styler Live @ Opulent Temple Burning Man 2024",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-arowbYnNFGY",
      title: "Hannah Laing @ Zenless Zone Zero, Creamfields North 2024",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-hannahlaingdj-hannah-laing-creamfields-2024-audio",
      title: "Hannah Laing Creamfields 2024 Audio",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-8aDoUu4GDrc",
      title: "Nora En Pure - Purified Radio 520",
      type: "radio",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-noraenpure-purified-520",
      title: "Purified Radio 520",
      type: "radio",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-5JxfEjVdQFk",
      title: "Korolova - Captive Soul 098",
      type: "radio",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-korolovadj-korolova-captive-soul-98",
      title: "Korolova Captive Soul 98",
      type: "radio",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-rLTCLSsqrXY",
      title: "James Hype SYNC London (Full Set)",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-jameshypethedj-sync-london-full-set",
      title: "James Hype SYNC London Full Set",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-JLIYTueL4TI",
      title: "Eric Prydz presents EPIC Radio 036",
      type: "radio",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-xv6hpdqKlxg",
      title: "Eric Prydz - Epic Radio 025 2026-03-05",
      type: "radio",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-eric-prydz-epic-radio-025",
      title: "Eric Prydz - Epic Radio 025 2026-03-05",
      type: "radio",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-t5KwF_VsM50",
      title: "Honey Dijon at The Loop - Dekmantel Festival 2025",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-193z2Yyb-4g",
      title: "VINAI @ S2O Songkran Music Festival Thailand 2023-04-15",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-eric-prydz-eric-prydz-presents-463760700",
      title: "Eric Prydz presents EPIC Radio 036",
      type: "radio",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-bradeazy-bradeazy-live-lollapalooza",
      title: "bradeazy Live @ Lollapalooza Chicago 2026",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-amelielens-amelie-lens-radio-show-022",
      title: "Amelie Lens - Radio Show 022 2026-06-05",
      type: "radio",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-wuMQeEJ3YnQ",
      title: "Oliver Heldens - Daybreak Session @ Tomorrowland Weekend 1 2024",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-oliverheldens-oliver-heldens-daybreak-session-tomorrowland-weekend-1-2024",
      title: "Oliver Heldens - Daybreak Session @ Tomorrowland Weekend 1 2024",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-2BPWWYAgUE4",
      title: "COLYN b2b INNELLEA || LIVE @ ULTRA MIAMI 2026",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-innellea-colyn-b2b-innella-at-ultra",
      title: "COLYN B2B INNELLA AT ULTRA MIAMI 2026",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-innellea-colyn-b2b-innella-at-ultra",
      title: "COLYN B2B INNELLA AT ULTRA MIAMI 2026",
    }),
    new Set(),
    now,
  ),
  "mirror",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-rG1DvjvXCls",
      title: "Marlon Hoffstadt WE1 | Tomorrowland 2026",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-RLOghpXjuJI",
      title: "Korolova Captive Soul | Tomorrowland 2026",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-9TKqqBCmDHA",
      title: "John Summit Lollapalooza Chicago 2026",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-AjQeohYmg3A",
      title: "Afrojack & R3HAB Mainstage Tomorrowland 2026",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-GSnPwle4FOE",
      title: "David Guetta WE1 | Tomorrowland 2026",
    }),
    mapped,
    now,
  ),
  "mapped",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-korolovadj-korolova-live-tomorrowland-1",
      title: "Korolova Live Tomorrowland",
    }),
    new Set(),
    now,
  ),
  "mirror",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-johnsummit-john-summit-live-lollapalooza",
      title: "John Summit Live Lollapalooza",
    }),
    new Set(),
    now,
  ),
  "mirror",
);

const many = Array.from({ length: 55 }, (_, i) =>
  row({
    slug: `yt-cap-${i}`,
    title: `Festival gap ${i}`,
    festivalSeason: true,
    isFestival: true,
    playCount: 0,
    publishedAt: `2026-08-${String((i % 28) + 1).padStart(2, "0")}T00:00:00Z`,
  }),
);
const defaultQueue = buildCaptureQueueFromNeeds(many, { nowMs: now });
assert.equal(defaultQueue.length, CAPTURE_QUEUE_LIMIT);
assert.equal(CAPTURE_QUEUE_LIMIT, 40);

assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-amelielens-exhale-radio-121",
      title: "Amelie Lens Exhale Radio 121",
      type: "radio",
      isFestival: false,
      festivalSeason: false,
      playCount: 2,
      density: "severe",
    }),
    mapped,
    now,
  ),
  "weekly-radio",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-lens-live-from-tml",
      title: "Amelie Lens live from Tomorrowland 2026",
      type: "radio",
      isFestival: false,
      festivalSeason: false,
      playCount: 0,
      density: "severe",
    }),
    mapped,
    now,
  ),
  null,
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-cercle-charlotte",
      title: "Charlotte de Witte | Cercle",
      type: "livestream",
      isFestival: false,
      isLivestream: true,
      festivalSeason: false,
      playCount: 0,
      density: "severe",
    }),
    mapped,
    now,
  ),
  null,
);
assert.ok(
  scoreCaptureNeed(
    row({
      slug: "yt-pacha-night",
      title: "Live at Pacha Ibiza",
      type: "club",
      isFestival: true,
      festivalSeason: false,
    }),
    now,
  ) >
    scoreCaptureNeed(
      row({
        slug: "yt-cercle-stream",
        title: "Cercle livestream",
        type: "livestream",
        isFestival: false,
        isLivestream: true,
        festivalSeason: false,
      }),
      now,
    ),
  "club nights outrank livestreams in the 1001 capture queue",
);

assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-owr-live",
      title: "One World Radio Tomorrowland 2026 LIVE",
      type: "livestream",
      isLivestream: true,
      playCount: 0,
      density: "severe",
    }),
    mapped,
    now,
  ),
  "livestream-hub",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-freedom-live",
      title: "Freedom Stage - Tomorrowland 2026 LIVE",
      type: "festival",
      playCount: 0,
      density: "severe",
    }),
    mapped,
    now,
  ),
  "livestream-hub",
);

// --- Venue balance -----------------------------------------------------------
// An in-season brand can hold hundreds of gap rows, every one carrying the same
// +120 season bonus, so pure score order hands it all 40 slots. Build that
// flood, then a handful of rows from other venues, and check the spread.
const flood: CaptureNeedRow[] = Array.from({ length: 80 }, (_, i) =>
  row({
    slug: `yt-tml-${i}`,
    title: `Tomorrowland gap ${i}`,
    eventSlug: "tomorrowland",
    eventRank: 1,
    festivalSeason: true,
    isFestival: true,
    playCount: 0,
    publishedAt: "2026-07-20T00:00:00Z",
  }),
);
const others = [
  ["untold", "Untold"],
  ["creamfields", "Creamfields"],
  ["awakenings", "Awakenings"],
  ["time-warp", "Time Warp"],
  ["nameless", "Nameless"],
  ["dekmantel", "Dekmantel"],
].flatMap(([slug, name], idx) =>
  Array.from({ length: 4 }, (_, i) =>
    row({
      slug: `yt-${slug}-${i}`,
      title: `${name} gap ${i}`,
      eventSlug: slug,
      eventRank: 10 + idx,
      festivalSeason: true,
      isFestival: true,
      playCount: 0,
      publishedAt: "2026-07-18T00:00:00Z",
    }),
  ),
);

const eventsOf = (q: ReturnType<typeof buildCaptureQueueFromNeeds>) =>
  new Set(
    q.map((p) => {
      const m = p.slug.match(/^yt-([a-z-]+?)-\d+$/);
      return m ? m[1] : p.slug;
    }),
  );

const uncapped = buildCaptureQueueFromNeeds([...flood, ...others], {
  nowMs: now,
  perEventCap: Number.POSITIVE_INFINITY,
});
const balanced = buildCaptureQueueFromNeeds([...flood, ...others], {
  nowMs: now,
});
assert.equal(balanced.length, CAPTURE_QUEUE_LIMIT);
// Without the cap the flood takes every slot; with it, other venues get in.
assert.equal(eventsOf(uncapped).size, 1, "uncapped queue is one brand");
assert.ok(
  eventsOf(balanced).size >= 7,
  `expected 7+ venues, got ${eventsOf(balanced).size}`,
);
// Pass 1 caps each event; the leftover slots then go to the best remaining
// rows, which here are the flood's. So the brand keeps a large share but no
// longer starves the other venues of their 24 rows.
const tmlRows = balanced.filter((p) => p.slug.startsWith("yt-tml-"));
const otherRows = balanced.filter((p) => !p.slug.startsWith("yt-tml-"));
assert.equal(otherRows.length, 24, "every other venue row made the queue");
assert.equal(tmlRows.length, CAPTURE_QUEUE_LIMIT - 24);
assert.ok(tmlRows.length < CAPTURE_QUEUE_LIMIT / 2, "brand no longer dominates");
for (const slug of ["untold", "creamfields", "awakenings", "time-warp", "nameless", "dekmantel"]) {
  assert.equal(
    balanced.filter((p) => p.slug.startsWith(`yt-${slug}-`)).length,
    4,
    `${slug} rows must survive the flood`,
  );
}
assert.equal(capturePerEventCap(40), 5);
assert.equal(capturePerEventCap(8), 3, "cap never drops below 3");

// Overflow still fills the queue when only one venue has actionable rows, so
// the cap costs nothing on a quiet week.
const floodOnly = buildCaptureQueueFromNeeds(flood, { nowMs: now });
assert.equal(floodOnly.length, CAPTURE_QUEUE_LIMIT);

// Rows with no event bucket by DJ, so one artist's back catalogue cannot flood
// the queue either.
assert.equal(
  captureEventBucket(row({ slug: "yt-a", title: "a", eventSlug: "untold" })),
  "event:untold",
);
assert.equal(
  captureEventBucket(row({ slug: "yt-b", title: "b", primaryDjSlug: "fisher" })),
  "dj:fisher",
);
assert.equal(captureEventBucket(row({ slug: "yt-c", title: "c" })), "slug:yt-c");

// The notable-festival bump is flat: a rank-1 brand must not outscore a rank-90
// one on that signal alone, or balancing fights the score.
const rank1 = row({ slug: "yt-r1", title: "gap", eventSlug: "tomorrowland", eventRank: 1 });
const rank90 = row({ slug: "yt-r90", title: "gap", eventSlug: "nameless", eventRank: 90 });
assert.equal(scoreCaptureNeed(rank1, now), scoreCaptureNeed(rank90, now));
// An unranked event still loses that bump unless the legacy brand names match.
const unranked = row({ slug: "yt-u", title: "gap", eventSlug: "some-club" });
assert.ok(scoreCaptureNeed(rank1, now) > scoreCaptureNeed(unranked, now));
// Legacy fallback keeps working when no rank is on the row at all.
const legacy = row({ slug: "yt-l", title: "Ultra Miami gap", eventSlug: null });
assert.equal(scoreCaptureNeed(legacy, now), scoreCaptureNeed(rank1, now));

// The reserve exists so a browser-side park promotes the next row.
assert.equal(CAPTURE_QUEUE_RESERVE, 20);
const withReserve = buildCaptureQueueFromNeeds([...flood, ...others], {
  nowMs: now,
  limit: CAPTURE_QUEUE_LIMIT + CAPTURE_QUEUE_RESERVE,
});
assert.equal(withReserve.length, CAPTURE_QUEUE_LIMIT + CAPTURE_QUEUE_RESERVE);

// Performance year on capture rows: 1001 URL night beats ingest publishedAt.
assert.equal(
  capturePerformanceYear(
    {
      slug: "yt-cercle-peggy",
      title: "Peggy Gou at Palais des Beaux-Arts, Lille for Cercle",
      publishedAt: "2026-08-01T00:00:00Z",
      tracklistUrl:
        "https://www.1001tracklists.com/tracklist/260tzmnk/peggy-gou-palais-des-beaux-arts-lille-france-cercle-2018-12-03.html",
    },
    now,
  ),
  2018,
);
assert.equal(
  presetFromNeed(
    row({
      slug: "yt-edc-peggy",
      title: "Peggy Gou Live at EDC Las Vegas 2026 (Official Full Set)",
      publishedAt: "2026-08-01T00:00:00Z",
    }),
  ).performanceYear,
  2026,
);
assert.equal(
  capturePerformanceYear(
    {
      slug: "yt-nKHpbiYCtDQ",
      title:
        "Peggy Gou | Boiler Room x Dekmantel Festival: Amsterdam 2017-08-04",
      publishedAt: "2026-08-01T00:00:00Z",
    },
    now,
  ),
  2017,
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-nKHpbiYCtDQ",
      title:
        "Peggy Gou | Boiler Room x Dekmantel Festival: Amsterdam 2017-08-04",
    }),
    mapped,
    now,
  ),
  "archive-title",
);

assert.equal(
  captureSearchQuery(
    row({
      slug: "yt-eir5Sh_gHbo",
      title: "Steve Angello WE1 | Tomorrowland 2026",
      primaryDj: "Steve Angello",
      eventSlug: "tomorrowland",
      eventName: "Tomorrowland",
      performedAt: "2026-07-18T00:00:00Z",
    }),
    now,
  ),
  "Steve Angello Weekend 1 Tomorrowland 2026-07-18",
);
assert.equal(
  captureSearchQuery(
    row({
      slug: "yt-5LqJCIi6p7Y",
      title: "deadmau5 Live @ VELD Music Festival 2025 Toronto, Canada",
      primaryDj: "deadmau5",
    }),
    now,
  ),
  "deadmau5 VELD Music Festival 2025 Toronto Canada",
);
assert.equal(
  captureSearchWhen(
    {
      slug: "yt-vy-k0FopsmY",
      title: "Carl Cox Boiler Room Ibiza Villa Takeovers DJ Set",
      tracklistUrl:
        "https://www.1001tracklists.com/tracklist/3v69b81/carl-cox-carl-cox-friends-ibiza-villa-takeovers-boiler-room-2013-08-15.html",
    },
    now,
  ),
  "2013-08-15",
);
assert.equal(
  captureQueueLabel(
    {
      slug: "yt-vy-k0FopsmY",
      title: "Carl Cox Boiler Room Ibiza Villa Takeovers DJ Set",
      tracklistUrl:
        "https://www.1001tracklists.com/tracklist/3v69b81/carl-cox-carl-cox-friends-ibiza-villa-takeovers-boiler-room-2013-08-15.html",
    },
    now,
  ),
  "Carl Cox Boiler Room Ibiza Villa Takeovers DJ Set 2013-08-15",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-cox-untitled-2013",
      title: "Carl Cox Boiler Room Ibiza Villa Takeovers DJ Set",
      primaryDj: "Carl Cox",
      eventSlug: "boiler-room",
      tracklistUrl:
        "https://www.1001tracklists.com/tracklist/3v69b81/carl-cox-carl-cox-friends-ibiza-villa-takeovers-boiler-room-2013-08-15.html",
      festivalSeason: false,
      publishedAt: "2026-08-01T00:00:00Z",
    }),
    mapped,
    now,
  ),
  "archive-title",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-realblackcoffee-dj-mix-3",
      title: "DJ Mix 3",
      primaryDj: "Black Coffee",
      type: "mix",
      isFestival: false,
      festivalSeason: false,
      top100Rank: 5,
      publishedAt: "2016-06-01T00:00:00Z",
    }),
    mapped,
    now,
  ),
  "stale",
  "2016 generic mix is last-year-or-older, not a Capture 1001 ask",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-realblackcoffee-dj-mix-now",
      title: "DJ Mix 3",
      primaryDj: "Black Coffee",
      type: "mix",
      isFestival: false,
      festivalSeason: false,
      top100Rank: 5,
      publishedAt: "2026-06-01T00:00:00Z",
    }),
    mapped,
    now,
  ),
  "generic-title",
);
assert.equal(
  captureSearchQuery(
    row({
      slug: "sc-realblackcoffee-dj-mix-3",
      title: "DJ Mix 3",
      primaryDj: "Black Coffee",
    }),
    now,
  ),
  "Black Coffee",
);
assert.equal(
  captureQueueLabel(
    {
      slug: "sc-realblackcoffee-dj-mix-3",
      title: "DJ Mix 3",
      primaryDj: "Black Coffee",
    },
    now,
  ),
  "Black Coffee",
);
assert.equal(
  captureQueueLabel(
    {
      slug: "sc-realblackcoffee-club-space",
      title: "DJ Mix",
      primaryDj: "Black Coffee",
      eventName: "Club Space",
      performedAt: "2025-04-04T00:00:00Z",
    },
    now,
  ),
  "Black Coffee · Club Space · 2025-04-04",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-realblackcoffee-club-space",
      title: "DJ Mix",
      primaryDj: "Black Coffee",
      eventName: "Club Space",
      eventSlug: "club-space",
      performedAt: "2025-04-04T00:00:00Z",
    }),
    mapped,
    now,
  ),
  "stale",
  "2025 Club Space is last year — do not ask again on /stats",
);
assert.equal(
  captureQueueLabel(
    {
      slug: "yt-A5ERobJaS_0",
      title: "Live @ Ultra Melbourne 2026",
      primaryDj: "The Chainsmokers",
    },
    now,
  ),
  "The Chainsmokers · Live @ Ultra Melbourne 2026",
);
assert.equal(
  captureQueueLabel(
    {
      slug: "yt-eir5Sh_gHbo",
      title: "Steve Angello WE1 | Tomorrowland 2026",
      primaryDj: "Steve Angello",
      eventName: "Tomorrowland",
      performedAt: "2026-07-18T00:00:00Z",
    },
    now,
  ),
  "Steve Angello WE1 | Tomorrowland 2026 2026-07-18",
);

const angelloPreset = presetFromNeed(
  row({
    slug: "yt-eir5Sh_gHbo",
    title: "Steve Angello WE1 | Tomorrowland 2026",
    primaryDj: "Steve Angello",
    eventSlug: "tomorrowland",
    performedAt: "2026-07-18T00:00:00Z",
  }),
);
assert.equal(
  angelloPreset.searchQuery,
  "Steve Angello Weekend 1 Tomorrowland 2026-07-18",
);
assert.ok(!angelloPreset.searchQuery?.endsWith("Augu"));
assert.ok(!angelloPreset.searchQuery?.endsWith("Fe"));
assert.ok((angelloPreset.searchQuery?.length ?? 0) > 20);

const topicFriendship = {
  slug: "sc-tomorrowland-friendship-mix-topic-unwired",
  title: "Tomorrowland Friendship Mix with Topic - August, 2026",
  primaryDj: "Topic",
  eventName: "Tomorrowland",
  eventSlug: "tomorrowland",
  performedAt: "2026-07-26T23:59:59Z",
  type: "mix" as const,
  isFestival: false,
};
assert.equal(
  skipCaptureNeed(row(topicFriendship), mapped, now),
  null,
);
assert.equal(captureSearchWhen(topicFriendship, now), "2026");
assert.equal(
  captureQueueLabel(topicFriendship, now),
  "Topic · Tomorrowland Friendship Mix with Topic - August, 2026",
);
assert.equal(
  captureSearchQuery(row(topicFriendship), now),
  "Tomorrowland Friendship Mix with Topic August 2026",
);
assert.equal(
  captureSearchWhen(
    {
      ...topicFriendship,
      performedAt: "2026-08-20T00:00:00Z",
    },
    now,
  ),
  "2026-08-20",
);

assert.equal(captureFocusYear(now), 2026);
assert.equal(
  captureQueueYear(
    {
      slug: "yt-awakenings-2025",
      title: "Reinier Zonneveld | Awakenings Festival 2025",
      publishedAt: "2026-08-01T00:00:00Z",
    },
    now,
  ),
  2025,
);
assert.equal(
  isFocusYearCaptureNeed(
    row({
      slug: "yt-nameless-2026",
      title: "Someone Nameless 2026",
    }),
    now,
  ),
  true,
);
assert.equal(
  isFocusYearCaptureNeed(
    row({
      slug: "yt-ultra-2025",
      title: "David Guetta Ultra Miami 2025",
    }),
    now,
  ),
  false,
);
assert.equal(
  isFocusChartCaptureNeed(
    row({
      slug: "yt-nameless-chart-2026",
      title: "Someone Nameless 2026",
      eventSlug: "nameless",
      eventRank: 40,
      top100Rank: 80,
    }),
    now,
  ),
  true,
);
assert.equal(
  isFocusChartCaptureNeed(
    row({
      slug: "sc-tml-friendship-2026",
      title: "Tomorrowland Friendship Mix with Topic - August, 2026",
      type: "mix",
      eventSlug: "tomorrowland",
      eventRank: 1,
      top100Rank: 50,
    }),
    now,
  ),
  false,
);

const y2025Star = row({
  slug: "yt-guetta-ultra-2025",
  title: "David Guetta Ultra Miami 2025",
  primaryDj: "David Guetta",
  eventSlug: "ultra-miami",
  eventRank: 2,
  top100Rank: 2,
  festivalSeason: true,
  publishedAt: "2025-03-30T00:00:00Z",
});
const y2026Chart = row({
  slug: "yt-nameless-2026-night",
  title: "Someone Nameless 2026",
  eventSlug: "nameless",
  eventRank: 40,
  top100Rank: 80,
  festivalSeason: false,
  publishedAt: "2026-06-15T00:00:00Z",
});
assert.ok(
  scoreCaptureNeed(y2025Star, now) > scoreCaptureNeed(y2026Chart, now),
  "2025 chart leftover can still outscore a quiet 2026 night",
);
assert.equal(
  skipCaptureNeed(y2025Star, mapped, now),
  "stale",
  "last-year nights stay off Capture 1001",
);
assert.equal(isStaleYearCaptureNeed(y2025Star, now), true);
assert.equal(isStaleYearCaptureNeed(y2026Chart, now), false);
assert.equal(
  buildCaptureQueueFromNeeds([y2025Star, y2026Chart], {
    limit: 10,
    nowMs: now,
  })[0]?.slug,
  "yt-nameless-2026-night",
);
assert.ok(
  !buildCaptureQueueFromNeeds([y2025Star, y2026Chart], {
    limit: 10,
    nowMs: now,
  }).some((p) => p.slug === "yt-guetta-ultra-2025"),
  "2025 does not fill leftover Capture 1001 slots",
);

const year2026Flood = Array.from({ length: 45 }, (_, i) =>
  row({
    slug: `yt-focus-2026-${i}`,
    title: `Nameless gap ${i} 2026`,
    eventSlug: "nameless",
    eventRank: 40,
    top100Rank: 80,
    festivalSeason: true,
    publishedAt: "2026-06-15T00:00:00Z",
  }),
);
const yearLocked = buildCaptureQueueFromNeeds([...year2026Flood, y2025Star], {
  nowMs: now,
});
assert.equal(yearLocked.length, CAPTURE_QUEUE_LIMIT);
assert.ok(
  !yearLocked.some((p) => p.slug === "yt-guetta-ultra-2025"),
  "2025 stays off Capture 1001 while this year still has gaps",
);

const yearThenOlder = buildCaptureQueueFromNeeds(
  [
    y2026Chart,
    y2025Star,
    row({
      slug: "yt-creamfields-2026",
      title: "Someone Creamfields 2026",
      eventSlug: "creamfields",
      eventRank: 12,
      top100Rank: 30,
    }),
  ],
  { limit: 10, nowMs: now },
);
assert.deepEqual(
  yearThenOlder.map((p) => p.slug).sort(),
  ["yt-creamfields-2026", "yt-nameless-2026-night"],
);
assert.ok(
  !yearThenOlder.some((p) => p.slug === "yt-guetta-ultra-2025"),
  "last-year leftovers do not backfill after this year's nights",
);
assert.equal(
  isStaleYearCapturePreset(
    {
      label: "David Guetta Miami Ultra Music Festival 2017",
      performanceYear: 2017,
    },
    now,
  ),
  true,
);
assert.equal(
  isStaleYearCapturePreset(
    { label: "Someone Nameless 2026", performanceYear: 2026 },
    now,
  ),
  false,
);
assert.ok(
  !buildCaptureQueueFromNeeds([y2026Chart], {
    limit: 10,
    nowMs: now,
    extra: [
      {
        label: "David Guetta Miami Ultra Music Festival 2017",
        slug: "yt-guetta-2017-extra",
        name: "TL_DAVID_GUETTA",
        searchUrl: "https://www.1001tracklists.com/search#q=guetta%202017",
        reason: "density:severe",
        performanceYear: 2017,
      },
    ],
  }).some((p) => p.slug === "yt-guetta-2017-extra"),
  "stale extras do not jump the Capture 1001 queue",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-indira-awakenings-2025",
      title: "Indira Paganotto | Awakenings Festival 2025",
      eventSlug: "awakenings",
      festivalSeason: true,
      top100Rank: 40,
      publishedAt: "2025-07-11T00:00:00Z",
    }),
    mapped,
    now,
  ),
  "stale",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "yt-jan-2027-drops-2026",
      title: "Someone Nameless 2026",
      eventSlug: "nameless",
      festivalSeason: true,
      publishedAt: "2026-06-15T00:00:00Z",
    }),
    mapped,
    Date.parse("2027-01-02T00:00:00Z"),
  ),
  "stale",
  "January moves the focus year forward",
);

assert.equal(isStudioMonthSpecial("Hardwell presents Euphoria - August, 2026"), true);
assert.equal(
  isStudioMonthSpecial("Full Moon with Timmy Trumpet - August, 2026"),
  true,
);
assert.equal(
  isStudioMonthSpecial("Anetha WE1 | Tomorrowland 2026"),
  false,
);
assert.equal(
  isStudioMonthSpecial("SKRILLEX LIVE @ LOLLAPALOOZA CHILE 2026"),
  false,
);
assert.equal(
  isCaptureRealNight(
    row({
      slug: "sc-tomorrowland-hardwell-euphoria",
      title: "Hardwell presents Euphoria - August, 2026",
      type: "festival",
      isFestival: true,
      festivalSeason: true,
      eventSlug: "tomorrowland",
      eventRank: 1,
    }),
  ),
  false,
  "August OWR mix is not a July weekend night",
);
assert.equal(
  isFocusChartCaptureNeed(
    row({
      slug: "sc-tomorrowland-hardwell-euphoria",
      title: "Hardwell presents Euphoria - August, 2026",
      type: "festival",
      isFestival: true,
      festivalSeason: true,
      eventSlug: "tomorrowland",
      eventRank: 1,
      top100Rank: 3,
    }),
    now,
  ),
  false,
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-korolova-captive-soul-unwired-99",
      title: "Korolova - Captive Soul 99",
      type: "mix",
      isFestival: true,
      festivalSeason: true,
      eventSlug: "tomorrowland",
      eventRank: 1,
      top100Rank: 80,
    }),
    mapped,
    now,
  ),
  "weekly-radio",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-nora-purified-unwired-522",
      title: "Nora En Pure · Purified #522",
      type: "mix",
      isFestival: false,
      festivalSeason: false,
      top100Rank: 40,
    }),
    mapped,
    now,
  ),
  "weekly-radio",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-honey-dijon-fm-unwired-011",
      title: "Honey Dijon · Dijon FM 011 | Malix",
      type: "soundcloud",
      isFestival: false,
    }),
    mapped,
    now,
  ),
  "weekly-radio",
);
assert.equal(
  skipCaptureNeed(
    row({
      slug: "sc-amelielens-exhale-glued",
      title: "Amelie Lens Exhale Radio 121",
      type: "radio",
      isFestival: true,
      festivalSeason: true,
      eventSlug: "tomorrowland",
    }),
    mapped,
    now,
  ),
  "weekly-radio",
  "inherited festival event does not keep weekly radio on Capture 1001",
);

const owrMix = row({
  slug: "sc-tomorrowland-hardwell-euphoria",
  title: "Hardwell presents Euphoria - August, 2026",
  primaryDj: "Hardwell",
  type: "festival",
  isFestival: true,
  festivalSeason: true,
  eventSlug: "tomorrowland",
  eventRank: 1,
  top100Rank: 3,
  publishedAt: "2026-08-20T00:00:00Z",
});
const clubNight = row({
  slug: "yt-pacha-2026-night",
  title: "Someone Live at Pacha Ibiza 2026",
  type: "club",
  isFestival: true,
  festivalSeason: false,
  eventSlug: "pacha-ibiza",
  top100Rank: 90,
  publishedAt: "2026-06-01T00:00:00Z",
});
assert.equal(
  buildCaptureQueueFromNeeds([owrMix, clubNight], { limit: 10, nowMs: now })[0]
    ?.slug,
  "yt-pacha-2026-night",
  "a 2026 club night fills before an August studio mix glued to Tomorrowland",
);

const mixFlood = Array.from({ length: 20 }, (_, i) =>
  row({
    slug: `sc-studio-mix-${i}`,
    title: `Studio Month Mix ${i} - August, 2026`,
    type: "festival",
    isFestival: true,
    festivalSeason: true,
    eventSlug: "tomorrowland",
    eventRank: 1,
    top100Rank: 5,
    publishedAt: "2026-08-20T00:00:00Z",
  }),
);
const nightsThenMix = buildCaptureQueueFromNeeds(
  [...mixFlood, clubNight, y2025Star],
  { limit: 10, nowMs: now },
);
assert.equal(nightsThenMix[0]?.slug, "yt-pacha-2026-night");
assert.ok(
  !nightsThenMix.some((p) => p.slug === "yt-guetta-ultra-2025"),
  "last-year nights do not beat this year's studio mixes onto Capture 1001",
);
assert.ok(
  nightsThenMix.slice(1).every((p) => p.slug.startsWith("sc-studio-mix-")),
  "this year's studio mixes fill after this year's nights",
);

console.log("nextCaptures.queue.test.ts ok");
