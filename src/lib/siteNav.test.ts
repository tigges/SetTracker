import assert from "node:assert/strict";
import { isPrimaryNavActive } from "./siteNav";

assert.equal(isPrimaryNavActive("/", "/sets"), false);
assert.equal(isPrimaryNavActive("/sets", "/sets"), true);
assert.equal(isPrimaryNavActive("/sets/yt-abc", "/sets"), true);
assert.equal(isPrimaryNavActive("/djs", "/sets"), false);
assert.equal(isPrimaryNavActive("/djs", "/djs"), true);
assert.equal(isPrimaryNavActive("/djs/charlotte-de-witte", "/djs"), true);
assert.equal(isPrimaryNavActive("/events", "/events"), true);
assert.equal(isPrimaryNavActive("/events/tomorrowland", "/events"), true);
assert.equal(isPrimaryNavActive("/events/calendar", "/events"), true);
assert.equal(isPrimaryNavActive("/venues/amnesia", "/events"), true);
assert.equal(isPrimaryNavActive("/atlas", "/events"), false);
