import assert from "node:assert/strict";
import {
  cachedUrlProbe,
  isFreshUrlProbeRow,
  recordUrlProbe,
  resetUrlProbeCacheForTests,
  urlProbeForced,
  urlProbeTtlDays,
} from "./urlProbeCache";

assert.equal(urlProbeTtlDays({}), 30);
assert.equal(urlProbeTtlDays({ URL_PROBE_TTL_DAYS: "7" }), 7);
assert.equal(urlProbeForced({}), false);
assert.equal(urlProbeForced({ VERIFY_URLS_FORCE: "1" }), true);

const now = new Date("2026-08-25T12:00:00.000Z");
assert.equal(
  isFreshUrlProbeRow(
    { checkedAt: "2026-08-10T12:00:00.000Z", result: "ok" },
    now,
    30,
  ),
  true,
);
assert.equal(
  isFreshUrlProbeRow(
    { checkedAt: "2026-07-01T12:00:00.000Z", result: "ok" },
    now,
    30,
  ),
  false,
);

resetUrlProbeCacheForTests();
assert.equal(
  cachedUrlProbe("https://soundcloud.com/kaaze", { now }),
  null,
);
recordUrlProbe("https://soundcloud.com/kaaze", "ok", now);
assert.equal(
  cachedUrlProbe("https://soundcloud.com/kaaze", { now }),
  "ok",
);
assert.equal(
  cachedUrlProbe("https://soundcloud.com/kaaze", {
    now,
    env: { VERIFY_URLS_FORCE: "1" },
  }),
  null,
);
recordUrlProbe("https://dead.example/x", "dead", now);
assert.equal(cachedUrlProbe("https://dead.example/x", { now }), null);

console.log("urlProbeCache.test.ts ok");
