import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { displayDjBio, isChartRankBio, stripChartRankSuffix } from "./djBio";
import { DJ_SOCIAL_PINS } from "./ingest/djSocialPins.data";

function pinBio(slug: string): string {
  const pin = DJ_SOCIAL_PINS.find((p) => p.slug === slug);
  assert.ok(pin, slug);
  return pin.bio;
}

describe("displayDjBio", () => {
  it("hides AC Slater handle dump after stripping genre", () => {
    assert.equal(
      displayDjBio(pinBio("ac-slater"), { genre: "Bass House" }),
      null,
    );
  });

  it("hides Guetta handle dump", () => {
    assert.equal(displayDjBio(pinBio("david-guetta"), { genre: "House" }), null);
  });

  it("keeps Solomun prose after stripping handles", () => {
    const out = displayDjBio(pinBio("solomun"), { genre: "Melodic House" });
    assert.ok(out);
    assert.match(out, /Diynamic/);
    assert.match(out, /Nobody is not loved/);
    assert.doesNotMatch(out, /@solomun/i);
    assert.doesNotMatch(out, /Beatport/i);
    assert.doesNotMatch(out, /solomun\.org/i);
  });

  it("keeps BISCITS booking and management", () => {
    const out = displayDjBio(pinBio("biscits"), { genre: "Tech House" });
    assert.ok(out);
    assert.match(out, /palmartists\.com/);
    assert.match(out, /teamwass\.com/);
    assert.doesNotMatch(out, /Tech House/);
  });

  it("keeps Honey Dijon disambiguation", () => {
    const out = displayDjBio(pinBio("honey-dijon"), { genre: "House" });
    assert.ok(out);
    assert.match(out, /Not the Paris club Djoon/);
    assert.doesNotMatch(out, /@honeydijon/);
  });

  it("hides Liu operator note plus dump", () => {
    assert.equal(
      displayDjBio(pinBio("liu"), { genre: "Brazilian Bass", homeCity: "Brazil" }),
      null,
    );
  });

  it("keeps NEGITIV booking and drops the 1001 note", () => {
    const out = displayDjBio(pinBio("negitiv"), {
      genre: "Hard Techno",
      homeCity: "Cologne",
    });
    assert.ok(out);
    assert.match(out, /BCB Family/);
    assert.doesNotMatch(out, /1001/);
  });

  it("hides 1788-L dump including no-SC note", () => {
    assert.equal(
      displayDjBio(pinBio("1788-l"), { genre: "Riddim", homeCity: "United States" }),
      null,
    );
  });

  it("returns null for empty", () => {
    assert.equal(displayDjBio(null), null);
    assert.equal(displayDjBio("   "), null);
  });

  it("hides a DJ Mag chart rank dump", () => {
    assert.equal(isChartRankBio("DJ Mag Top 100 DJs 2025 · #1."), true);
    assert.equal(isChartRankBio("The Swedish bass-house band from Stockholm started in 2015."), false);
    assert.equal(
      stripChartRankSuffix(
        "The Swedish bass-house band from Stockholm started in 2015. DJ Mag Top 100 DJs 2025 · #40.",
      ),
      "The Swedish bass-house band from Stockholm started in 2015.",
    );
    assert.equal(displayDjBio("DJ Mag Top 100 DJs 2025 · #1."), null);
    const out = displayDjBio(
      "The Swedish bass-house band from Stockholm started in 2015. DJ Mag Top 100 DJs 2025 · #40.",
    );
    assert.ok(out);
    assert.match(out, /Stockholm/);
    assert.doesNotMatch(out, /Top 100 DJs/);
  });

  it("keeps the bradeazy Beatport artist bio", () => {
    const out = displayDjBio(
      "Miami-based DJ and producer bradeazy is a rising force in the electronic music scene, blending high-energy tech-house with the attitude and edge of viral internet culture. He followed that momentum with “Up Down,” his breakout club anthem that topped Beatport and radio club charts.",
      { genre: "Bass House", homeCity: "Miami, US" },
    );
    assert.ok(out);
    assert.match(out, /Backstage Baddies|Up Down|tech-house/i);
    assert.doesNotMatch(out, /beatport\.com/i);
  });

  it("keeps the Valentino Khan About prose and drops no emails", () => {
    const out = displayDjBio(
      "Los Angeles DJ and producer whose music spans house, trap, bass, and hardstyle. His House Party EP on Mad Decent, with Diplo, Chris Lorenzo, and Wuki, debuted at #1 on the Apple Music Dance charts.",
      { homeCity: "Los Angeles, US" },
    );
    assert.ok(out);
    assert.match(out, /House Party EP/);
    assert.match(out, /Mad Decent/);
    assert.doesNotMatch(out, /unitedtalent|prodigyartists|@/i);
  });

  it("keeps the GREG 99 About prose", () => {
    const out = displayDjBio(
      "Minas Gerais producer whose sound mixes Afro House, Latin House, and Balearic vibes. Releases on Hellbent, Criterio, Nervous, and Moodchild; Still My Baby with Cloonee hit #1 on Beatport's global chart.",
      { genre: "Afro House", homeCity: "Minas Gerais, Brazil" },
    );
    assert.ok(out);
    assert.match(out, /Still My Baby/);
    assert.match(out, /Cloonee/);
    assert.doesNotMatch(out, /@greg99|spotify\.com/i);
  });

  it("keeps the Anti Up slogan and drops handles", () => {
    const out = displayDjBio(
      "Never established. Never limited. Keep calm? Says who? @chrislake x @chrislorenzo66.",
      { homeCity: "United States" },
    );
    assert.ok(out);
    assert.match(out, /Never established/);
    assert.doesNotMatch(out, /@chrislake|@chrislorenzo66/i);
  });

  it("keeps the Malaa Insomniac artist-hub bio", () => {
    const out = displayDjBio(
      "French DJ and producer who has performed in a balaclava since 2015 and released Who Is Malaa mixes on SoundCloud. Debut Illicit EP and Notorious landed on Tchami's Confession; also known for Illegal Mixtapes and the NO REDEMPTION project with Tchami.",
      { genre: "Bass House", homeCity: "France" },
    );
    assert.ok(out);
    assert.match(out, /balaclava|Who Is Malaa|Confession/i);
    assert.doesNotMatch(out, /insomniac\.com|grokipedia/i);
  });

  it("keeps the BROHUG Discogs profile line", () => {
    const out = displayDjBio(
      "The Swedish bass-house band from Stockholm, which started its activity in 2015.",
      { genre: "Bass House", homeCity: "Stockholm, Sweden" },
    );
    assert.ok(out);
    assert.match(out, /Swedish|2015/i);
    assert.doesNotMatch(out, /discogs\.com/i);
  });
});
