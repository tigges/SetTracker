import assert from "node:assert/strict";
import { extract1001Urls } from "./parse";
import {
  TL_AHEE_LIQUID_STRANGER_EDC_LV_2026,
  TL_BLEU_CLAIR_EDC_LV_2023,
  TL_CHARLOTTE_DE_WITTE_TML_WE1_2026,
  TL_CID_EDC_LV_2017,
  TL_CLOONEE_EDC_LV_2022,
  TL_CLOONEE_PROSPA_DESTINO_2026,
  TL_DARUDE_EDC_LV_2026,
  TL_DOM_DOLLA_EDC_LV_2023,
  TL_DOM_DOLLA_EDC_LV_2024,
  TL_LAYTON_GIORDANI_EDC_LV_2025_CLOSING,
  TL_MARTEN_HORGER_EDC_LV_2023,
  TL_MAX_STYLER_EDC_LV_2024,
  TL_MARTEN_HORGER_PAROOKAVILLE_2026,
  TL_NICO_MORENO_EDC_LV_2026,
  TL_NICO_MORENO_HOLY_PRIEST_EDC_LV_2026,
  TL_ODD_MOB_EDC_LV_2025,
  TL_PEGASSI_EDC_LV_2026,
  TL_SARAH_DE_WARREN_EDC_LV_2026,
  TL_SOLOMUN_EDC_LV_2026,
  TL_WAX_MOTIF_EDC_LV_2021,
  TL_WESTEND_EDC_LV_2026,
  TRACKLIST_1001_BY_SOURCE_SLUG,
  tracklist1001RowsToPlays,
} from "./seeds";
import { assertSeedClocks } from "./festival2026";
import { parseClockToSec } from "../fingerprint/seeds";

const urls = extract1001Urls(
  `Tracklist: https://1001.tl/vfff7hk\nAlso https://www.1001tracklists.com/tracklist/vfff7hk/foo.html`,
);
assert.equal(urls.length, 2);
assert.match(urls[0]!, /1001\.tl\/vfff7hk/);

const bare = extract1001Urls("Tracklist: 1001.tl/qhdctfk (CID EDC)");
assert.equal(bare.length, 1);
assert.equal(bare[0], "https://1001.tl/qhdctfk");

const httpBare = extract1001Urls("TL http://1001.tl/24gpuclk");
assert.equal(httpBare.length, 1);
assert.match(httpBare[0]!, /1001\.tl\/24gpuclk/);

const plays = tracklist1001RowsToPlays(TL_MARTEN_HORGER_EDC_LV_2023);
assert.equal(plays.length, 23);
assert.equal(plays[0]!.provenance, "1001tl");
assert.equal(plays[0]!.timestamp, 35);
assert.equal(plays[0]!.artistName, "Marten Horger, BIJOU");
assert.equal(plays[0]!.trackTitle, "I Know");
assert.equal(plays[6]!.trackTitle, "The Calling");
assert.equal(plays[12]!.artistName, "David Guetta, Marten Horger");
assert.equal(plays[22]!.trackTitle, "Free My Mind");
assert.equal(plays[22]!.timestamp, 55 * 60 + 50);

assertSeedClocks(TL_MARTEN_HORGER_PAROOKAVILLE_2026);
assertSeedClocks(TL_CLOONEE_PROSPA_DESTINO_2026);
assertSeedClocks(TL_CHARLOTTE_DE_WITTE_TML_WE1_2026);
const paro = tracklist1001RowsToPlays(TL_MARTEN_HORGER_PAROOKAVILLE_2026);
assert.ok(paro.length >= 16);
assert.equal(paro[0]!.trackTitle, "Tom's Diner");
assert.equal(paro[paro.length - 1]!.trackTitle, "Rave (PAROOKAVILLE Anthem 2026)");
const cloonee = tracklist1001RowsToPlays(TL_CLOONEE_PROSPA_DESTINO_2026);
assert.ok(cloonee.length >= 20);
assert.ok(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-charlottedewittemusic-charlotte-de-witte-at"
  ]!.length >= 8,
);

