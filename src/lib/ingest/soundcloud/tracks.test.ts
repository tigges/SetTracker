import assert from "node:assert/strict";
import { slugify } from "../types";
import { SOUNDCLOUD_TRACK_SEEDS } from "./tracks";

assert.ok(SOUNDCLOUD_TRACK_SEEDS.length >= 2);

const chapter = SOUNDCLOUD_TRACK_SEEDS.filter(
  (s) => s.primaryArtist.name === "Chapter & Verse",
);
assert.equal(chapter.length, 2);
for (const s of chapter) {
  assert.ok(s.url.startsWith("https://soundcloud.com/"));
  assert.ok((s.minDurationSec ?? 0) >= 15 * 60);
}

const sidepiece = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) => s.url === "https://soundcloud.com/sidepiece/sidepiece-lollapalooza-perry",
);
assert.ok(sidepiece);
assert.equal(sidepiece.primaryArtist.name, "SIDEPIECE");
assert.equal(sidepiece.type, "festival");
assert.equal(
  `sc-sidepiece-${slugify("sidepiece-lollapalooza-perry")}`,
  "sc-sidepiece-sidepiece-lollapalooza-perry",
);

const notionPerrySc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) =>
    s.url === "https://soundcloud.com/notiondj/notion-live-at-lollapalooza",
);
assert.ok(notionPerrySc);
assert.equal(notionPerrySc.primaryArtist.name, "NOTION");
assert.equal(notionPerrySc.type, "festival");
assert.equal(
  `sc-notiondj-${slugify("notion-live-at-lollapalooza")}`,
  "sc-notiondj-notion-live-at-lollapalooza",
);

const horgerTml = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) =>
    s.url === "https://soundcloud.com/marten-horger/tomorrowland-mainstage-2023",
);
assert.ok(horgerTml);
assert.equal(horgerTml.primaryArtist.name, "Marten Horger");
assert.equal(horgerTml.type, "festival");
assert.equal(
  `sc-marten-horger-${slugify("tomorrowland-mainstage-2023")}`,
  "sc-marten-horger-tomorrowland-mainstage-2023",
);

const menMachineSc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) =>
    s.url ===
    "https://soundcloud.com/1001tracklists/men-machine-exclusive-mix-2026",
);
assert.ok(menMachineSc);
assert.equal(menMachineSc.primaryArtist.name, "Men Machine");
assert.equal(menMachineSc.type, "mix");
assert.equal(
  `sc-1001tracklists-${slugify("men-machine-exclusive-mix-2026")}`,
  "sc-1001tracklists-men-machine-exclusive-mix-2026",
);

const domCreamSc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) =>
    s.url ===
    "https://soundcloud.com/domdolla/dom-dolla-live-creamfields-steel-yard-2025",
);
assert.ok(domCreamSc);
assert.equal(domCreamSc.primaryArtist.name, "Dom Dolla");
assert.equal(domCreamSc.type, "festival");
assert.equal(
  `sc-domdolla-${slugify("dom-dolla-live-creamfields-steel-yard-2025")}`,
  "sc-domdolla-dom-dolla-live-creamfields-steel-yard-2025",
);

const gdjbSc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) => s.url === "https://soundcloud.com/markusschulz/gdjb-aug132026",
);
assert.ok(gdjbSc);
assert.equal(gdjbSc.primaryArtist.name, "Markus Schulz");
assert.equal(gdjbSc.type, "radio");
assert.equal(gdjbSc.seriesName, "Global DJ Broadcast"); // pragma: allowlist secret
assert.equal(
  `sc-markusschulz-${slugify("gdjb-aug132026")}`,
  "sc-markusschulz-gdjb-aug132026",
);

const hoa527Sc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) =>
    s.url === "https://soundcloud.com/hardwell/hardwell-on-air-527-yearmix",
);
assert.ok(hoa527Sc);
assert.equal(hoa527Sc.primaryArtist.name, "Hardwell");
assert.equal(hoa527Sc.type, "radio");
assert.equal(hoa527Sc.seriesName, "Hardwell On Air");
assert.equal(
  `sc-hardwell-${slugify("hardwell-on-air-527-yearmix")}`,
  "sc-hardwell-hardwell-on-air-527-yearmix",
);

