import assert from "node:assert/strict";
import { extract1001Urls } from "./parse";
import {
  TL_AHEE_LIQUID_STRANGER_EDC_LV_2026,
  TL_ARMIN_VAN_BUUREN_YT_HOUSE_TML_2026,
  TL_AYYBO_ODD_MOB_TML_WE2_2026,
  TL_BLEU_CLAIR_EDC_LV_2023,
  TL_CALVIN_HARRIS_TML_WE2_2026,
  TL_CHARLOTTE_DE_WITTE_TML_WE1_2026,
  TL_CHRIS_LORENZO_TML_WE2_2026,
  TL_CID_EDC_LV_2017,
  TL_CLOONEE_EDC_LV_2022,
  TL_CLOONEE_PROSPA_DESTINO_2026,
  TL_DARUDE_EDC_LV_2026,
  TL_DEBORAH_STREET_PARADE_2025,
  TL_KEVIN_DE_VRIES_STREET_PARADE_2025,
  TL_KOLSCH_STREET_PARADE_2025,
  TL_MASSANO_STREET_PARADE_2025,
  TL_MASSANO_TML_WE2_2026,
  TL_ADIEL_STREET_PARADE_2025,
  TL_DIMITRI_VEGAS_NICO_MORENO_TML_WE2_2026,
  TL_DIMITRI_VEGAS_TML_WE2_2026,
  TL_DOM_DOLLA_ALLIANZ_SYDNEY,
  TL_DOM_DOLLA_EDC_LV_2023,
  TL_DOM_DOLLA_EDC_LV_2024,
  TL_DYZEN_TML_WE2_2026,
  TL_ENRICO_SANGIULIANO_TML_WE2_2026,
  TL_ERIC_PRYDZ_ULTRA_MIAMI_2026,
  TL_FISHER_TML_WE1_2026,
  TL_FISHER_TML_WE2_2026,
  TL_FUNK_TRIBU_EDC_LV_2026,
  TL_HARDWELL_TML_WE2_2026,
  TL_HOLY_PRIEST_EDC_LV_2026,
  TL_HOLY_PRIEST_TML_WE1_2026,
  TL_CYRIL_TML_WE2_2026,
  TL_DARREN_STYLES_TML_WE2_2026,
  TL_BASSJACKERS_TML_WE2_2026,
  TL_BHASKAR_TML_WE2_2026,
  TL_PUSH_TML_WE2_2026,
  TL_JAMES_HYPE_MELKWEG_ADE_2025,
  TL_JAMES_HYPE_TML_WE2_2026,
  TL_JOHN_SUMMIT_TML_WE2_2026,
  TL_KOLSCH_TML_WE2_2026,
  TL_KOROLOVA_TML_WE2_2026,
  TL_LUCAS_STEVE_TML_WE2_2026,
  TL_SARA_LANDRY_TML_WE2_2026,
  TL_AFROJACK_R3HAB_TML_WE2_2026,
  TL_STEVE_AOKI_TML_WE2_2026,
  TL_LAYTON_GIORDANI_EDC_LV_2025_CLOSING,
  TL_MARTEN_HORGER_EDC_LV_2023,
  TL_MAX_STYLER_EDC_LV_2024,
  TL_MARTEN_HORGER_PAROOKAVILLE_2026,
  TL_MATTY_RALPH_EDC_LV_2026,
  TL_MISS_MONIQUE_TML_WE2_2026,
  TL_NICKY_ROMERO_TML_WE2_2026,
  TL_NICO_MORENO_EDC_LV_2026,
  TL_NICO_MORENO_HOLY_PRIEST_EDC_LV_2026,
  TL_ODD_MOB_EDC_LV_2025,
  TL_ODD_MOB_TML_WE2_2026,
  TL_PEGASSI_EDC_LV_2026,
  TL_SARAH_DE_WARREN_EDC_LV_2026,
  TL_SOLOMUN_ALLY_PALLY_2026,
  TL_SOLOMUN_EDC_LV_2026,
  TL_SONNY_FODERA_TML_WE2_2026,
  TL_STEVE_ANGELLO_TML_WE2_2026,
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

assertSeedClocks(TL_DOM_DOLLA_ALLIANZ_SYDNEY);
const domSyd = tracklist1001RowsToPlays(TL_DOM_DOLLA_ALLIANZ_SYDNEY);
assert.equal(domSyd.length, 58);
assert.match(domSyd[0]!.trackTitle!, /Pyramids/);
assert.equal(
  domSyd[domSyd.length - 1]!.trackTitle,
  "Rhyme Dust (Dimension Remix)",
);
assert.equal(domSyd[domSyd.length - 1]!.timestamp, 118 * 60 + 11);
let domSydPrev = -1;
for (const p of domSyd) {
  assert.ok(
    p.timestamp > domSydPrev,
    `Dom Dolla Allianz Sydney clocks must increase @ ${p.timestamp}`,
  );
  domSydPrev = p.timestamp;
}
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-4Lqyh7cWRxQ"],
  TL_DOM_DOLLA_ALLIANZ_SYDNEY,
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

assertSeedClocks(TL_SOLOMUN_ALLY_PALLY_2026);
const solomunAlly = tracklist1001RowsToPlays(TL_SOLOMUN_ALLY_PALLY_2026);
assert.equal(solomunAlly.length, 29);
assert.equal(solomunAlly[0]!.trackTitle, "Acid");
assert.equal(
  solomunAlly[solomunAlly.length - 1]!.trackTitle,
  "Tout Le Monde Est Fou",
);
assert.equal(solomunAlly[solomunAlly.length - 1]!.timestamp, 2 * 3600 + 37 * 60);
let solAllyPrev = -1;
for (const p of solomunAlly) {
  assert.ok(
    p.timestamp > solAllyPrev,
    `Solomun Ally Pally clocks must increase @ ${p.timestamp}`,
  );
  solAllyPrev = p.timestamp;
}
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-S46Bs4pZ_I4"],
  TL_SOLOMUN_ALLY_PALLY_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-g1vH9C_o-vo"],
  TL_SOLOMUN_ALLY_PALLY_2026,
);

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

