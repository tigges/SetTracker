import assert from "node:assert/strict";
import {
  SEARCH_1001_LANDING,
  nativeCaptureSearchUrl,
  search1001,
  search1001Query,
  search1001QueryFromUrl,
} from "./search1001";

assert.equal(
  search1001Query("Skrillex", "SKRILLEX LIVE @ LOLLAPALOOZA CHILE 2026 (Full Set"),
  "SKRILLEX LOLLAPALOOZA CHILE 2026",
);

assert.equal(
  search1001Query("fisher"),
  "fisher",
);

assert.ok(!search1001("fisher").includes("google.com"));
assert.ok(!search1001("fisher").includes("?q="));
assert.equal(
  search1001("fisher"),
  `${SEARCH_1001_LANDING}#q=fisher`,
);
assert.ok(search1001("fisher").includes("fisher"));

assert.equal(search1001(), SEARCH_1001_LANDING);

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

assert.equal(
  search1001Query("Alok's Infinite Experience - August, 202026"),
  "Alok Infinite Experience August 2020",
);

assert.ok(
  !search1001Query("YDG Live at Zombie Apocalypse 2026 🧟\u200d♂️").includes("🧟"),
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

assert.equal(
  nativeCaptureSearchUrl(
    "https://www.1001tracklists.com/search?q=Alok's%20Infinite%20Experience%20-%20August%2C%20202026",
  ),
  search1001("Alok Infinite Experience August 2020"),
);

assert.equal(
  search1001QueryFromUrl(
    "https://www.1001tracklists.com/search?q=alok",
  ),
  "alok",
);

assert.equal(
  search1001Query("Steve Angello", "Steve Angello WE1 | Tomorrowland 2026"),
  "Steve Angello Weekend 1 Tomorrowland 2026",
);
assert.equal(
  search1001Query(
    "Carl Cox",
    "Carl Cox Boiler Room Ibiza Villa Takeovers DJ Set 2013-08-15",
    "Boiler Room",
    "2013-08-15",
  ),
  "Carl Cox Boiler Room Ibiza Villa Takeovers 2013-08-15",
);
assert.equal(
  search1001Query(
    "Peggy Gou",
    "Peggy Gou | Boiler Room x Dekmantel Festival: Amsterdam 2017-08-04",
  ),
  "Peggy Gou Boiler Room x Dekmantel Festival Amsterdam 2017-08-04",
);

console.log("search1001.test.ts ok");