const sth687Sc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) =>
    s.url ===
    "https://soundcloud.com/dimitrivegasandlikemike/smash-the-house-radio-ep-687",
);
assert.ok(sth687Sc);
assert.equal(sth687Sc.primaryArtist.name, "Dimitri Vegas & Like Mike");
assert.equal(sth687Sc.type, "radio");
assert.equal(sth687Sc.seriesName, "Smash The House Radio");
assert.equal(
  `sc-dimitrivegasandlikemike-${slugify("smash-the-house-radio-ep-687")}`,
  "sc-dimitrivegasandlikemike-smash-the-house-radio-ep-687",
);

const hrr225Sc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) => s.url === "https://soundcloud.com/jamie-jones/hot-robot-radio-225",
);
assert.ok(hrr225Sc);
assert.equal(hrr225Sc.primaryArtist.name, "Jamie Jones");
assert.equal(hrr225Sc.type, "radio");
assert.equal(hrr225Sc.seriesName, "Hot Robot Radio");
assert.equal(
  `sc-jamie-jones-${slugify("hot-robot-radio-225")}`,
  "sc-jamie-jones-hot-robot-radio-225",
);

const hrr239Sc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) => s.url === "https://soundcloud.com/jamie-jones/hot-robot-radio-239",
);
assert.ok(hrr239Sc);
assert.equal(hrr239Sc.primaryArtist.name, "Jamie Jones");
assert.equal(hrr239Sc.type, "radio");
assert.equal(
  `sc-jamie-jones-${slugify("hot-robot-radio-239")}`,
  "sc-jamie-jones-hot-robot-radio-239",
);

const arodesSc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) =>
    s.url ===
    "https://soundcloud.com/vintageculturemusic/vintage-culture-b2b-arodes-at-burning-man-2024",
);
assert.ok(arodesSc);
assert.equal(arodesSc.primaryArtist.name, "Vintage Culture");
assert.equal(arodesSc.type, "festival");
assert.equal(
  `sc-vintageculturemusic-${slugify("vintage-culture-b2b-arodes-at-burning-man-2024")}`,
  "sc-vintageculturemusic-vintage-culture-b2b-arodes-at-burning-man-2024",
);

const sashaEclipseSc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) =>
    s.url === "https://soundcloud.com/sashaofficial/sasha-eclipse-mix-12-8-26",
);
assert.ok(sashaEclipseSc);
assert.equal(sashaEclipseSc.primaryArtist.name, "Sasha");
assert.equal(sashaEclipseSc.type, "mix");
assert.equal(sashaEclipseSc.seriesName, "Eclipse Mix");
assert.equal(
  `sc-sashaofficial-${slugify("sasha-eclipse-mix-12-8-26")}`,
  "sc-sashaofficial-sasha-eclipse-mix-12-8-26",
);

const joelEdgeSc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) => s.url === "https://soundcloud.com/joelcorry/edgenyc",
);
assert.ok(joelEdgeSc);
assert.equal(joelEdgeSc.primaryArtist.name, "Joel Corry");
assert.equal(joelEdgeSc.type, "festival");
assert.equal(
  `sc-joelcorry-${slugify("edgenyc")}`,
  "sc-joelcorry-edgenyc",
);

const maxStylerOtSc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) =>
    s.url ===
    "https://soundcloud.com/maxstyler/max-styler-live-opulent-temple-burning-man-2024",
);
assert.ok(maxStylerOtSc);
assert.equal(maxStylerOtSc.primaryArtist.name, "Max Styler");
assert.equal(maxStylerOtSc.type, "festival");
assert.equal(
  `sc-maxstyler-${slugify("max-styler-live-opulent-temple-burning-man-2024")}`,
  "sc-maxstyler-max-styler-live-opulent-temple-burning-man-2024",
);

const hannahCfSc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) =>
    s.url ===
    "https://soundcloud.com/hannahlaingdj/hannah-laing-creamfields-2024-audio",
);
assert.ok(hannahCfSc);
assert.equal(hannahCfSc.primaryArtist.name, "Hannah Laing");
assert.equal(hannahCfSc.type, "festival");
assert.equal(
  `sc-hannahlaingdj-${slugify("hannah-laing-creamfields-2024-audio")}`,
  "sc-hannahlaingdj-hannah-laing-creamfields-2024-audio",
);

const purified520Sc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) => s.url === "https://soundcloud.com/noraenpure/purified-520",
);
assert.ok(purified520Sc);
assert.equal(purified520Sc.primaryArtist.name, "Nora En Pure");
assert.equal(purified520Sc.type, "radio");
assert.equal(purified520Sc.seriesName, "Purified Radio");
assert.equal(
  `sc-noraenpure-${slugify("purified-520")}`,
  "sc-noraenpure-purified-520",
);

