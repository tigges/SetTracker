import assert from "node:assert/strict";
import {
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

console.log("search1001.test.ts ok");
