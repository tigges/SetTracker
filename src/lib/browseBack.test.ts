import assert from "node:assert/strict";
import {
  browseLabelFromPath,
  humanizeSlug,
  isBrowsePath,
  pathnameOf,
  resolveBrowseBackTarget,
} from "./browseBack";

assert.equal(humanizeSlug("steve-aoki"), "Steve Aoki");
assert.equal(pathnameOf("/sets/?x=1#y"), "/sets");
assert.equal(pathnameOf("/"), "/");

assert.equal(isBrowsePath("/"), true);
assert.equal(isBrowsePath("/sets"), true);
assert.equal(isBrowsePath("/sets/"), true);
assert.equal(isBrowsePath("/djs/steve-aoki"), true);
assert.equal(isBrowsePath("/events/tomorrowland"), true);
assert.equal(isBrowsePath("/search"), true);
assert.equal(isBrowsePath("/sets/aoki-friendship-mix"), false);
assert.equal(isBrowsePath("/djs/steve-aoki/extra"), false);

assert.equal(browseLabelFromPath("/"), "Home");
assert.equal(browseLabelFromPath("/sets"), "Sets");
assert.equal(browseLabelFromPath("/djs/steve-aoki"), "Steve Aoki");
assert.equal(
  browseLabelFromPath("/events/tomorrowland", "Tomorrowland"),
  "Tomorrowland",
);
assert.equal(browseLabelFromPath("/sets/foo-bar"), null);

const fromList = resolveBrowseBackTarget(
  { href: "/events/tomorrowland", label: "Tomorrowland" },
  "/events/tomorrowland",
);
assert.equal(fromList?.useBack, true);
assert.equal(fromList?.label, "Tomorrowland");

const afterRelated = resolveBrowseBackTarget(
  { href: "/events/tomorrowland", label: "Tomorrowland" },
  "/sets/other-mix",
);
assert.equal(afterRelated?.useBack, false);
assert.equal(afterRelated?.href, "/events/tomorrowland");

const coldReferrer = resolveBrowseBackTarget(null, "/sets");
assert.equal(coldReferrer?.label, "Sets");
assert.equal(coldReferrer?.useBack, true);

assert.equal(resolveBrowseBackTarget(null, "https://soundcloud.com/x"), null);
assert.equal(
  resolveBrowseBackTarget(null, "/sets/already-a-set"),
  null,
);