const captive098Sc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) =>
    s.url === "https://soundcloud.com/korolovadj/korolova-captive-soul-98",
);
assert.ok(captive098Sc);
assert.equal(captive098Sc.primaryArtist.name, "Korolova");
assert.equal(captive098Sc.type, "radio");
assert.equal(captive098Sc.seriesName, "Captive Soul");
assert.equal(
  `sc-korolovadj-${slugify("korolova-captive-soul-98")}`,
  "sc-korolovadj-korolova-captive-soul-98",
);

const hypeSyncSc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) =>
    s.url === "https://soundcloud.com/jameshypethedj/sync-london-full-set",
);
assert.ok(hypeSyncSc);
assert.equal(hypeSyncSc.primaryArtist.name, "James Hype");
assert.equal(hypeSyncSc.type, "festival");
assert.equal(
  `sc-jameshypethedj-${slugify("sync-london-full-set")}`,
  "sc-jameshypethedj-sync-london-full-set",
);

const epic036Sc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) =>
    s.url ===
    "https://soundcloud.com/eric-prydz/eric-prydz-presents-463760700",
);
assert.ok(epic036Sc);
assert.equal(epic036Sc.primaryArtist.name, "Eric Prydz");
assert.equal(epic036Sc.type, "radio");
assert.equal(epic036Sc.seriesName, "Epic Radio");
assert.equal(
  `sc-eric-prydz-${slugify("eric-prydz-presents-463760700")}`,
  "sc-eric-prydz-eric-prydz-presents-463760700",
);

const bradeazyLollaSc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) =>
    s.url === "https://soundcloud.com/bradeazy/bradeazy-live-lollapalooza",
);
assert.ok(bradeazyLollaSc);
assert.equal(bradeazyLollaSc.primaryArtist.name, "bradeazy");
assert.equal(bradeazyLollaSc.type, "festival");
assert.equal(
  `sc-bradeazy-${slugify("bradeazy-live-lollapalooza")}`,
  "sc-bradeazy-bradeazy-live-lollapalooza",
);

const amelie022Sc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) =>
    s.url ===
    "https://soundcloud.com/amelielens/amelie-lens-radio-show-022",
);
assert.ok(amelie022Sc);
assert.equal(amelie022Sc.primaryArtist.name, "Amelie Lens");
assert.equal(amelie022Sc.type, "radio");
assert.equal(amelie022Sc.seriesName, "Amelie Lens Radio Show");
assert.equal(
  `sc-amelielens-${slugify("amelie-lens-radio-show-022")}`,
  "sc-amelielens-amelie-lens-radio-show-022",
);

const fifiKmSc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) =>
    s.url ===
    "https://soundcloud.com/keinemusik/keinemusik-radio-show-by-fifi-07082026",
);
assert.ok(fifiKmSc);
assert.equal(fifiKmSc.primaryArtist.name, "FIFI");
assert.equal(fifiKmSc.type, "radio");
assert.equal(fifiKmSc.seriesName, "Keinemusik Radio");
assert.equal(fifiKmSc.fingerprintPlays?.length, 11);
assert.equal(fifiKmSc.fingerprintPlays?.[0]?.artist, "Don Carlos, Kim Mazelle");
assert.equal(fifiKmSc.fingerprintPlays?.at(-1)?.title, "Se Eu Cantar");
assert.equal(
  `sc-keinemusik-${slugify("keinemusik-radio-show-by-fifi-07082026")}`,
  "sc-keinemusik-keinemusik-radio-show-by-fifi-07082026",
);

const heldensDaybreakSc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) =>
    s.url ===
    "https://soundcloud.com/oliverheldens/oliver-heldens-daybreak-session-tomorrowland-weekend-1-2024",
);
assert.ok(heldensDaybreakSc);
assert.equal(heldensDaybreakSc.primaryArtist.name, "Oliver Heldens");
assert.equal(heldensDaybreakSc.type, "festival");
assert.equal(
  `sc-oliverheldens-${slugify("oliver-heldens-daybreak-session-tomorrowland-weekend-1-2024")}`,
  "sc-oliverheldens-oliver-heldens-daybreak-session-tomorrowland-weekend-1-2024",
);

