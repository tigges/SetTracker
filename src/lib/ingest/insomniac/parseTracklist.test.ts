import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  parseInsomniacTrackRows,
  rowsToPlays,
} from "./parseTracklist";

const sample = `
<dt><div>'Night Owl Radio' 482 Track List</div></dt><dd><p><b>Anfisa Letyago</b> “Liquid”<br><b>Amy Wiles &amp; Leena Punks</b> “Sweet Feeling”<br><b>Above &amp; Beyond ft. Zoë Johnston</b> “We're All We Need”<br><b>Argy x Omiki x Son of Son</b> “RITMO”</p></dd>
`;

const rows = parseInsomniacTrackRows(sample);
assert.equal(rows.length, 4);
assert.equal(rows[0]?.artistName, "Anfisa Letyago");
assert.equal(rows[0]?.trackTitle, "Liquid");
assert.equal(rows[1]?.artistName, "Amy Wiles & Leena Punks");
assert.ok(rows[2]?.artistName.includes("Above & Beyond"));

const plays = rowsToPlays(rows, 7291);
assert.equal(plays.length, 4);
assert.equal(plays[0]?.provenance, "insomniac");
assert.equal(plays[0]?.idStatus, "identified");
assert.ok((plays[0]?.timestamp ?? 0) > 0);

// Live fixture when present (downloaded in CI/dev probe).
try {
  const html = readFileSync("/tmp/nor.html", "utf8");
  const live = parseInsomniacTrackRows(html);
  assert.ok(live.length >= 40, `expected dense NOR tracklist, got ${live.length}`);
  console.log(`live fixture rows=${live.length}`);
} catch {
  /* optional */
}

console.log("insomniac/parseTracklist.test.ts ok");
