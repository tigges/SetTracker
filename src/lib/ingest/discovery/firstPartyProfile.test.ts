import assert from "node:assert/strict";
import {
  eventHasParseableFirstParty,
  hasParseableFirstPartyHost,
} from "./firstPartyProfile";

assert.equal(
  hasParseableFirstPartyHost("Bart Skils", "bart-skils", [
    {
      sourceUrl: "https://soundcloud.com/bart-skils/bart-skils-loveland-festival",
    },
  ]),
  true,
  "artist SoundCloud is a page we can parse",
);

assert.equal(
  hasParseableFirstPartyHost("Topic", "topic", [
    {
      sourceUrl:
        "https://soundcloud.com/tomorrowland/tomorrowland-friendship-mix-with-topic-august-2026",
    },
  ]),
  false,
  "Tomorrowland host is not Topic's profile",
);

assert.equal(
  hasParseableFirstPartyHost("Steve Aoki", "steve-aoki", [
    { sourceUrl: "https://www.youtube.com/@steveaoki/videos" },
  ]),
  true,
);

assert.equal(
  hasParseableFirstPartyHost("Steve Aoki", "steve-aoki", [
    { sourceUrl: "https://www.youtube.com/@tomorrowland" },
  ]),
  false,
);

assert.equal(eventHasParseableFirstParty({ website: "https://pacha.com" }), true);
assert.equal(
  eventHasParseableFirstParty({ soundcloud: "https://soundcloud.com/pacha" }),
  true,
);
assert.equal(eventHasParseableFirstParty({ website: null, soundcloud: null }), false);

console.log("firstPartyProfile.test.ts ok");
