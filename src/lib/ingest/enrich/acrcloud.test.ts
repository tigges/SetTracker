import assert from "node:assert/strict";
import {
  acrSignature,
  compareSparseSetCandidates,
  homepageEnrichBoost,
  isUnresolvedDetectPriority,
  loadDjMagTop100RankBySlug,
  mapAcrMusicHit,
  planGapProbes,
  popularityRankForDjSlug,
  rankPlaybackHost,
  ytDlpSectionRange,
  type SparseSetCandidate,
} from "./acrcloud";

// --- signature ---
const sig = acrSignature("key", "secret", "1710000000");
assert.equal(typeof sig, "string");
assert.ok(sig.length > 10);
// deterministic
assert.equal(acrSignature("key", "secret", "1710000000"), sig);
assert.notEqual(acrSignature("key", "other", "1710000000"), sig);

// --- map hit ---
const hit = mapAcrMusicHit({
  title: "Hello",
  score: 92,
  label: "XL",
  artists: [{ name: "Adele" }],
  external_ids: { isrc: "GBXXXX000000" },
});
assert.ok(hit);
assert.equal(hit!.artist, "Adele");
assert.equal(hit!.title, "Hello");
assert.equal(hit!.score, 92);
assert.equal(hit!.isrc, "GBXXXX000000");

assert.equal(mapAcrMusicHit({ title: "x" }), null);
assert.equal(mapAcrMusicHit(null), null);

// junk artist rejected
assert.equal(
  mapAcrMusicHit({ title: "Track", artists: [{ name: "Click here" }], score: 99 }),
  null,
);

// --- host ranking ---
assert.equal(rankPlaybackHost("soundcloud", false), 0);
assert.equal(rankPlaybackHost("hearthis", false), 1);
assert.equal(rankPlaybackHost("youtube", false), null);
assert.equal(rankPlaybackHost("youtube", true), 3);
assert.equal(rankPlaybackHost(null, true), null);

// --- gap probes ---
const plans = planGapProbes(
  600,
  [
    { timestamp: 90, provenance: "soundcloud", idStatus: "identified" },
    { timestamp: 360, provenance: "fingerprint", idStatus: "identified" },
  ],
  90,
  12,
);
assert.ok(plans.length >= 4);
assert.deepEqual(
  plans.map((p) => p.offsetSec).slice(0, 4),
  [90, 180, 270, 360],
);
assert.equal(plans[0]!.isGap, false, "SC play blocks 90s probe");
assert.equal(plans[1]!.isGap, true, "open slot at 180s");
assert.equal(plans[3]!.isGap, false, "fingerprint play blocks 360s");

// strong provenance blocks even when status is unparsed
const open = planGapProbes(
  400,
  [{ timestamp: 90, provenance: "soundcloud", idStatus: "unparsed" }],
  90,
  12,
);
const at90 = open.find((p) => p.offsetSec === 90);
assert.ok(at90);
assert.equal(at90!.isGap, false);

// --- demand proxy (DJ Mag Top 100) ---
const top100 = loadDjMagTop100RankBySlug();
assert.ok(top100.size >= 50, "expected seeded Top 100 DJs");
assert.equal(top100.get("david-guetta"), 1);
assert.equal(
  popularityRankForDjSlug("david-guetta", top100, new Set()),
  1,
);
assert.equal(
  popularityRankForDjSlug("unknown-local-dj", top100, new Set(["westend"])),
  999,
);
assert.equal(
  popularityRankForDjSlug("westend", top100, new Set(["westend"])),
  50,
);

function cand(
  partial: Partial<SparseSetCandidate> & Pick<SparseSetCandidate, "id">,
): SparseSetCandidate {
  return {
    slug: partial.id,
    playbackUrl: "https://soundcloud.com/x",
    durationSec: 3600,
    host: "soundcloud",
    identifiedStrong: 0,
    playCount: 0,
    unresolvedCount: 0,
    popularityRank: 999,
    homepageBoost: 0,
    eventBoost: 0,
    densitySeverity: "ok",
    publishedAtMs: 0,
    ...partial,
  };
}

const ranked = [
  cand({ id: "long-tail", unresolvedCount: 5, popularityRank: 999 }),
  cand({ id: "chart", unresolvedCount: 1, popularityRank: 12 }),
  cand({ id: "host-yt", host: "youtube", popularityRank: 1 }),
  cand({ id: "host-sc", host: "soundcloud", popularityRank: 80 }),
].sort(compareSparseSetCandidates);
assert.deepEqual(
  ranked.map((c) => c.id),
  ["chart", "host-sc", "long-tail", "host-yt"],
);

// Homepage-visible empty Top 100 beats archive ID-comment spam.
const homepageFirst = [
  cand({
    id: "old-spam",
    unresolvedCount: 40,
    popularityRank: 5,
    homepageBoost: 0,
    densitySeverity: "thin",
    publishedAtMs: Date.now() - 40 * 864e5,
  }),
  cand({
    id: "home-empty",
    unresolvedCount: 0,
    popularityRank: 50,
    homepageBoost: 3,
    densitySeverity: "severe",
    playCount: 0,
    publishedAtMs: Date.now() - 864e5,
  }),
].sort(compareSparseSetCandidates);
assert.equal(homepageFirst[0]!.id, "home-empty");

