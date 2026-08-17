import assert from "node:assert/strict";
import {
  djMagHistoryYears,
  djMagRanksBySlug,
  loadDjMagHistory,
} from "./history";

const djs = loadDjMagHistory("dj");
const clubs = loadDjMagHistory("club");
const festivals = loadDjMagHistory("festival");

assert.deepEqual(djMagHistoryYears("dj"), [
  2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025,
]);
assert.deepEqual(djMagHistoryYears("club"), [
  2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
]);
assert.deepEqual(djMagHistoryYears("festival"), [2025, 2026]);

for (const year of djMagHistoryYears("dj")) {
  const rows = djs.filter((e) => e.year === year);
  assert.equal(rows.length, 100, `djs ${year}`);
  assert.deepEqual(
    rows.map((e) => e.rank).sort((a, b) => a - b),
    Array.from({ length: 100 }, (_, i) => i + 1),
  );
}
for (const year of djMagHistoryYears("club")) {
  const rows = clubs.filter((e) => e.year === year);
  assert.equal(rows.length, 100, `clubs ${year}`);
}

assert.ok(festivals.filter((e) => e.year === 2026).length === 100);
assert.ok(festivals.filter((e) => e.year === 2025).length >= 80);

const guetta = djMagRanksBySlug("dj", "david-guetta");
assert.deepEqual(
  guetta.map((r) => [r.year, r.rank]),
  [
    [2016, 6],
    [2017, 7],
    [2018, 5],
    [2019, 3],
    [2020, 1],
    [2021, 1],
    [2022, 2],
    [2023, 1],
    [2024, 2],
    [2025, 1],
  ],
);

const dvlm = djMagRanksBySlug("dj", "Dimitri-Vegas-%26-Mike");
assert.equal(dvlm[0]?.year, 2016);
assert.equal(dvlm[0]?.rank, 2);
assert.equal(dvlm.at(-1)?.year, 2025);
assert.equal(dvlm.at(-1)?.rank, 4);

const ww = djMagRanksBySlug("dj", "W-%26-W");
assert.ok(ww.some((r) => r.year === 2016 && r.rank === 13));
assert.ok(ww.some((r) => r.year === 2019 && r.rank === 18));
assert.ok(ww.some((r) => r.year === 2025 && r.rank === 18));

assert.equal(
  festivals.find((e) => e.year === 2026 && e.rank === 1)?.slug,
  "tomorrowland",
);
assert.equal(
  festivals.find((e) => e.year === 2025 && e.slug === "tomorrowland")?.rank,
  1,
);

assert.ok(!djs.some((e) => e.slug.endsWith("-")));
assert.ok(!clubs.some((e) => e.slug.endsWith("-")));

console.log("history.test.ts ok");
