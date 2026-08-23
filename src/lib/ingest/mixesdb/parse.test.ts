import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canonicalMixesdbUrl,
  extractMixesdbUrls,
  isMixesdbListingUrl,
  mixesdbTimeToCue,
  parseMixesdbTracklist,
} from "./parse";

const PAGE =
  "https://www.mixesdb.com/w/2026-08-07_-_Korolova_-_Captive_Soul_098";

const WIKITEXT = `
[[File:2026-08-07_-_Korolova_-_Captive_Soul_098.jpg|right|360px]]

== File details ==
{|
| 1:02:11
|}

== Tracklist ==

<list>
[00] [[Korolova]] - Intro
[03] Someone - First Light [Captive Soul]
[08:15] Other Artist - Second Wave
[61] Late Hour - Closer
[??] ?
[1:02:03] [[Finale Act]] - Outro
</list>

[[Category:2026]]
[[Category:Korolova]]
[[Category:Tracklist: complete]]
`;

describe("extractMixesdbUrls", () => {
  it("keeps a dated mix page and canonicalizes", () => {
    assert.deepEqual(
      extractMixesdbUrls(`Tracklist: ${PAGE}`),
      [PAGE],
    );
    assert.deepEqual(
      extractMixesdbUrls(
        "Also www.mixesdb.com/w/2026-07-20_-_ALOK_-_Rave_The_World_Radio_001",
      ),
      [
        "https://www.mixesdb.com/w/2026-07-20_-_ALOK_-_Rave_The_World_Radio_001",
      ],
    );
    assert.deepEqual(
      extractMixesdbUrls(
        "https://www.mixesdb.com/w/index.php?title=2026-08-07_-_Korolova_-_Captive_Soul_098",
      ),
      [PAGE],
    );
  });

  it("drops listings, namespaces, and invented-looking titles", () => {
    assert.deepEqual(extractMixesdbUrls("https://www.mixesdb.com/w/Category:2026"), []);
    assert.deepEqual(extractMixesdbUrls("https://www.mixesdb.com/w/Help:Tracklists"), []);
    assert.deepEqual(extractMixesdbUrls("https://www.mixesdb.com/w/Special:Search"), []);
    assert.deepEqual(extractMixesdbUrls("https://www.mixesdb.com/w/Korolova"), []);
    assert.deepEqual(extractMixesdbUrls("no mixesdb here"), []);
    assert.equal(isMixesdbListingUrl("https://www.mixesdb.com/w/Category:House"), true);
    assert.equal(isMixesdbListingUrl(PAGE), false);
    assert.equal(canonicalMixesdbUrl("https://www.mixesdb.com/w/Help:Tracklists"), null);
  });
});

describe("mixesdbTimeToCue", () => {
  it("maps minute marks and keeps full clocks", () => {
    assert.equal(mixesdbTimeToCue("00"), "0:00");
    assert.equal(mixesdbTimeToCue("03"), "3:00");
    assert.equal(mixesdbTimeToCue("61"), "1:01:00");
    assert.equal(mixesdbTimeToCue("08:15"), "08:15");
    assert.equal(mixesdbTimeToCue("1:02:03"), "1:02:03");
    assert.equal(mixesdbTimeToCue("??"), null);
  });
});

describe("parseMixesdbTracklist", () => {
  it("reads timed <list> marks including MixesDB [mm] minutes", () => {
    const plays = parseMixesdbTracklist(WIKITEXT, 3900);
    assert.equal(plays.length, 5);
    assert.equal(plays[0]!.timestamp, 0);
    assert.equal(plays[0]!.artistName, "Korolova");
    assert.equal(plays[0]!.trackTitle, "Intro");
    assert.equal(plays[0]!.provenance, "mixesdb");
    assert.equal(plays[1]!.timestamp, 180);
    assert.equal(plays[1]!.artistName, "Someone");
    assert.equal(plays[1]!.trackTitle, "First Light");
    assert.equal(plays[2]!.timestamp, 8 * 60 + 15);
    assert.equal(plays[3]!.timestamp, 61 * 60);
    assert.equal(plays[4]!.timestamp, 1 * 3600 + 2 * 60 + 3);
    assert.equal(plays[4]!.artistName, "Finale Act");
  });

  it("does not invent clocks for untimed numbered lists", () => {
    const untimed = `
== Tracklist ==
<list>
01. Alok - One
02. Alok - Two
03. Alok - Three
</list>
`;
    assert.deepEqual(parseMixesdbTracklist(untimed, 3600), []);
  });

  it("returns empty on a Cloudflare challenge page", () => {
    assert.deepEqual(
      parseMixesdbTracklist("<html><title>Just a moment...</title></html>", 3600),
      [],
    );
  });
});
