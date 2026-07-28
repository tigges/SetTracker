import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  parseInsomniacTrackRows,
  rowsToPlays,
} from "./parseTracklist";

const sample = `
<dt><div>'Night Owl Radio' 482 Track List</div></dt><dd><p><b>Anfisa Letyago</b> “Liquid”<br><b>Amy Wiles &amp; Leena Punks</b> “Sweet Feeling”<br><b>Above &amp; Beyond ft. Zoë Johnston</b> “We're All We Need”<br><b>Argy x Omiki x Son of Son</b> “RITMO”<br><b>Hayden James ft. AR/CO</b> “We Could Be Love” (Fideles Remix)</p></dd>
`;

const rows = parseInsomniacTrackRows(sample);
assert.equal(rows.length, 5);
assert.equal(rows[0]?.artistName, "Anfisa Letyago");
assert.equal(rows[0]?.trackTitle, "Liquid");
assert.equal(rows[1]?.artistName, "Amy Wiles & Leena Punks");
assert.ok(rows[2]?.artistName.includes("Above & Beyond"));
assert.equal(
  rows[4]?.trackTitle,
  "We Could Be Love (Fideles Remix)",
);

const plays = rowsToPlays(rows, 7291);
assert.equal(plays.length, 5);
assert.equal(plays[0]?.provenance, "insomniac");
assert.equal(plays[0]?.idStatus, "identified");
assert.ok((plays[0]?.timestamp ?? 0) > 0);

// Guest-section headers must not glue into the next artist.
const guesty = `
<dt><div>'Night Owl Radio' 475 Track List</div></dt><dd><p><b>Avi Sic</b> “Get Up &amp; Listen”</p><p><b>Loofy - Up All&nbsp;<span class="il">Night</span></b><br><b>Blksmiith</b> “you talk like someone else”<br><b>Loofy</b> “Last&nbsp;<span class="il">Night</span>”<br><b>William Kiss</b> “BE WITH U”</p><p><b>D.O.D Guest Mix</b></p></dd>
`;
const guestRows = parseInsomniacTrackRows(guesty);
assert.equal(guestRows.length, 4);
assert.equal(guestRows[0]?.artistName, "Avi Sic");
assert.equal(guestRows[1]?.artistName, "Blksmiith");
assert.equal(guestRows[1]?.trackTitle, "you talk like someone else");
assert.equal(guestRows[2]?.artistName, "Loofy");
assert.equal(guestRows[2]?.trackTitle, "Last Night");
assert.ok(!guestRows.some((r) => /guest mix/i.test(r.artistName)));

// Mixes often use <strong> instead of <b>.
const strongSample = `
<dt><div>Metronome #169 Track List</div></dt><dd><p><strong>Claptone </strong>“Stay the Night” (Mihalis Safras remix)<br><strong>Mihalis Safras</strong> “Action”<br><strong>Gigak</strong> – ID [Material Unreleased]</p></dd>
`;
const strongRows = parseInsomniacTrackRows(strongSample);
assert.equal(strongRows.length, 3);
assert.equal(strongRows[0]?.artistName, "Claptone");
assert.ok(strongRows[0]?.trackTitle.includes("Stay the Night"));
assert.equal(strongRows[2]?.trackTitle, "ID [Material Unreleased]");

for (const path of ["/tmp/nor-482.html", "/tmp/nor-475.html", "/tmp/nor-470.html"]) {
  try {
    const html = readFileSync(path, "utf8");
    const live = parseInsomniacTrackRows(html);
    if (path.includes("482")) assert.ok(live.length >= 60, `${path}: ${live.length}`);
    if (path.includes("475")) {
      assert.ok(live.length >= 20, `${path}: ${live.length}`);
      assert.ok(!live.some((r) => /NightBlksmiith/i.test(r.artistName)));
    }
    if (path.includes("470")) assert.ok(live.length >= 25, `${path}: ${live.length}`);
    console.log(`${path} rows=${live.length}`);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
  }
}

console.log("insomniac/parseTracklist.test.ts ok");