assert.equal(
  homepageEnrichBoost({
    publishedAt: new Date(),
    primaryDjSlug: "korolova",
    genre: "Melodic Techno",
    densitySeverity: "severe",
    top100,
  }),
  3,
);
assert.equal(
  homepageEnrichBoost({
    publishedAt: new Date(Date.now() - 40 * 864e5),
    primaryDjSlug: "unknown-local",
    genre: "House",
    densitySeverity: "ok",
    top100,
  }),
  0,
);

// Pink IDs on Top 20 / recent festival beat generic sparse sets.
assert.equal(
  homepageEnrichBoost({
    publishedAt: new Date(),
    primaryDjSlug: "charlotte-de-witte",
    genre: "Techno",
    densitySeverity: "ok",
    top100,
    unresolvedCount: 12,
  }),
  4,
);
assert.equal(
  homepageEnrichBoost({
    publishedAt: new Date(),
    primaryDjSlug: "unknown-local",
    genre: "House",
    densitySeverity: "ok",
    top100,
    unresolvedCount: 8,
    isFestival: true,
  }),
  4,
);
assert.equal(
  isUnresolvedDetectPriority({
    unresolvedCount: 5,
    top100Rank: 9,
  }),
  true,
);
assert.equal(
  isUnresolvedDetectPriority({
    unresolvedCount: 5,
    top100Rank: 50,
    isFestival: false,
  }),
  false,
);
// Empty EDC Relive (0 cues) still gets YT fingerprint priority.
assert.equal(
  isUnresolvedDetectPriority({
    unresolvedCount: 0,
    isFestival: true,
    sparseFestival: true,
  }),
  true,
);
assert.equal(
  homepageEnrichBoost({
    publishedAt: new Date(Date.now() - 10 * 864e5),
    primaryDjSlug: "unknown-local",
    genre: "Techno",
    densitySeverity: "severe",
    top100,
    playCount: 0,
    isFestival: true,
  }),
  4,
  "empty festival within detect window",
);
assert.equal(
  homepageEnrichBoost({
    publishedAt: new Date(Date.now() - 120 * 864e5),
    primaryDjSlug: "unknown-local",
    genre: "Techno",
    densitySeverity: "severe",
    top100,
    playCount: 0,
    isFestival: true,
  }),
  3,
  "empty festival outside detect window",
);
// Event-focus boost (ACRCLOUD_EVENT_SLUGS) beats same-host non-focus.
const eventFocusFirst = [
  cand({
    id: "other-sc",
    homepageBoost: 4,
    eventBoost: 0,
    host: "soundcloud",
  }),
  cand({
    id: "edc-sc",
    homepageBoost: 2,
    eventBoost: 1,
    host: "soundcloud",
  }),
].sort(compareSparseSetCandidates);
assert.equal(eventFocusFirst[0]!.id, "edc-sc");

// Focused YT festival (Street Parade ARTE) must beat non-focus SoundCloud.
const eventFocusBeatsHost = [
  cand({
    id: "other-sc",
    homepageBoost: 4,
    eventBoost: 0,
    host: "soundcloud",
    densitySeverity: "severe",
  }),
  cand({
    id: "street-parade-yt",
    homepageBoost: 2,
    eventBoost: 1,
    host: "youtube",
    densitySeverity: "severe",
  }),
].sort(compareSparseSetCandidates);
assert.equal(eventFocusBeatsHost[0]!.id, "street-parade-yt");

const pinkFestivalFirst = [
  cand({
    id: "sparse-generic",
    unresolvedCount: 0,
    popularityRank: 999,
    homepageBoost: 2,
    densitySeverity: "severe",
  }),
  cand({
    id: "edc-pink",
    unresolvedCount: 18,
    popularityRank: 40,
    homepageBoost: 4,
    densitySeverity: "ok",
    host: "youtube",
  }),
].sort(compareSparseSetCandidates);
// Without event focus, SoundCloud still preferred by host.
assert.equal(pinkFestivalFirst[0]!.id, "sparse-generic");
assert.equal(pinkFestivalFirst[1]!.id, "edc-pink");

const pinkScFirst = [
  cand({
    id: "generic-sc",
    unresolvedCount: 0,
    homepageBoost: 2,
    densitySeverity: "severe",
    host: "soundcloud",
  }),
  cand({
    id: "top20-pink-sc",
    unresolvedCount: 10,
    homepageBoost: 4,
    popularityRank: 3,
    densitySeverity: "ok",
    host: "soundcloud",
  }),
].sort(compareSparseSetCandidates);
assert.equal(pinkScFirst[0]!.id, "top20-pink-sc");

// --- yt-dlp section ranges ---
assert.equal(ytDlpSectionRange(90, 12), "*90-102");
assert.equal(ytDlpSectionRange(0, 12), "*0-12");
assert.equal(ytDlpSectionRange(-5, 12), "*0-12");
assert.equal(ytDlpSectionRange(100.7, 12.2), "*100-113");

console.log("acrcloud.test.ts ok");
