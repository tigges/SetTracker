import assert from "node:assert/strict";
import {
  firstExportDisplayLine,
  planBeatportLaunch,
  planRekordboxLaunch,
  planSpotifyLaunch,
} from "./exportLaunch";
import type { ExportPlay } from "./playlistExport";

const plays: ExportPlay[] = [
  {
    position: 1,
    timestamp: 0,
    title: "Pressure",
    artistName: "AC Slater",
    bpm: 128,
    musicalKey: "A min",
    trackDurationSec: 360,
    beatportUrl: "https://www.beatport.com/track/pressure/1",
    spotifyUrl: "https://open.spotify.com/track/2ISSQPb9LHHiV6ng2NXosL",
    isrc: "GBXXXX0000001",
    mixName: "Extended Mix",
    idStatus: "identified",
  },
  {
    position: 2,
    timestamp: 125,
    title: "ID",
    artistName: null,
    bpm: null,
    musicalKey: null,
    trackDurationSec: null,
    beatportUrl: null,
    spotifyUrl: null,
    isrc: null,
    mixName: null,
    idStatus: "unresolved_id",
  },
  {
    position: 3,
    timestamp: 400,
    title: "Rave",
    artistName: "Biscits",
    bpm: null,
    musicalKey: null,
    trackDurationSec: null,
    beatportUrl: "https://www.beatport.com/search/tracks?q=Rave",
    spotifyUrl: null,
    isrc: null,
    mixName: null,
    idStatus: "community_resolved",
  },
];

const meta = { title: "Test Set", slug: "test-set", artistLine: "AC Slater" };

const rb = planRekordboxLaunch(plays, meta);
assert.equal(rb.disabled, false);
assert.equal(rb.openHref, null);
assert.equal(rb.protocolHref, null);
assert.ok(rb.download?.filename.endsWith(".m3u8"));
assert.ok(rb.download?.body.includes("#EXTM3U"));
assert.ok(rb.download?.body.includes("AC Slater - Pressure"));
assert.ok(rb.hint.includes("Import Playlist"));

const sp = planSpotifyLaunch(plays, meta);
assert.equal(sp.disabled, false);
assert.equal(
  sp.openHref,
  "https://open.spotify.com/track/2ISSQPb9LHHiV6ng2NXosL",
);
assert.equal(sp.protocolHref, "spotify:track:2ISSQPb9LHHiV6ng2NXosL");
assert.ok(sp.clipboard.includes("spotify:track:2ISSQPb9LHHiV6ng2NXosL"));
assert.ok(sp.hint.includes("paste"));

const noIds: ExportPlay[] = [
  {
    ...plays[0]!,
    spotifyUrl: null,
    beatportUrl: null,
  },
];
const spSearch = planSpotifyLaunch(noIds, meta);
assert.equal(spSearch.protocolHref, null);
assert.ok(spSearch.openHref?.startsWith("https://open.spotify.com/search/"));
assert.ok(spSearch.openHref?.includes("AC"));
assert.ok(spSearch.clipboard.includes("AC Slater - Pressure"));
assert.ok(spSearch.hint.includes("search"));

const bp = planBeatportLaunch(plays);
assert.equal(bp.disabled, false);
assert.equal(bp.openHref, "https://www.beatport.com/track/pressure/1");
assert.ok(bp.clipboard.includes("/track/pressure/1"));
assert.ok(!bp.clipboard.includes("beatport.com/search"));

const bpNone = planBeatportLaunch(noIds);
assert.equal(bpNone.disabled, true);
assert.equal(bpNone.openHref, null);

assert.equal(firstExportDisplayLine(plays), "AC Slater - Pressure");

const empty = planRekordboxLaunch([], meta);
assert.equal(empty.disabled, true);
assert.equal(empty.download, undefined);

console.log("exportLaunch.test.ts ok");
