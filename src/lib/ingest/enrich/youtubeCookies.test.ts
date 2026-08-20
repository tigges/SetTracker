import assert from "node:assert/strict";
import {
  cookieHealthNotice,
  cookieRefreshHint,
  inspectYoutubeCookies,
} from "./youtubeCookies";

const now = 1_700_000_000;

const empty = inspectYoutubeCookies("", now);
assert.equal(empty.present, false);
assert.equal(empty.stale, true);

const loggedIn = inspectYoutubeCookies(
  [
    "# Netscape HTTP Cookie File",
    ".youtube.com	TRUE	/	TRUE	1800000000	LOGIN_INFO	redacted",
    ".youtube.com	TRUE	/	TRUE	1800000000	SAPISID	redacted",
    ".youtube.com	TRUE	/	TRUE	1800000000	__Secure-1PSID	redacted",
    ".youtube.com	TRUE	/	TRUE	1800000000	__Secure-1PSIDTS	redacted",
    ".google.com	TRUE	/	TRUE	1800000000	SID	redacted",
  ].join("\n"),
  now,
);
assert.equal(loggedIn.present, true);
assert.equal(loggedIn.netscapeHeader, true);
assert.equal(loggedIn.youtubeRows, 4);
assert.equal(loggedIn.hasLoginInfo, true);
assert.equal(loggedIn.stale, false);
assert.ok(cookieHealthNotice(loggedIn).includes("fresh"));

const expired = inspectYoutubeCookies(
  [
    "# Netscape HTTP Cookie File",
    ".youtube.com	TRUE	/	TRUE	100	LOGIN_INFO	x",
    ".youtube.com	TRUE	/	TRUE	100	SAPISID	x",
    ".youtube.com	TRUE	/	TRUE	100	__Secure-1PSID	x",
  ].join("\n"),
  now,
);
assert.equal(expired.stale, true);
assert.match(expired.staleReason, /expired/);

const sessionOnly = inspectYoutubeCookies(
  [
    "# Netscape HTTP Cookie File",
    ".youtube.com	TRUE	/	TRUE	0	LOGIN_INFO	x",
    ".youtube.com	TRUE	/	TRUE	0	SAPISID	x",
    ".youtube.com	TRUE	/	TRUE	0	__Secure-1PSID	x",
  ].join("\n"),
  now,
);
assert.equal(sessionOnly.sessionOnly, true);
assert.equal(sessionOnly.stale, true);

const sparse = inspectYoutubeCookies(
  ".example.com	TRUE	/	TRUE	1800000000	FOO	x\n",
  now,
);
assert.equal(sparse.stale, true);
assert.match(sparse.staleReason, /too few/);

assert.match(cookieRefreshHint(empty, now), /cookies:export/);
assert.match(cookieRefreshHint(expired, now), /Refresh now/);
assert.match(cookieRefreshHint(loggedIn, now), /next refresh/);

console.log("youtubeCookies.test.ts ok");