assertSeedClocks(TL_WESTEND_EDC_LV_2026);
const westend = tracklist1001RowsToPlays(TL_WESTEND_EDC_LV_2026);
assert.equal(westend.length, 26);
assert.equal(westend[0]!.trackTitle, "We Stay Inside");
assert.equal(westend[0]!.artistName, "Glass Petals ft. Sophiegrophy");
assert.equal(westend[westend.length - 1]!.trackTitle, "Feels Better");
assert.ok(
  westend.some((p) => p.trackTitle === "Drum Death (DENNETT Remix)"),
);
const likeYou = westend.find((p) => p.trackTitle === "Like You A Lot");
assert.equal(likeYou?.timestamp, 20 * 60 + 59);
const proper = westend.find(
  (p) => p.trackTitle === "Proper Education (Westend Edit)",
);
assert.equal(proper?.timestamp, 29 * 60 + 48);
let westPrev = -1;
for (const p of westend) {
  assert.ok(
    p.timestamp > westPrev,
    `Westend clocks must increase @ ${p.timestamp}`,
  );
  westPrev = p.timestamp;
}
assert.ok(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-itsthewestend-westend-live-edc-2026"]!
    .length >= 24,
);

assertSeedClocks(TL_AHEE_LIQUID_STRANGER_EDC_LV_2026);
const ahee = tracklist1001RowsToPlays(TL_AHEE_LIQUID_STRANGER_EDC_LV_2026);
assert.ok(ahee.length >= 55);
assert.equal(ahee[0]!.trackTitle, "Superstar");
assert.equal(ahee[ahee.length - 1]!.trackTitle, "Restless (ID Remix)");
assert.ok(
  ahee.some((p) => p.trackTitle === "Jungle Juice"),
  "expected Jungle Juice from 1001 screenshots",
);
assert.ok(
  ahee.some((p) => p.trackTitle === "Lose It"),
  "expected Lose It from later screenshots",
);
assert.ok(
  ahee.some((p) => p.trackTitle === "Crab Rave"),
  "expected Crab Rave from later screenshots",
);
const gunslinger = ahee.find(
  (p) => p.trackTitle === "Gunslinger (Bemah Flip)",
);
assert.equal(gunslinger?.timestamp, 45 * 60 + 30);
assert.ok(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-yXHoHK_jQvc"]!.length >= 55,
);

assertSeedClocks(TL_DARUDE_EDC_LV_2026);
const darude = tracklist1001RowsToPlays(TL_DARUDE_EDC_LV_2026);
assert.equal(darude.length, 12);
assert.equal(
  darude[0]!.trackTitle,
  "Beautiful Alien (Boyan & Boyer Remix)",
);
assert.equal(darude[2]!.trackTitle, "iROK");
assert.equal(darude[darude.length - 1]!.trackTitle, "Tell Me Why (Darude Remix)");
const sandstorm = darude.find((p) => /Sandstorm/i.test(p.trackTitle || ""));
assert.equal(sandstorm?.timestamp, 40 * 60);
assert.ok(
  !darude.some((p) => /Nobody Listens/i.test(p.trackTitle || "")),
  "08:26 on 1001 is Darude ID, not Nobody Listens",
);
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-dXBoIY65P8s"]!.length >= 12);

assertSeedClocks(TL_CID_EDC_LV_2017);
const cid = tracklist1001RowsToPlays(TL_CID_EDC_LV_2017);
assert.equal(cid.length, 26);
assert.equal(cid[0]!.trackTitle, "Sweet Memories");
assert.equal(cid[cid.length - 1]!.trackTitle, "Us");
let cidPrev = -1;
for (const p of cid) {
  assert.ok(p.timestamp > cidPrev, `CID clocks must increase @ ${p.timestamp}`);
  cidPrev = p.timestamp;
}
assert.equal(parseClockToSec("6:22"), cid[3]!.timestamp);
assert.ok(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-cidmusic-cid-edc-lv-2017"]!.length >= 20,
);

assertSeedClocks(TL_BLEU_CLAIR_EDC_LV_2023);
const bleu = tracklist1001RowsToPlays(TL_BLEU_CLAIR_EDC_LV_2023);
assert.equal(bleu.length, 20);
assert.equal(bleu[0]!.trackTitle, "Mean Sumthin");
assert.equal(bleu[bleu.length - 1]!.trackTitle, "Mistake");
let bleuPrev = -1;
for (const p of bleu) {
  assert.ok(
    p.timestamp > bleuPrev,
    `Bleu Clair clocks must increase @ ${p.timestamp}`,
  );
  bleuPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-c_sx3zum8Z0"]!.length >= 18);
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["sc-bleuclair-edclv2023"]!.length >= 18);

