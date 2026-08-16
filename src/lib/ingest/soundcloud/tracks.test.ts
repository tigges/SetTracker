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

console.log("soundcloud/tracks.test.ts ok");
