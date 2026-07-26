import assert from "node:assert/strict";
import { guessSessionSlugFromYtTitle } from "./sessions";

assert.equal(
  guessSessionSlugFromYtTitle(
    "Tiffany Day | Boiler Room London: Tiffany Day",
  ),
  "london-tiffany-day",
);

assert.equal(
  guessSessionSlugFromYtTitle("Boiler Room London: Ayra Starr"),
  "london-ayra-starr",
);

assert.equal(
  guessSessionSlugFromYtTitle("London: Rossi. | Boiler Room"),
  "london-rossi",
);

assert.equal(
  guessSessionSlugFromYtTitle("Boiler Room Berlin: FISHER"),
  "berlin-fisher",
);

console.log("boilerroom/sessions.test.ts ok");