assertSeedClocks(TL_WAX_MOTIF_EDC_LV_2021);
const wax = tracklist1001RowsToPlays(TL_WAX_MOTIF_EDC_LV_2021);
assert.equal(wax.length, 25);
assert.equal(wax[0]!.trackTitle, "Pink Soldiers (Squid Game OST)");
assert.equal(wax[wax.length - 1]!.trackTitle, "Need You");
let waxPrev = -1;
for (const p of wax) {
  assert.ok(p.timestamp > waxPrev, `Wax Motif clocks must increase @ ${p.timestamp}`);
  waxPrev = p.timestamp;
}
assert.ok(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-waxmotif-wax-motif-live-edc-2021"]!
    .length >= 20,
);

assertSeedClocks(TL_CLOONEE_EDC_LV_2022);
const clooneeEdc = tracklist1001RowsToPlays(TL_CLOONEE_EDC_LV_2022);
assert.equal(clooneeEdc.length, 15);
assert.equal(clooneeEdc[0]!.trackTitle, "Fine Night");
assert.equal(clooneeEdc[clooneeEdc.length - 1]!.trackTitle, "Sun Goes Down");
let cloPrev = -1;
for (const p of clooneeEdc) {
  assert.ok(p.timestamp > cloPrev, `Cloonee EDC clocks must increase @ ${p.timestamp}`);
  cloPrev = p.timestamp;
}
assert.ok(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-cloonee-cloonee-edc-2022"]!.length >= 14,
);

assertSeedClocks(TL_ODD_MOB_EDC_LV_2025);
const oddMob = tracklist1001RowsToPlays(TL_ODD_MOB_EDC_LV_2025);
assert.equal(oddMob.length, 29);
assert.equal(oddMob[0]!.trackTitle, "Vertigo");
assert.equal(oddMob[oddMob.length - 1]!.trackTitle, "Toxic");
let omPrev = -1;
for (const p of oddMob) {
  assert.ok(p.timestamp > omPrev, `Odd Mob clocks must increase @ ${p.timestamp}`);
  omPrev = p.timestamp;
}
assert.ok(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-oceanologymusic-odd-mob-live-at-edc-las-vegas-2025-cosmic-meadow-day-2-3"
  ]!.length >= 25,
);

assertSeedClocks(TL_LAYTON_GIORDANI_EDC_LV_2025_CLOSING);
const layton = tracklist1001RowsToPlays(TL_LAYTON_GIORDANI_EDC_LV_2025_CLOSING);
assert.equal(layton.length, 21);
assert.match(layton[0]!.trackTitle!, /Scary Monsters/);
assert.match(layton[layton.length - 1]!.trackTitle!, /Room For Happiness/);
let layPrev = -1;
for (const p of layton) {
  assert.ok(p.timestamp >= layPrev, `Layton clocks must not go back @ ${p.timestamp}`);
  layPrev = p.timestamp;
}
assert.ok(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-laytongiordani-layton-giordani-live-edc-las-vegas-circuit-grounds-closing-set-2025"
  ]!.length >= 20,
);

assertSeedClocks(TL_MAX_STYLER_EDC_LV_2024);
const maxStyler = tracklist1001RowsToPlays(TL_MAX_STYLER_EDC_LV_2024);
assert.equal(maxStyler.length, 20);
assert.equal(maxStyler[0]!.trackTitle, "Lights Out");
assert.equal(maxStyler[maxStyler.length - 1]!.trackTitle, "Work It");
let msPrev = -1;
for (const p of maxStyler) {
  assert.ok(p.timestamp > msPrev, `Max Styler clocks must increase @ ${p.timestamp}`);
  msPrev = p.timestamp;
}
assert.ok(
  TRACKLIST_1001_BY_SOURCE_SLUG["sc-maxstyler-max-styler-live-edc-vegas-2024"]!
    .length >= 18,
);

assertSeedClocks(TL_DOM_DOLLA_EDC_LV_2023);
const dom23 = tracklist1001RowsToPlays(TL_DOM_DOLLA_EDC_LV_2023);
assert.equal(dom23.length, 32);
assert.equal(dom23[0]!.trackTitle, "Pacha On Acid");
assert.match(dom23[dom23.length - 1]!.trackTitle!, /Rhyme Dust/);
assert.equal(dom23[dom23.length - 1]!.timestamp, 69 * 60 + 42);
let dom23Prev = -1;
for (const p of dom23) {
  assert.ok(
    p.timestamp > dom23Prev,
    `Dom Dolla 2023 clocks must increase @ ${p.timestamp}`,
  );
  dom23Prev = p.timestamp;
}
assert.ok(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-domdolla-dom-dolla-live-edc-las-vegas-2023"
  ]!.length >= 28,
);

