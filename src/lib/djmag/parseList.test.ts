import assert from "node:assert/strict";
import {
  normalizeChartSlug,
  parseDjMagListHtml,
  priorRankFromChange,
} from "./parseList";

assert.equal(normalizeChartSlug("Dimitri-Vegas-%26-Mike"), "dimitri-vegas-mike");
assert.equal(normalizeChartSlug("W%26W"), "ww");
assert.equal(normalizeChartSlug("W-%26-W"), "ww");
assert.equal(normalizeChartSlug("w-w"), "ww");
assert.equal(normalizeChartSlug("Axwell-%26-Ingrosso"), "axwell-ingrosso");
assert.equal(normalizeChartSlug("green-valley"), "green-valley");

assert.equal(priorRankFromChange(1, "Non-mover"), 1);
assert.equal(priorRankFromChange(2, "Up 2"), 4);
assert.equal(priorRankFromChange(8, "Down 5"), 3);
assert.equal(priorRankFromChange(17, "New entry"), null);

const html = `
<article class="djm-26-card">
  <div class="djm-26-card__rank">1</div>
  <h2 class="djm-26-card__title">
    <a href="/top100djs/2024/1/martin-garrix">Martin Garrix</a>
  </h2>
  <div class="djm-26-card__movement djm-26-card__movement--up">
    <span class="djm-26-card__movement-text">Up</span>
    <span class="djm-26-card__movement-places">2</span>
  </div>
</article>
<article class="djm-26-card">
  <div class="djm-26-card__rank">2</div>
  <h2 class="djm-26-card__title">
    <a href="/top100djs/2024/2/Dimitri-Vegas-%26-Mike">Dimitri Vegas &amp; Like Mike</a>
  </h2>
  <div class="djm-26-card__movement djm-26-card__movement--down">
    <span class="djm-26-card__movement-text">Down</span>
    <span class="djm-26-card__movement-places">1</span>
  </div>
</article>
<article class="djm-26-card">
  <h2 class="djm-26-card__title">
    <a href="/top100djs/2025/1/david-guetta">David Guetta</a>
  </h2>
</article>
`;

const rows = parseDjMagListHtml(html, "dj", 2024);
assert.equal(rows.length, 2);
assert.deepEqual(rows[0], {
  year: 2024,
  rank: 1,
  slug: "martin-garrix",
  name: "Martin Garrix",
  change: "Up 2",
});
assert.equal(rows[1]?.slug, "dimitri-vegas-mike");
assert.equal(rows[1]?.name, "Dimitri Vegas & Like Mike");
assert.equal(rows[1]?.change, "Down 1");

console.log("parseList.test.ts ok");
