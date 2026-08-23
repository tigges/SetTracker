import assert from "node:assert/strict";
import {
  nativeCaptureSearchUrl,
  search1001,
  search1001Query,
  search1001QueryFromUrl,
} from "./search1001";

assert.equal(
  search1001Query("Skrillex", "SKRILLEX LIVE @ LOLLAPALOOZA CHILE 2026 (Full Set"),
  "SKRILLEX LIVE @ LOLLAPALOOZA CHILE 2026",
);

assert.equal(
  search1001Query("fisher"),
  "fisher",
);

assert.ok(!search1001("fisher").includes("google.com"));
assert.ok(search1001("fisher").startsWith("https://www.1001tracklists.com/search?q="));
assert.ok(search1001("fisher").includes("fisher"));

assert.equal(search1001(), "https://www.1001tracklists.com/search");

const url = search1001("Sub Zero Project", "Tomorrowland Weekend 2 2026");
assert.equal(
  search1001QueryFromUrl(url),
  "Sub Zero Project Tomorrowland Weekend 2 2026",
);

assert.ok(
  !search1001Query("Kaskade", "Kaskade Live at Sunsoaked Festival 2025 (Official Full Set)").includes(
    "Official Full Set",
  ),
);

assert.equal(
  search1001Query("calvin harris", "tomorrowland", "weekend 2", "2026", "relive", "youtube"),
  "calvin harris tomorrowland weekend 2 2026",
);

const native = search1001("calvin harris", "tomorrowland", "weekend 2", "2026");
assert.equal(nativeCaptureSearchUrl(native), native);
assert.equal(
  nativeCaptureSearchUrl(
    "https://www.google.com/search?q=calvin%20harris%20tomorrowland%20weekend%202%202026%20relive%20youtube%20site%3A1001tracklists.com",
  ),
  native,
);
assert.ok(!nativeCaptureSearchUrl(
  "https://www.google.com/search?q=Kaskade%20site%3A1001tracklists.com",
).includes("google.com"));

console.log("search1001.test.ts ok");