assertSeedClocks(TL_MATTY_RALPH_EDC_LV_2026);
const matty = tracklist1001RowsToPlays(TL_MATTY_RALPH_EDC_LV_2026);
assert.equal(matty.length, 12);
assert.equal(matty[0]!.trackTitle, "Move That Body");
assert.equal(matty[matty.length - 1]!.trackTitle, "Under The Lights");
assert.equal(matty[5]!.timestamp, 23 * 60 + 2);
let mattyPrev = -1;
for (const p of matty) {
  assert.ok(
    p.timestamp >= mattyPrev,
    `Matty Ralph clocks must not go back @ ${p.timestamp}`,
  );
  mattyPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-FZ7pwlNdwBk"]!.length >= 12);

assertSeedClocks(TL_FUNK_TRIBU_EDC_LV_2026);
const funk = tracklist1001RowsToPlays(TL_FUNK_TRIBU_EDC_LV_2026);
assert.equal(funk.length, 10);
assert.equal(funk[0]!.trackTitle, "What Trance Feels Like");
assert.equal(funk[0]!.timestamp, 7 * 60 + 20);
assert.equal(funk[funk.length - 1]!.trackTitle, "Wicked With You");
let funkPrev = -1;
for (const p of funk) {
  assert.ok(p.timestamp > funkPrev, `Funk Tribu clocks must increase @ ${p.timestamp}`);
  funkPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-APt5j9Abwo8"]!.length >= 10);

assertSeedClocks(TL_HOLY_PRIEST_EDC_LV_2026);
const holyEdc = tracklist1001RowsToPlays(TL_HOLY_PRIEST_EDC_LV_2026);
assert.equal(holyEdc.length, 39);
assert.match(holyEdc[0]!.trackTitle!, /My Name Is/);
assert.equal(holyEdc[holyEdc.length - 1]!.trackTitle, "IN ANOTHER LIFE");
let holyPrev = -1;
for (const p of holyEdc) {
  assert.ok(
    p.timestamp >= holyPrev,
    `Holy Priest EDC clocks must not go back @ ${p.timestamp}`,
  );
  holyPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-D8eLxmifH4o"]!.length >= 39);

assertSeedClocks(TL_HOLY_PRIEST_TML_WE1_2026);
const holyTml = tracklist1001RowsToPlays(TL_HOLY_PRIEST_TML_WE1_2026);
assert.equal(holyTml.length, 45);
assert.equal(holyTml[0]!.trackTitle, "Ameno");
assert.equal(holyTml[holyTml.length - 1]!.trackTitle, "Holy Atlantis");
// No official TML Relive yet — seed held.
assert.equal(TRACKLIST_1001_BY_SOURCE_SLUG["yt-OlNdG4SCPdQ"], undefined);

assertSeedClocks(TL_ODD_MOB_TML_WE2_2026);
const oddMobTml = tracklist1001RowsToPlays(TL_ODD_MOB_TML_WE2_2026);
assert.equal(oddMobTml.length, 18);
assert.equal(oddMobTml[0]!.trackTitle, "Undeniable");
assert.match(oddMobTml[oddMobTml.length - 1]!.trackTitle!, /I Need A Miracle/);
let omTmlPrev = -1;
for (const p of oddMobTml) {
  assert.ok(
    p.timestamp >= omTmlPrev,
    `Odd Mob TML clocks must not go back @ ${p.timestamp}`,
  );
  omTmlPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-2idboK_vTT8"]!.length >= 18);

assertSeedClocks(TL_MISS_MONIQUE_TML_WE2_2026);
const missM = tracklist1001RowsToPlays(TL_MISS_MONIQUE_TML_WE2_2026);
assert.equal(missM.length, 20);
assert.equal(missM[0]!.trackTitle, "Rajada");
assert.equal(missM[missM.length - 1]!.trackTitle, "Beauty In Us");
let mmPrev = -1;
for (const p of missM) {
  assert.ok(
    p.timestamp >= mmPrev,
    `Miss Monique TML clocks must not go back @ ${p.timestamp}`,
  );
  mmPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-WhPtvotfYbc"]!.length >= 20);

assertSeedClocks(TL_ENRICO_SANGIULIANO_TML_WE2_2026);
const enrico = tracklist1001RowsToPlays(TL_ENRICO_SANGIULIANO_TML_WE2_2026);
assert.equal(enrico.length, 19);
assert.equal(enrico[0]!.trackTitle, "Escape Domo");
assert.match(enrico[enrico.length - 1]!.trackTitle!, /Techno Code/);
assert.equal(enrico[enrico.length - 1]!.timestamp, 78 * 60 + 35);
let enricoPrev = -1;
for (const p of enrico) {
  assert.ok(
    p.timestamp >= enricoPrev,
    `Enrico TML clocks must not go back @ ${p.timestamp}`,
  );
  enricoPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-ubFrkYGGqo8"]!.length >= 19);

assertSeedClocks(TL_NICKY_ROMERO_TML_WE2_2026);
const nicky = tracklist1001RowsToPlays(TL_NICKY_ROMERO_TML_WE2_2026);
assert.equal(nicky.length, 76);
assert.match(nicky[0]!.trackTitle!, /Live My Life vs\. How Deep/);
assert.equal(nicky[nicky.length - 1]!.trackTitle, "Language");
let nickyPrev = -1;
for (const p of nicky) {
  assert.ok(
    p.timestamp >= nickyPrev,
    `Nicky Romero TML clocks must not go back @ ${p.timestamp}`,
  );
  nickyPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-TsyGMhx8izw"]!.length >= 76);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-B05MAbsCOLA"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-TsyGMhx8izw"],
);

assertSeedClocks(TL_JAMES_HYPE_TML_WE2_2026);
const jhTml = tracklist1001RowsToPlays(TL_JAMES_HYPE_TML_WE2_2026);
assert.equal(jhTml.length, 35);
assert.match(jhTml[0]!.trackTitle!, /Power/);
assert.equal(jhTml[jhTml.length - 1]!.trackTitle, "Confession");
let jhPrev = -1;
for (const p of jhTml) {
  assert.ok(
    p.timestamp >= jhPrev,
    `James Hype TML clocks must not go back @ ${p.timestamp}`,
  );
  jhPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-dmhUJYEdkKo"]!.length >= 35);

assertSeedClocks(TL_JAMES_HYPE_MELKWEG_ADE_2025);
const jhMelkweg = tracklist1001RowsToPlays(TL_JAMES_HYPE_MELKWEG_ADE_2025);
assert.equal(jhMelkweg.length, 51);
assert.match(jhMelkweg[0]!.trackTitle!, /Smack My Bitch Up/);
assert.equal(jhMelkweg[jhMelkweg.length - 1]!.trackTitle, "Be Yourself");
assert.equal(jhMelkweg[jhMelkweg.length - 1]!.timestamp, 86 * 60 + 5);
let jhMkPrev = -1;
for (const p of jhMelkweg) {
  assert.ok(
    p.timestamp >= jhMkPrev,
    `James Hype Melkweg clocks must not go back @ ${p.timestamp}`,
  );
  jhMkPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-QThaqlzSqLw"]!.length >= 51);
// Distinct from TML WE2 Relive.
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-QThaqlzSqLw"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-dmhUJYEdkKo"],
);

assertSeedClocks(TL_KOLSCH_TML_WE2_2026);
const kolsch = tracklist1001RowsToPlays(TL_KOLSCH_TML_WE2_2026);
assert.equal(kolsch.length, 19);
assert.equal(kolsch[0]!.trackTitle, "Waste My Time");
assert.match(kolsch[kolsch.length - 1]!.trackTitle!, /All that Matters/i);
let kolschPrev = -1;
for (const p of kolsch) {
  assert.ok(
    p.timestamp >= kolschPrev,
    `Kölsch TML clocks must not go back @ ${p.timestamp}`,
  );
  kolschPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-ra8NYbzPMnk"]!.length >= 19);

assertSeedClocks(TL_STEVE_ANGELLO_TML_WE2_2026);
const angello = tracklist1001RowsToPlays(TL_STEVE_ANGELLO_TML_WE2_2026);
assert.equal(angello.length, 41);
assert.equal(angello[0]!.trackTitle, "Hooligans");
assert.equal(angello[angello.length - 1]!.trackTitle, "Innerbloom");
let angelloPrev = -1;
for (const p of angello) {
  assert.ok(
    p.timestamp >= angelloPrev,
    `Steve Angello TML clocks must not go back @ ${p.timestamp}`,
  );
  angelloPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-5AdQy7lCbN0"]!.length >= 41);

assertSeedClocks(TL_FISHER_TML_WE1_2026);
const fisherWe1 = tracklist1001RowsToPlays(TL_FISHER_TML_WE1_2026);
assert.equal(fisherWe1.length, 25);
assert.match(fisherWe1[0]!.trackTitle!, /It's That Time/);
assert.equal(fisherWe1[fisherWe1.length - 1]!.trackTitle, "Levels");
assert.equal(fisherWe1[fisherWe1.length - 1]!.timestamp, 55 * 60 + 49);
let fisherWe1Prev = -1;
for (const p of fisherWe1) {
  assert.ok(
    p.timestamp > fisherWe1Prev,
    `FISHER TML WE1 clocks must increase @ ${p.timestamp}`,
  );
  fisherWe1Prev = p.timestamp;
}
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-4985f9Rfxx0"],
  TL_FISHER_TML_WE1_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-Uq1WP8v3U4o"],
  TL_FISHER_TML_WE1_2026,
);

assertSeedClocks(TL_FISHER_TML_WE2_2026);
const fisher = tracklist1001RowsToPlays(TL_FISHER_TML_WE2_2026);
assert.equal(fisher.length, 17);
assert.match(fisher[0]!.trackTitle!, /It's That Time/);
assert.match(fisher[fisher.length - 1]!.trackTitle!, /World, Hold On/);
assert.equal(fisher[fisher.length - 1]!.timestamp, 77 * 60 + 25);
let fisherPrev = -1;
for (const p of fisher) {
  assert.ok(
    p.timestamp >= fisherPrev,
    `FISHER TML clocks must not go back @ ${p.timestamp}`,
  );
  fisherPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-Uq1WP8v3U4o"]!.length >= 17);

assertSeedClocks(TL_MASSANO_TML_WE2_2026);
const massanoTml = tracklist1001RowsToPlays(TL_MASSANO_TML_WE2_2026);
assert.equal(massanoTml.length, 17);
assert.equal(massanoTml[0]!.trackTitle, "Underground");
assert.equal(massanoTml[massanoTml.length - 1]!.trackTitle, "Angel In The Dark");
assert.equal(massanoTml[massanoTml.length - 1]!.timestamp, 55 * 60 + 35);
let massanoTmlPrev = -1;
for (const p of massanoTml) {
  assert.ok(
    p.timestamp > massanoTmlPrev,
    `Massano TML WE2 clocks must increase @ ${p.timestamp}`,
  );
  massanoTmlPrev = p.timestamp;
}
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-eeNljOHahxY"],
  TL_MASSANO_TML_WE2_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-fYM9DlFLwKw"],
  TL_MASSANO_TML_WE2_2026,
);

assertSeedClocks(TL_HARDWELL_TML_WE2_2026);
const hardwell = tracklist1001RowsToPlays(TL_HARDWELL_TML_WE2_2026);
assert.equal(hardwell.length, 31);
assert.equal(hardwell[0]!.trackTitle, "Believe");
assert.equal(hardwell[hardwell.length - 1]!.trackTitle, "IRIS");
let hwPrev = -1;
for (const p of hardwell) {
  assert.ok(
    p.timestamp >= hwPrev,
    `Hardwell TML clocks must not go back @ ${p.timestamp}`,
  );
  hwPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-yWZyIQtxoXU"]!.length >= 31);
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-Py-GG74lLU8"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-yWZyIQtxoXU"],
);

assertSeedClocks(TL_CHRIS_LORENZO_TML_WE2_2026);
const chrisL = tracklist1001RowsToPlays(TL_CHRIS_LORENZO_TML_WE2_2026);
assert.equal(chrisL.length, 10);
assert.match(chrisL[0]!.trackTitle!, /Appetite/);
assert.equal(chrisL[chrisL.length - 1]!.trackTitle, "House Every Weekend");
// No official Relive yet — seed held, not slug-mapped.
assert.equal(
  Object.values(TRACKLIST_1001_BY_SOURCE_SLUG).includes(
    TL_CHRIS_LORENZO_TML_WE2_2026,
  ),
  false,
);

assertSeedClocks(TL_DIMITRI_VEGAS_TML_WE2_2026);
const dvTml = tracklist1001RowsToPlays(TL_DIMITRI_VEGAS_TML_WE2_2026);
assert.equal(dvTml.length, 65);
assert.match(dvTml[0]!.trackTitle!, /Caramelle vs\. Diet Coke/);
assert.equal(dvTml[dvTml.length - 1]!.trackTitle, "Allein Allein");
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-3o0T4z6oT4Y"],
  TL_DIMITRI_VEGAS_TML_WE2_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-OTKgBZS8if0"],
  TL_DIMITRI_VEGAS_TML_WE2_2026,
);

assertSeedClocks(TL_DIMITRI_VEGAS_NICO_MORENO_TML_WE2_2026);
const dvNm = tracklist1001RowsToPlays(TL_DIMITRI_VEGAS_NICO_MORENO_TML_WE2_2026);
assert.equal(dvNm.length, 35);
assert.match(dvNm[0]!.trackTitle!, /Animals/);
assert.equal(dvNm[dvNm.length - 1]!.trackTitle, "HARDCORE SOUND");
assert.equal(dvNm[dvNm.length - 1]!.timestamp, 59 * 60 + 43);
let dvNmPrev = -1;
for (const p of dvNm) {
  assert.ok(
    p.timestamp >= dvNmPrev,
    `DV Nico Moreno TML clocks must not go back @ ${p.timestamp}`,
  );
  dvNmPrev = p.timestamp;
}
// B2B Great Library Relive — distinct from held solo Mainstage seed.
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-OTKgBZS8if0"],
  TL_DIMITRI_VEGAS_NICO_MORENO_TML_WE2_2026,
);
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-OTKgBZS8if0"],
  TL_DIMITRI_VEGAS_TML_WE2_2026,
);

assertSeedClocks(TL_CALVIN_HARRIS_TML_WE2_2026);
const calvin = tracklist1001RowsToPlays(TL_CALVIN_HARRIS_TML_WE2_2026);
assert.equal(calvin.length, 30);
assert.match(calvin[0]!.trackTitle!, /C\.U\.B\.A/);
assert.match(calvin[calvin.length - 1]!.trackTitle!, /Atom/);
assert.equal(
  Object.values(TRACKLIST_1001_BY_SOURCE_SLUG).includes(
    TL_CALVIN_HARRIS_TML_WE2_2026,
  ),
  false,
);

assertSeedClocks(TL_SONNY_FODERA_TML_WE2_2026);
const sonny = tracklist1001RowsToPlays(TL_SONNY_FODERA_TML_WE2_2026);
assert.equal(sonny.length, 16);
assert.equal(sonny[0]!.trackTitle, "Freed From Desire");
assert.match(sonny[sonny.length - 1]!.trackTitle!, /Celebration/);
assert.equal(
  Object.values(TRACKLIST_1001_BY_SOURCE_SLUG).includes(
    TL_SONNY_FODERA_TML_WE2_2026,
  ),
  false,
);

assertSeedClocks(TL_DARREN_STYLES_TML_WE2_2026);
const darrenStyles = tracklist1001RowsToPlays(TL_DARREN_STYLES_TML_WE2_2026);
assert.equal(darrenStyles.length, 33);
assert.equal(darrenStyles[0]!.trackTitle, "Be Somebody");
assert.match(darrenStyles[darrenStyles.length - 1]!.trackTitle!, /Save Me/);
// No official TML WE2 Relive yet — seed held, not slug-mapped.
assert.equal(
  Object.values(TRACKLIST_1001_BY_SOURCE_SLUG).includes(
    TL_DARREN_STYLES_TML_WE2_2026,
  ),
  false,
);

assertSeedClocks(TL_AYYBO_ODD_MOB_TML_WE2_2026);
const ayybo = tracklist1001RowsToPlays(TL_AYYBO_ODD_MOB_TML_WE2_2026);
assert.equal(ayybo.length, 30);
assert.match(ayybo[0]!.trackTitle!, /Party Time/);
assert.equal(ayybo[ayybo.length - 1]!.trackTitle, "Rock That Body");
assert.equal(ayybo[ayybo.length - 1]!.timestamp, 88 * 60 + 20);
let ayyboPrev = -1;
for (const p of ayybo) {
  assert.ok(
    p.timestamp >= ayyboPrev,
    `AYYBO Odd Mob TML clocks must not go back @ ${p.timestamp}`,
  );
  ayyboPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-gO03gfI_JF0"]!.length >= 30);

assertSeedClocks(TL_DYZEN_TML_WE2_2026);
const dyzen = tracklist1001RowsToPlays(TL_DYZEN_TML_WE2_2026);
assert.equal(dyzen.length, 4);
assert.equal(dyzen[0]!.trackTitle, "Mutant Quasars");
assert.equal(dyzen[dyzen.length - 1]!.trackTitle, "Try");
// Thin partial TL + no official Relive — held (not Dyen b2b Maddix).
assert.equal(TRACKLIST_1001_BY_SOURCE_SLUG["yt-VABm0tIRn2U"], undefined);
assert.equal(
  Object.values(TRACKLIST_1001_BY_SOURCE_SLUG).includes(TL_DYZEN_TML_WE2_2026),
  false,
);

assertSeedClocks(TL_JOHN_SUMMIT_TML_WE2_2026);
const summit = tracklist1001RowsToPlays(TL_JOHN_SUMMIT_TML_WE2_2026);
assert.equal(summit.length, 38);
assert.equal(summit[0]!.trackTitle, "Utopia");
assert.match(summit[summit.length - 1]!.trackTitle!, /Go Back/);
assert.equal(summit[summit.length - 1]!.timestamp, 115 * 60 + 35);
let summitPrev = -1;
for (const p of summit) {
  assert.ok(
    p.timestamp >= summitPrev,
    `John Summit TML clocks must not go back @ ${p.timestamp}`,
  );
  summitPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-PlArfyuzuqo"]!.length >= 38);

assertSeedClocks(TL_ARMIN_VAN_BUUREN_YT_HOUSE_TML_2026);
const arminYt = tracklist1001RowsToPlays(TL_ARMIN_VAN_BUUREN_YT_HOUSE_TML_2026);
assert.equal(arminYt.length, 7);
assert.match(arminYt[0]!.trackTitle!, /Everlasting/);
assert.match(arminYt[arminYt.length - 1]!.trackTitle!, /Blah Blah Blah/);
assert.equal(arminYt[arminYt.length - 1]!.timestamp, 11 * 60);
// Distinct from Mainstage WE2 Relive.
assert.notEqual(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-I6QA_T-BS6o"],
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-tg_QLGpes0k"],
);
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-I6QA_T-BS6o"]!.length >= 7);

assertSeedClocks(TL_KOROLOVA_TML_WE2_2026);
const korolova = tracklist1001RowsToPlays(TL_KOROLOVA_TML_WE2_2026);
assert.equal(korolova.length, 21);
assert.equal(korolova[0]!.trackTitle, "Window Shake");
assert.equal(korolova[korolova.length - 1]!.trackTitle, "Paradise");
assert.equal(korolova[korolova.length - 1]!.timestamp, 85 * 60 + 14);
let korPrev = -1;
for (const p of korolova) {
  assert.ok(
    p.timestamp >= korPrev,
    `Korolova TML clocks must not go back @ ${p.timestamp}`,
  );
  korPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-RLOghpXjuJI"]!.length >= 21);

assertSeedClocks(TL_LUCAS_STEVE_TML_WE2_2026);
const lucasSteve = tracklist1001RowsToPlays(TL_LUCAS_STEVE_TML_WE2_2026);
assert.equal(lucasSteve.length, 54);
assert.equal(lucasSteve[0]!.trackTitle, "Free Your Mind");
assert.match(lucasSteve[lucasSteve.length - 1]!.trackTitle!, /Save The World/);
assert.equal(lucasSteve[lucasSteve.length - 1]!.timestamp, 59 * 60 + 30);
let lsPrev = -1;
for (const p of lucasSteve) {
  assert.ok(
    p.timestamp >= lsPrev,
    `Lucas & Steve TML clocks must not go back @ ${p.timestamp}`,
  );
  lsPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-LE-byccuovI"]!.length >= 54);

assertSeedClocks(TL_SARA_LANDRY_TML_WE2_2026);
const saraLandry = tracklist1001RowsToPlays(TL_SARA_LANDRY_TML_WE2_2026);
assert.equal(saraLandry.length, 17);
assert.equal(saraLandry[0]!.trackTitle, "Bring It Up");
assert.equal(saraLandry[saraLandry.length - 1]!.trackTitle, "Modulation Depth");
assert.equal(saraLandry[saraLandry.length - 1]!.timestamp, 51 * 60 + 17);
let slPrev = -1;
for (const p of saraLandry) {
  assert.ok(
    p.timestamp >= slPrev,
    `Sara Landry TML clocks must not go back @ ${p.timestamp}`,
  );
  slPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-aDAWctObTvI"]!.length >= 17);

assertSeedClocks(TL_AFROJACK_R3HAB_TML_WE2_2026);
const afroR3 = tracklist1001RowsToPlays(TL_AFROJACK_R3HAB_TML_WE2_2026);
assert.equal(afroR3.length, 54);
assert.equal(afroR3[0]!.trackTitle, "Ultimate");
assert.equal(afroR3[afroR3.length - 1]!.trackTitle, "Bangduck");
assert.equal(afroR3[afroR3.length - 1]!.timestamp, 59 * 60 + 30);
let arPrev = -1;
for (const p of afroR3) {
  assert.ok(
    p.timestamp >= arPrev,
    `AFROJACK R3HAB TML clocks must not go back @ ${p.timestamp}`,
  );
  arPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-AjQeohYmg3A"]!.length >= 54);

assertSeedClocks(TL_STEVE_AOKI_TML_WE2_2026);
const aoki = tracklist1001RowsToPlays(TL_STEVE_AOKI_TML_WE2_2026);
assert.equal(aoki.length, 26);
assert.equal(aoki[0]!.trackTitle, "Pursuit Of Happiness");
assert.equal(aoki[0]!.timestamp, 20);
assert.equal(aoki[aoki.length - 1]!.trackTitle, "Miss You");
let aokiPrev = -1;
for (const p of aoki) {
  assert.ok(
    p.timestamp >= aokiPrev,
    `Steve Aoki TML clocks must not go back @ ${p.timestamp}`,
  );
  aokiPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-8-J01-hcHfA"]!.length >= 26);

assertSeedClocks(TL_CYRIL_TML_WE2_2026);
const cyril = tracklist1001RowsToPlays(TL_CYRIL_TML_WE2_2026);
assert.equal(cyril.length, 24);
assert.equal(cyril[0]!.trackTitle, "The Future");
assert.equal(cyril[0]!.timestamp, 20);
assert.match(cyril[cyril.length - 1]!.trackTitle!, /Power Of Love/);
let cyrilPrev = -1;
for (const p of cyril) {
  assert.ok(
    p.timestamp >= cyrilPrev,
    `CYRIL TML clocks must not go back @ ${p.timestamp}`,
  );
  cyrilPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-DAOlnMYA3nU"]!.length >= 24);

assertSeedClocks(TL_PUSH_TML_WE2_2026);
const pushTml = tracklist1001RowsToPlays(TL_PUSH_TML_WE2_2026);
assert.equal(pushTml.length, 16);
assert.match(pushTml[0]!.trackTitle!, /Strange World/);
assert.equal(pushTml[pushTml.length - 1]!.trackTitle, "Iguana Party");
assert.equal(pushTml[pushTml.length - 1]!.timestamp, 55 * 60 + 36);
let pushPrev = -1;
for (const p of pushTml) {
  assert.ok(
    p.timestamp >= pushPrev,
    `Push TML clocks must not go back @ ${p.timestamp}`,
  );
  pushPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-KVZlecHlVkg"]!.length >= 16);

assertSeedClocks(TL_BASSJACKERS_TML_WE2_2026);
const bassjackers = tracklist1001RowsToPlays(TL_BASSJACKERS_TML_WE2_2026);
assert.equal(bassjackers.length, 36);
assert.equal(bassjackers[0]!.trackTitle, "Rave Baby");
assert.equal(bassjackers[bassjackers.length - 1]!.trackTitle, "Forever");
assert.equal(bassjackers[bassjackers.length - 1]!.timestamp, 59 * 60 + 30);
let bjPrev = -1;
for (const p of bassjackers) {
  assert.ok(
    p.timestamp >= bjPrev,
    `Bassjackers TML clocks must not go back @ ${p.timestamp}`,
  );
  bjPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-BG3Lr9EdWVY"]!.length >= 36);

assertSeedClocks(TL_BHASKAR_TML_WE2_2026);
const bhaskar = tracklist1001RowsToPlays(TL_BHASKAR_TML_WE2_2026);
assert.equal(bhaskar.length, 17);
assert.match(bhaskar[0]!.trackTitle!, /Wonderful World/);
assert.equal(bhaskar[bhaskar.length - 1]!.trackTitle, "Celebrate Life");
assert.equal(bhaskar[bhaskar.length - 1]!.timestamp, 79 * 60);
let bhPrev = -1;
for (const p of bhaskar) {
  assert.ok(
    p.timestamp >= bhPrev,
    `Bhaskar TML clocks must not go back @ ${p.timestamp}`,
  );
  bhPrev = p.timestamp;
}
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-HWIratXF1Bo"]!.length >= 17);

assertSeedClocks(TL_ERIC_PRYDZ_ULTRA_MIAMI_2026);
const prydzUltra = tracklist1001RowsToPlays(TL_ERIC_PRYDZ_ULTRA_MIAMI_2026);
assert.equal(prydzUltra.length, 31);
assert.equal(prydzUltra[0]!.trackTitle, "Heavy");
assert.match(prydzUltra[prydzUltra.length - 1]!.trackTitle!, /Midnight City/);
assert.equal(prydzUltra[prydzUltra.length - 1]!.timestamp, 112 * 60);
let prydzPrev = -1;
for (const p of prydzUltra) {
  assert.ok(
    p.timestamp > prydzPrev,
    `Eric Prydz Ultra clocks must increase @ ${p.timestamp}`,
  );
  prydzPrev = p.timestamp;
}
assert.equal(
  TRACKLIST_1001_BY_SOURCE_SLUG["yt-hU-z3iV0LOg"],
  TL_ERIC_PRYDZ_ULTRA_MIAMI_2026,
);

assertSeedClocks(TL_DEBORAH_STREET_PARADE_2025);
const deborahSp = tracklist1001RowsToPlays(TL_DEBORAH_STREET_PARADE_2025);
assert.equal(deborahSp.length, 8);
assert.match(deborahSp[0]!.trackTitle!, /Baila/);
assert.match(deborahSp[deborahSp.length - 1]!.trackTitle!, /Bla Bla Bla/);
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-7cK7rhYXbh8"]!.length >= 8);

assertSeedClocks(TL_KEVIN_DE_VRIES_STREET_PARADE_2025);
const kevinSp = tracklist1001RowsToPlays(TL_KEVIN_DE_VRIES_STREET_PARADE_2025);
assert.equal(kevinSp.length, 21);
assert.match(kevinSp[0]!.trackTitle!, /Before You Go/);
assert.match(kevinSp[kevinSp.length - 1]!.trackTitle!, /Sex On Fire/);
assert.equal(kevinSp[0]!.timestamp, 0);
assert.ok(kevinSp[kevinSp.length - 1]!.timestamp < 2 * 3600);
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-S5qAspu0AbI"]!.length >= 21);

assertSeedClocks(TL_KOLSCH_STREET_PARADE_2025);
const kolschSp = tracklist1001RowsToPlays(TL_KOLSCH_STREET_PARADE_2025);
assert.equal(kolschSp.length, 24);
assert.equal(kolschSp[0]!.trackTitle, "Summersault");
assert.equal(kolschSp[kolschSp.length - 1]!.trackTitle, "3 Tage Wach");
assert.ok(kolschSp[kolschSp.length - 1]!.timestamp < 2 * 3600);
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-pLldXE5OyCM"]!.length >= 24);

assertSeedClocks(TL_MASSANO_STREET_PARADE_2025);
const massanoSp = tracklist1001RowsToPlays(TL_MASSANO_STREET_PARADE_2025);
assert.equal(massanoSp.length, 23);
assert.equal(massanoSp[0]!.trackTitle, "Higher");
assert.equal(massanoSp[massanoSp.length - 1]!.trackTitle, "Afterglow");
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-fYM9DlFLwKw"]!.length >= 23);

assertSeedClocks(TL_ADIEL_STREET_PARADE_2025);
const adielSp = tracklist1001RowsToPlays(TL_ADIEL_STREET_PARADE_2025);
assert.equal(adielSp.length, 13);
assert.match(adielSp[0]!.trackTitle!, /010x/);
assert.equal(adielSp[adielSp.length - 1]!.trackTitle, "Nightride");
assert.ok(TRACKLIST_1001_BY_SOURCE_SLUG["yt-tuqAdrbkYZk"]!.length >= 13);

console.log("tracklists1001/seeds.test.ts ok");
