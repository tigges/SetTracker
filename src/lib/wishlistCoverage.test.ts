import assert from "node:assert/strict";
import { WISHLIST_DEFAULTS } from "./wishlist";
import { wishlistFileCoverage } from "./wishlistCoverage";

const rows = wishlistFileCoverage();
assert.equal(rows.length, WISHLIST_DEFAULTS.length);

const bySlug = new Map(rows.map((r) => [r.slug, r]));

const fisher = bySlug.get("fisher");
assert.ok(fisher);
assert.equal(fisher.roster, true);
assert.ok(fisher.youtube);
assert.ok(fisher.soundcloud);

const dillon = bySlug.get("dillon-francis");
assert.ok(dillon);
assert.equal(dillon.roster, true);
assert.equal(dillon.youtube, "@DillonFrancis");
assert.equal(dillon.soundcloud, "dillonfrancis");
assert.equal(dillon.pin, true);

const dimitri = bySlug.get("dimitri-vegas-like-mike");
assert.ok(dimitri);
assert.equal(dimitri.roster, true);
assert.ok(dimitri.youtube);

const jauz = bySlug.get("jauz");
assert.ok(jauz);
assert.equal(jauz.roster, true);
assert.equal(jauz.youtube, "@jauzofficial");

const tchami = bySlug.get("tchami");
assert.ok(tchami);
assert.equal(tchami.roster, true);
assert.equal(tchami.youtube, "@TchamiTV");
assert.ok(tchami.gaps.includes("no-roster-soundcloud"));

const tujamo = bySlug.get("tujamo");
assert.ok(tujamo);
assert.equal(tujamo.roster, true);
assert.equal(tujamo.youtube, "@Tujamo");
assert.equal(tujamo.soundcloud, "tujamo");
assert.equal(tujamo.pin, true);
assert.ok(tujamo.gaps.includes("no-pin-thumb"));

const missingRoster = rows.filter((r) => r.gaps.includes("no-roster"));
assert.deepEqual(
  missingRoster.map((r) => r.slug),
  [],
  "every wishlist default has a roster row after the Tujamo About pin",
);

console.log("wishlistCoverage.test.ts ok");
