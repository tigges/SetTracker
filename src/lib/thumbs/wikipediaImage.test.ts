import assert from "node:assert/strict";
import {
  cleanWikiImageUrl,
  wikipediaTitleMatches,
} from "./wikipediaImage";

assert.equal(wikipediaTitleMatches("Pacha Ibiza", "The Pacha Group"), true);
assert.equal(wikipediaTitleMatches("Amnesia Ibiza", "Amnesia (nightclub)"), true);
assert.equal(wikipediaTitleMatches("Ministry of Sound", "Ministry of Sound"), true);
assert.equal(wikipediaTitleMatches("DC-10", "Berghain"), false);

assert.equal(
  cleanWikiImageUrl(
    "https://upload.wikimedia.org/wikipedia/commons/9/99/Amnesia_ibiza.jpeg?utm_source=en.wikipedia.org",
  ),
  "https://upload.wikimedia.org/wikipedia/commons/9/99/Amnesia_ibiza.jpeg",
);

console.log("wikipediaImage.test.ts ok");
