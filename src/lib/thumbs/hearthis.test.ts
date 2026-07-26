import assert from "node:assert/strict";
import {
  parseHearthisUrl,
  pickHearthisImage,
} from "../ingest/hearthis/client";
import { resolveHearthisTrackImage, resolveHearthisUserImage } from "./hearthis";

assert.deepEqual(parseHearthisUrl("https://hearthis.at/shaun-mbetse/"), {
  user: "shaun-mbetse",
  track: undefined,
});
assert.deepEqual(
  parseHearthisUrl("https://hearthis.at/shaun-mbetse/busted-birthday-mix/"),
  { user: "shaun-mbetse", track: "busted-birthday-mix" },
);
assert.equal(parseHearthisUrl("https://soundcloud.com/foo"), null);

assert.equal(
  pickHearthisImage(null, "https://img.hearthis.at/a.jpg", "https://x"),
  "https://img.hearthis.at/a.jpg",
);

async function main() {
  const avatar = await resolveHearthisUserImage("shaun-mbetse");
  assert.ok(avatar && avatar.includes("hearthis.at"), `avatar=${avatar}`);

  const track = await resolveHearthisTrackImage(
    "https://hearthis.at/shaun-mbetse/busted-birthday-mix/",
  );
  assert.ok(
    track.setImage && track.setImage.includes("hearthis.at"),
    `setImage=${track.setImage}`,
  );
  assert.ok(track.artistImage && track.artistImage.includes("hearthis.at"));
  console.log("hearthis.test.ts ok");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
