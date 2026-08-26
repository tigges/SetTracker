import assert from "node:assert/strict";
import {
  CAPTURE_QUEUE_LIMIT,
  CAPTURE_QUEUE_RESERVE,
  buildCaptureQueueFromNeeds,
  captureEventBucket,
  capturePerEventCap,
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

console.log("nextCaptures.queue.test.ts ok");