assertSeedClocks(TL_DOM_DOLLA_EDC_LV_2024);
const dom = tracklist1001RowsToPlays(TL_DOM_DOLLA_EDC_LV_2024);
assert.equal(dom.length, 35);
assert.equal(dom[0]!.trackTitle, "girl$");
assert.equal(dom[dom.length - 1]!.trackTitle, "CAVE");
assert.equal(dom[dom.length - 1]!.timestamp, 64 * 60 + 17);
let domPrev = -1;
for (const p of dom) {
  assert.ok(p.timestamp > domPrev, `Dom Dolla clocks must increase @ ${p.timestamp}`);
  domPrev = p.timestamp;
}
assert.ok(
  TRACKLIST_1001_BY_SOURCE_SLUG[
    "sc-domdolla-dom-dolla-live-edc-circuitgrounds-las-vegas-2024"
  ]!.length >= 30,
);

assertSeedClocks(TL_SOLOMUN_EDC_LV_2026);
const solomun = tracklist1001RowsToPlays(TL_SOLOMUN_EDC_LV_2026);
assert.equal(solomun.length, 18);
assert.equal(solomun[0]!.trackTitle, "Rumpta");
assert.equal(solomun[solomun.length - 1]!.trackTitle, "Kinesphere");
assert.equal(solomun[solomun.length - 1]!.timestamp, 85 * 60 + 40);
let solPrev = -1;
for (const p of solomun) {
  assert.ok(p.timestamp > solPrev, `Solomun clocks must increase @ ${p.timestamp}`);
  solPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-g1vH9C_o-vo"]!.length >= 16);

assertSeedClocks(TL_SARAH_DE_WARREN_EDC_LV_2026);
const sarah = tracklist1001RowsToPlays(TL_SARAH_DE_WARREN_EDC_LV_2026);
assert.equal(sarah.length, 15);
assert.equal(sarah[0]!.trackTitle, "Fight Machine");
assert.match(sarah[sarah.length - 1]!.trackTitle!, /All The Things She Said/);
let sarahPrev = -1;
for (const p of sarah) {
  assert.ok(
    p.timestamp >= sarahPrev,
    `Sarah de Warren clocks must not go back @ ${p.timestamp}`,
  );
  sarahPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-KIb3psOt9hI"]!.length >= 14);

assertSeedClocks(TL_PEGASSI_EDC_LV_2026);
const pegassi = tracklist1001RowsToPlays(TL_PEGASSI_EDC_LV_2026);
assert.equal(pegassi.length, 12);
assert.equal(pegassi[0]!.trackTitle, "Heartless");
assert.equal(pegassi[pegassi.length - 1]!.trackTitle, "Spectral Bells");
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-yUA0Ht2PdG0"]!.length >= 12);

assertSeedClocks(TL_NICO_MORENO_EDC_LV_2026);
const nico = tracklist1001RowsToPlays(TL_NICO_MORENO_EDC_LV_2026);
assert.equal(nico.length, 40);
assert.equal(nico[0]!.trackTitle, "See Me Coming");
assert.match(nico[nico.length - 1]!.trackTitle!, /Died In Your Arms/);
let nicoPrev = -1;
for (const p of nico) {
  assert.ok(p.timestamp > nicoPrev, `Nico clocks must increase @ ${p.timestamp}`);
  nicoPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-f_p6nfbrm0E"]!.length >= 40);

assertSeedClocks(TL_NICO_MORENO_HOLY_PRIEST_EDC_LV_2026);
const nicoHp = tracklist1001RowsToPlays(TL_NICO_MORENO_HOLY_PRIEST_EDC_LV_2026);
assert.equal(nicoHp.length, 47);
assert.equal(nicoHp[0]!.trackTitle, "Overdose");
assert.match(nicoHp[nicoHp.length - 1]!.trackTitle!, /Move Ma Body/);
// B2B Relive not published officially yet — seed held, not slug-mapped.
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-nZS9gvjlPIs"],
  undefined,
);

console.log("tracklists1001/seeds.test.ts ok");