const mandyMondaysSc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) =>
    s.url ===
    "https://soundcloud.com/tomorrowland/mandy-mondays-august-2026",
);
assert.ok(mandyMondaysSc);
assert.equal(mandyMondaysSc.primaryArtist.name, "MANDY");
assert.equal(mandyMondaysSc.type, "radio");
assert.equal(mandyMondaysSc.seriesName, "MANDY Mondays");
assert.equal(
  `sc-tomorrowland-${slugify("mandy-mondays-august-2026")}`,
  "sc-tomorrowland-mandy-mondays-august-2026",
);

const dfmMashupSc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) =>
    s.url ===
    "https://soundcloud.com/tomorrowland/mash-up-universe-djs-from-mars-august-2026",
);
assert.ok(dfmMashupSc);
assert.equal(dfmMashupSc.primaryArtist.name, "DJs From Mars");
assert.equal(dfmMashupSc.type, "radio");
assert.equal(dfmMashupSc.seriesName, "Mash-Up Universe");
assert.equal(
  `sc-tomorrowland-${slugify("mash-up-universe-djs-from-mars-august-2026")}`,
  "sc-tomorrowland-mash-up-universe-djs-from-mars-august-2026",
);

const tapeBCt5Sc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) =>
    s.url === "https://soundcloud.com/tape-b-official/tape-b-cartunes-vol-5",
);
assert.ok(tapeBCt5Sc);
assert.equal(tapeBCt5Sc.primaryArtist.name, "Tape B");
assert.equal(tapeBCt5Sc.type, "mix");
assert.equal(tapeBCt5Sc.seriesName, "CarTunes");
assert.equal(
  `sc-tape-b-official-${slugify("tape-b-cartunes-vol-5")}`,
  "sc-tape-b-official-tape-b-cartunes-vol-5",
);

const mauPXxxSc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) => s.url === "https://soundcloud.com/realmaup/xxx-radio-201",
);
assert.ok(mauPXxxSc);
assert.equal(mauPXxxSc.primaryArtist.name, "Mau P");
assert.equal(mauPXxxSc.type, "radio");
assert.equal(mauPXxxSc.seriesName, "XXX Radio");
assert.equal(
  `sc-realmaup-${slugify("xxx-radio-201")}`,
  "sc-realmaup-xxx-radio-201",
);
assert.equal(
  SOUNDCLOUD_TRACK_SEEDS.some((s) => s.url.startsWith("sc-https://")),
  false,
);

const vcRobotSc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) =>
    s.url ===
    "https://soundcloud.com/vintageculturemusic/vintage-culture-robot-heart-residency-2024-california",
);
assert.ok(vcRobotSc);
assert.equal(vcRobotSc.primaryArtist.name, "Vintage Culture");
assert.equal(vcRobotSc.type, "festival");
assert.equal(vcRobotSc.seriesName, "Robot Heart");
assert.equal(
  `sc-vintageculturemusic-${slugify("vintage-culture-robot-heart-residency-2024-california")}`,
  "sc-vintageculturemusic-vintage-culture-robot-heart-residency-2024-california",
);

const clapcast576Sc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) => s.url === "https://soundcloud.com/claptone/clapcast-576",
);
assert.ok(clapcast576Sc);
assert.equal(clapcast576Sc.primaryArtist.name, "Claptone");
assert.equal(clapcast576Sc.type, "radio");
assert.equal(clapcast576Sc.seriesName, "Clapcast");
assert.equal(
  `sc-claptone-${slugify("clapcast-576")}`,
  "sc-claptone-clapcast-576",
);

const brandonPvSc = SOUNDCLOUD_TRACK_SEEDS.find(
  (s) =>
    s.url ===
    "https://soundcloud.com/brandonsounds/brandon-live-at-parookaville-2024-desert-valley",
);
assert.ok(brandonPvSc);
assert.equal(brandonPvSc.primaryArtist.name, "BRANDON");
assert.equal(brandonPvSc.type, "festival");
assert.equal(brandonPvSc.seriesName, "Parookaville");
assert.equal(
  `sc-brandonsounds-${slugify("brandon-live-at-parookaville-2024-desert-valley")}`,
  "sc-brandonsounds-brandon-live-at-parookaville-2024-desert-valley",
);
assert.equal(
  SOUNDCLOUD_TRACK_SEEDS.some((s) =>
    s.url.startsWith("sc-https://"),
  ),
  false,
);

console.log("soundcloud/tracks.test.ts ok");
