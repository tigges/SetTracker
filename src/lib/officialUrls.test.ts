import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isWeakOfficialUrl } from "./officialUrls";

describe("isWeakOfficialUrl", () => {
  it("treats rank lists and encyclopedias as weak", () => {
    assert.equal(isWeakOfficialUrl("https://djmag.com/top100clubs"), true);
    assert.equal(isWeakOfficialUrl("https://djmag.com/"), true);
    assert.equal(isWeakOfficialUrl("https://djmag.com/livesets"), false);
    assert.equal(isWeakOfficialUrl("https://6amgroup.com/clubs/fabric"), true);
    assert.equal(isWeakOfficialUrl("https://en.wikipedia.org/wiki/Fabric_(club)"), true);
    assert.equal(
      isWeakOfficialUrl(
        "https://www.mixesdb.com/w/2026-08-07_-_Korolova_-_Captive_Soul_098",
      ),
      true,
    );
    assert.equal(isWeakOfficialUrl("https://www.wikidata.org/wiki/Q123"), true);
    assert.equal(
      isWeakOfficialUrl("https://www.discogs.com/artist/2697000-Valentino-Khan"),
      true,
    );
    assert.equal(
      isWeakOfficialUrl(
        "https://www.insomniac.com/music/artists/valentino-khan/",
      ),
      true,
    );
    assert.equal(isWeakOfficialUrl("https://www.insomniac.com/"), false);
  });

  it("treats ticket / directory hosts as weak", () => {
    assert.equal(isWeakOfficialUrl("https://ra.co/clubs/123"), true);
    assert.equal(isWeakOfficialUrl("https://ra.co/dj/korolova"), true);
    assert.equal(
      isWeakOfficialUrl("https://technomusicworld.com/artist/fantasm/about"),
      true,
    );
    assert.equal(isWeakOfficialUrl("https://www.residentadvisor.net/club.aspx?id=1"), true);
    assert.equal(isWeakOfficialUrl("https://dice.fm/venue/fabric-london"), true);
    assert.equal(isWeakOfficialUrl("https://shotgun.live/venues/fabric"), true);
    assert.equal(
      isWeakOfficialUrl(
        "https://www.jambase.com/festival/vision-colour-music-festival-2025-2",
      ),
      true,
    );
    assert.equal(
      isWeakOfficialUrl("https://www.eventpop.me/e/159292/wpbkk2027amaxon"),
      true,
    );
    assert.equal(
      isWeakOfficialUrl("https://www.puntoticket.com/creamfields-2026"),
      true,
    );
  });

  it("keeps first-party club and DJ sites", () => {
    assert.equal(isWeakOfficialUrl("https://fabriclondon.com/"), false);
    assert.equal(isWeakOfficialUrl("https://www.carlcox.com/"), false);
    assert.equal(isWeakOfficialUrl("https://djoon.com/"), false);
    assert.equal(isWeakOfficialUrl("https://solo.to/korolova.dj"), false);
    assert.equal(isWeakOfficialUrl("https://linktr.ee/honeydijon"), false);
    assert.equal(isWeakOfficialUrl("https://valentinokhan.com/"), false);
    assert.equal(isWeakOfficialUrl("https://skrillex.com/"), false);
    assert.equal(isWeakOfficialUrl("https://plastik-funk.de/"), false);
    assert.equal(isWeakOfficialUrl("https://www.aboveandbeyond.nu/"), false);
    assert.equal(isWeakOfficialUrl("https://haloofc.com/"), false);
    assert.equal(isWeakOfficialUrl("https://www.creamfields.cl/"), false);
    assert.equal(isWeakOfficialUrl(null), false);
    assert.equal(isWeakOfficialUrl(""), false);
  });
});
