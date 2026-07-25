import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
const now = new Date();
function daysAgo(n: number, hour = 18): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d;
}
function hms(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((v) => String(v).padStart(2, "0")).join(":");
}

// A tracklist entry describes one Played edge.
type Prov = "1001tl" | "soundcloud" | "fingerprint" | "community";
type Entry =
  | { kind: "id"; track: string; prov: Prov }
  | { kind: "unid"; label: string; suspected?: string; note?: string; prov: Prov }
  | { kind: "res"; label: string; track: string; prov: Prov }
  | { kind: "raw"; text: string; prov: Prov };

const id = (track: string, prov: Prov = "1001tl"): Entry => ({ kind: "id", track, prov });
const unid = (label: string, prov: Prov = "1001tl", suspected?: string, note?: string): Entry => ({
  kind: "unid",
  label,
  suspected,
  note,
  prov,
});
const res = (label: string, track: string, prov: Prov = "community"): Entry => ({
  kind: "res",
  label,
  track,
  prov,
});
const raw = (text: string, prov: Prov = "soundcloud"): Entry => ({ kind: "raw", text, prov });

async function main() {
  console.log("Resetting database...");
  await prisma.played.deleteMany();
  await prisma.setArtist.deleteMany();
  await prisma.set.deleteMany();
  await prisma.idTrack.deleteMany();
  await prisma.track.deleteMany();
  await prisma.series.deleteMany();
  await prisma.event.deleteMany();
  await prisma.dj.deleteMany();
  await prisma.label.deleteMany();

  // -------------------------------------------------------------------------
  // Labels
  // -------------------------------------------------------------------------
  const labelData = [
    ["nightbass", "Night Bass", "#f5a623"],
    ["confession", "Confession", "#e0338a"],
    ["blackbook", "Black Book Records", "#d7dde2"],
    ["divided", "Divided Souls", "#4bd0c0"],
    ["bitbird", "bitbird", "#7c5cff"],
    ["monstercat", "Monstercat", "#2bd67b"],
    ["houseofhustle", "House of Hustle", "#ff6b3d"],
    ["insomniac", "Insomniac Records", "#ff2d55"],
  ];
  const labels: Record<string, string> = {};
  for (const [slug, name, color] of labelData) {
    const l = await prisma.label.create({ data: { slug, name, color } });
    labels[slug] = l.id;
  }

  // -------------------------------------------------------------------------
  // DJs
  // -------------------------------------------------------------------------
  const djData = [
    ["marten-horger", "Marten Hörger", "Berlin, DE", "#ff7a1a", "German producer bending tech house into hard-hitting bass grooves."],
    ["ac-slater", "AC Slater", "Los Angeles, US", "#f5a623", "Night Bass founder and the definitional voice of modern bass house."],
    ["chris-lake", "Chris Lake", "Los Angeles, US", "#d7dde2", "Black Book Records boss steering peak-time house."],
    ["tchami", "Tchami", "Paris, FR", "#e0338a", "Future house pioneer and Confession label head."],
    ["bradeazy", "bradeazy", "Atlanta, US", "#34e0c4", "Bass-forward selector splicing house, garage and dubstep."],
    ["wax-motif", "Wax Motif", "Los Angeles, US", "#ffcf40", "Divided Souls founder with a G-house pedigree."],
    ["malaa", "Malaa", "Paris, FR", "#8a8f98", "Masked Confession affiliate dealing in dark house."],
    ["habstrakt", "Habstrakt", "Lyon, FR", "#6a5cff", "French producer straddling bass house and dubstep."],
    ["jauz", "Jauz", "Los Angeles, US", "#ff3b6b", "Bite This! captain fusing bass house and riddim."],
    ["dombresky", "Dombresky", "Marseille, FR", "#ff6b3d", "French house energy with a festival gloss."],
    ["cid", "CID", "New York, US", "#4bd0c0", "House of Hustle founder, Grammy-winning house selector."],
    ["volac", "Volac", "Moscow, RU", "#b06bff", "Russian duo delivering relentless tech-tinged bass house."],
    ["bijou", "BIJOU", "Phoenix, US", "#ff2d7e", "G-house purveyor and Do Not Duplicate boss."],
    ["westend", "Westend", "Nashville, US", "#2bd67b", "Tech house rising through Insomniac and bitbird."],
    ["vnssa", "VNSSA", "Los Angeles, US", "#ff9f1c", "Night Bass mainstay pushing raw house and bass."],
    ["cause-affect", "Cause & Affect", "Vancouver, CA", "#1ec8e0", "Canadian duo bridging bass house and UK garage."],
  ];
  const djs: Record<string, string> = {};
  for (const [slug, name, homeCity, accent, bio] of djData) {
    const d = await prisma.dj.create({ data: { slug, name, homeCity, accent, bio } });
    djs[slug] = d.id;
  }

  // -------------------------------------------------------------------------
  // Events
  // -------------------------------------------------------------------------
  const eventData = [
    ["edc-lv", "EDC Las Vegas", "festival", "Las Vegas Motor Speedway"],
    ["ultra-miami", "Ultra Music Festival", "festival", "Bayfront Park, Miami"],
    ["hard-summer", "HARD Summer", "festival", "Hollywood Park, Los Angeles"],
    ["coachella", "Coachella", "festival", "Empire Polo Club, Indio"],
    ["lollapalooza", "Lollapalooza", "festival", "Grant Park, Chicago"],
    ["brooklyn-mirage", "The Brooklyn Mirage", "club", "Brooklyn, New York"],
  ];
  const events: Record<string, string> = {};
  for (const [slug, name, kind, location] of eventData) {
    const e = await prisma.event.create({ data: { slug, name, kind, location } });
    events[slug] = e.id;
  }

  // -------------------------------------------------------------------------
  // Series (radio shows)
  // -------------------------------------------------------------------------
  const seriesData = [
    ["nightbass-radio", "Night Bass Radio", "ac-slater"],
    ["confession-radio", "Confession Radio", "tchami"],
    ["horg-zone", "The HÖRG Zone", "marten-horger"],
    ["bradeazy-radio", "bradeazy & friends", "bradeazy"],
    ["blackbook-radio", "Black Book Radio", "chris-lake"],
  ];
  const series: Record<string, string> = {};
  for (const [slug, name, dj] of seriesData) {
    const s = await prisma.series.create({ data: { slug, name, djId: djs[dj] } });
    series[slug] = s.id;
  }

  // -------------------------------------------------------------------------
  // Track pool (reused across sets so "most-played" is meaningful)
  // -------------------------------------------------------------------------
  const trackData: [string, string, string, string | null, number][] = [
    ["lose-my-mind", "Lose My Mind", "Marten Hörger, Nelson", "nightbass", 126],
    ["turn-it-up", "Turn It Up", "AC Slater", "nightbass", 128],
    ["deceiver", "Deceiver", "Chris Lake, Green Velvet", "blackbook", 126],
    ["prophecy", "Prophecy", "Tchami", "confession", 125],
    ["feel-your-love", "Feel Your Love", "Dombresky", "confession", 124],
    ["ratchet", "Ratchet", "Wax Motif", "divided", 125],
    ["notorious", "Notorious", "Malaa", "confession", 126],
    ["higher-ground", "Higher Ground", "Habstrakt", "monstercat", 128],
    ["get-down", "Get Down", "Jauz", "insomniac", 126],
    ["shake-it", "Shake It", "CID", "houseofhustle", 125],
    ["rave-tool", "Rave Tool", "Volac", null, 127],
    ["juke", "Juke", "BIJOU", "nightbass", 128],
    ["bass-jam", "Bass Jam", "Westend", "bitbird", 125],
    ["roll-with-it", "Roll With It", "VNSSA", "nightbass", 126],
    ["pressure", "Pressure", "Cause & Affect", null, 128],
    ["turbulence", "Turbulence", "Marten Hörger", null, 128],
    ["work", "Work", "AC Slater, Chris Lorenzo", "nightbass", 128],
    ["all-night", "All Night", "Chris Lake", "blackbook", 125],
    ["ride", "Ride", "Tchami, Malaa", "confession", 125],
    ["drop-it", "Drop It", "bradeazy", null, 130],
    ["warehouse", "Warehouse", "bradeazy", "houseofhustle", 128],
    ["neon", "Neon", "Dombresky", null, 124],
    ["gravity", "Gravity", "Habstrakt", "monstercat", 128],
    ["vibrate", "Vibrate", "Wax Motif, Neoteric", "divided", 125],
    ["overdrive", "Overdrive", "Jauz", "insomniac", 126],
    ["midnight", "Midnight", "CID", null, 124],
    ["serotonin", "Serotonin", "Volac", null, 127],
    ["flex", "Flex", "BIJOU", null, 128],
    ["moonwalk", "Moonwalk", "Westend", "bitbird", 122],
    ["tunnel", "Tunnel", "VNSSA", null, 126],
    ["static", "Static", "Cause & Affect", null, 130],
    ["pulse", "Pulse", "Marten Hörger", null, 127],
    ["lowkey", "Lowkey", "Malaa", null, 125],
    ["afterdark", "After Dark", "Chris Lake, Aatig", "blackbook", 126],
    ["glow", "Glow", "Tchami, Marten Hörger", "confession", 126],
  ];
  const tracks: Record<string, string> = {};
  for (const [slug, title, artistName, labelSlug, bpm] of trackData) {
    const t = await prisma.track.create({
      data: {
        title,
        artistName,
        bpm,
        labelId: labelSlug ? labels[labelSlug] : null,
      },
    });
    tracks[slug] = t.id;
  }

  // -------------------------------------------------------------------------
  // Sets + plays
  // -------------------------------------------------------------------------
  type SetDef = {
    slug: string;
    title: string;
    type: "radio" | "festival" | "soundcloud";
    primary: string;
    collaborators?: string[];
    event?: string;
    series?: string;
    daysAgo: number;
    durationSec: number;
    source: string;
    sourceUrl?: string;
    cover: string;
    tracklist: Entry[];
  };

  const setDefs: SetDef[] = [
    // ------------------------------ RADIO EPISODES ------------------------------
    {
      slug: "night-bass-radio-201",
      title: "Night Bass Radio 201",
      type: "radio",
      primary: "ac-slater",
      series: "nightbass-radio",
      daysAgo: 2,
      durationSec: 3600,
      source: "1001Tracklists",
      cover: "#f5a623",
      tracklist: [
        id("turn-it-up"),
        id("roll-with-it"),
        id("juke"),
        unid("AC Slater - ID", "1001tl", "AC Slater", "Forthcoming Night Bass"),
        id("work"),
        res("ID - ID", "flex", "community"),
        id("ratchet"),
        raw("AC Slater b2b VNSSA - unreleased edit", "1001tl"),
        id("pressure"),
        id("turn-it-up", "fingerprint"),
      ],
    },
    {
      slug: "confession-radio-118",
      title: "Confession Radio 118",
      type: "radio",
      primary: "tchami",
      series: "confession-radio",
      daysAgo: 4,
      durationSec: 3600,
      source: "1001Tracklists",
      cover: "#e0338a",
      tracklist: [
        id("prophecy"),
        id("ride"),
        id("notorious"),
        unid("Tchami - ID", "1001tl", "Tchami"),
        id("feel-your-love"),
        res("Malaa - ID", "lowkey", "community"),
        id("glow"),
        unid("ID - ID", "community", undefined, "Huge unreleased Confession cut"),
        id("neon"),
        id("prophecy", "fingerprint"),
      ],
    },
    {
      slug: "horg-zone-045",
      title: "The HÖRG Zone 045",
      type: "radio",
      primary: "marten-horger",
      series: "horg-zone",
      daysAgo: 6,
      durationSec: 3600,
      source: "1001Tracklists",
      cover: "#ff7a1a",
      tracklist: [
        id("turbulence"),
        id("lose-my-mind"),
        id("pulse"),
        unid("Marten Hörger - ID", "1001tl", "Marten Hörger"),
        id("glow"),
        res("ID - ID", "vibrate", "community"),
        id("ratchet"),
        raw("Marten Hörger - VIP edit (rip)", "1001tl"),
        id("turbulence", "fingerprint"),
      ],
    },
    {
      slug: "bradeazy-friends-022",
      title: "bradeazy & friends 022",
      type: "radio",
      primary: "bradeazy",
      series: "bradeazy-radio",
      daysAgo: 9,
      durationSec: 3600,
      source: "1001Tracklists",
      cover: "#34e0c4",
      tracklist: [
        id("drop-it"),
        id("warehouse"),
        unid("bradeazy - ID", "1001tl", "bradeazy"),
        id("get-down"),
        res("ID - ID", "static", "community"),
        id("bass-jam"),
        raw("bradeazy - garage flip (unreleased)", "soundcloud"),
        id("drop-it", "fingerprint"),
      ],
    },
    {
      slug: "black-book-radio-030",
      title: "Black Book Radio 030",
      type: "radio",
      primary: "chris-lake",
      series: "blackbook-radio",
      daysAgo: 12,
      durationSec: 3600,
      source: "1001Tracklists",
      cover: "#d7dde2",
      tracklist: [
        id("deceiver"),
        id("all-night"),
        id("afterdark"),
        unid("Chris Lake - ID", "1001tl", "Chris Lake"),
        id("shake-it"),
        res("ID - ID", "midnight", "community"),
        id("deceiver", "fingerprint"),
        raw("Chris Lake & ? - ID (Black Book)", "1001tl"),
      ],
    },
    {
      slug: "night-bass-radio-200",
      title: "Night Bass Radio 200",
      type: "radio",
      primary: "ac-slater",
      collaborators: ["vnssa"],
      series: "nightbass-radio",
      daysAgo: 16,
      durationSec: 3600,
      source: "1001Tracklists",
      cover: "#f5a623",
      tracklist: [
        id("turn-it-up"),
        id("tunnel"),
        id("juke"),
        id("roll-with-it"),
        unid("VNSSA - ID", "1001tl", "VNSSA"),
        id("work"),
        res("ID - ID", "flex", "community"),
        id("ratchet"),
      ],
    },
    {
      slug: "confession-radio-117",
      title: "Confession Radio 117",
      type: "radio",
      primary: "tchami",
      series: "confession-radio",
      daysAgo: 20,
      durationSec: 3600,
      source: "1001Tracklists",
      cover: "#e0338a",
      tracklist: [
        id("prophecy"),
        id("feel-your-love"),
        id("ride"),
        unid("Dombresky - ID", "1001tl", "Dombresky"),
        id("notorious"),
        raw("Tchami - ID (rip from stream)", "1001tl"),
        id("glow"),
      ],
    },

    // ------------------------------ FESTIVAL SETS ------------------------------
    {
      slug: "chris-lake-edc-lv",
      title: "Chris Lake at EDC Las Vegas (kineticFIELD)",
      type: "festival",
      primary: "chris-lake",
      event: "edc-lv",
      daysAgo: 3,
      durationSec: 4500,
      source: "1001Tracklists",
      cover: "#d7dde2",
      tracklist: [
        id("all-night"),
        id("deceiver"),
        id("shake-it"),
        unid("Chris Lake - ID", "fingerprint", "Chris Lake"),
        id("afterdark"),
        res("ID - ID", "midnight", "community"),
        id("higher-ground"),
        raw("unreleased Black Book collab", "fingerprint"),
        id("deceiver", "fingerprint"),
        id("turn-it-up"),
      ],
    },
    {
      slug: "tchami-malaa-ultra",
      title: "Tchami x Malaa — No Redemption at Ultra",
      type: "festival",
      primary: "tchami",
      collaborators: ["malaa"],
      event: "ultra-miami",
      daysAgo: 5,
      durationSec: 3900,
      source: "1001Tracklists",
      cover: "#e0338a",
      tracklist: [
        id("ride"),
        id("prophecy"),
        id("notorious"),
        id("lowkey"),
        unid("Tchami x Malaa - ID", "fingerprint", "Tchami, Malaa"),
        id("feel-your-love"),
        res("ID - ID", "glow", "community"),
        raw("No Redemption VIP (unreleased)", "fingerprint"),
        id("prophecy", "fingerprint"),
      ],
    },
    {
      slug: "marten-horger-hard-summer",
      title: "Marten Hörger at HARD Summer",
      type: "festival",
      primary: "marten-horger",
      event: "hard-summer",
      daysAgo: 8,
      durationSec: 3600,
      source: "1001Tracklists",
      cover: "#ff7a1a",
      tracklist: [
        id("turbulence"),
        id("lose-my-mind"),
        id("pulse"),
        id("ratchet"),
        unid("Marten Hörger - ID", "fingerprint", "Marten Hörger"),
        res("ID - ID", "vibrate", "community"),
        raw("Marten Hörger - new ID (festival rip)", "fingerprint"),
        id("glow"),
        id("turbulence", "fingerprint"),
      ],
    },
    {
      slug: "wax-motif-coachella",
      title: "Wax Motif at Coachella (Yuma)",
      type: "festival",
      primary: "wax-motif",
      event: "coachella",
      daysAgo: 14,
      durationSec: 3600,
      source: "1001Tracklists",
      cover: "#ffcf40",
      tracklist: [
        id("ratchet"),
        id("vibrate"),
        id("get-down"),
        unid("Wax Motif - ID", "fingerprint", "Wax Motif"),
        id("juke"),
        res("ID - ID", "flex", "community"),
        raw("Divided Souls ID", "fingerprint"),
        id("ratchet", "fingerprint"),
      ],
    },
    {
      slug: "jauz-lollapalooza",
      title: "Jauz at Lollapalooza",
      type: "festival",
      primary: "jauz",
      event: "lollapalooza",
      daysAgo: 18,
      durationSec: 3300,
      source: "1001Tracklists",
      cover: "#ff3b6b",
      tracklist: [
        id("get-down"),
        id("overdrive"),
        id("higher-ground"),
        unid("Jauz - ID", "fingerprint", "Jauz"),
        id("drop-it"),
        res("ID - ID", "static", "community"),
        raw("Bite This! ID", "fingerprint"),
      ],
    },
    {
      slug: "cid-brooklyn-mirage",
      title: "CID at The Brooklyn Mirage",
      type: "festival",
      primary: "cid",
      event: "brooklyn-mirage",
      daysAgo: 22,
      durationSec: 4200,
      source: "1001Tracklists",
      cover: "#4bd0c0",
      tracklist: [
        id("shake-it"),
        id("midnight"),
        id("all-night"),
        unid("CID - ID", "fingerprint", "CID"),
        id("deceiver"),
        res("ID - ID", "flex", "community"),
        raw("House of Hustle ID", "fingerprint"),
        id("shake-it", "fingerprint"),
      ],
    },
    {
      slug: "dombresky-edc-lv",
      title: "Dombresky at EDC Las Vegas (bassPOD)",
      type: "festival",
      primary: "dombresky",
      event: "edc-lv",
      daysAgo: 25,
      durationSec: 3600,
      source: "1001Tracklists",
      cover: "#ff6b3d",
      tracklist: [
        id("feel-your-love"),
        id("neon"),
        id("ratchet"),
        unid("Dombresky - ID", "fingerprint", "Dombresky"),
        id("higher-ground"),
        raw("Dombresky - unreleased 2025 ID", "fingerprint"),
        id("neon", "fingerprint"),
      ],
    },

    // ------------------------------ SOUNDCLOUD MIXES ------------------------------
    {
      slug: "bradeazy-basement-mix",
      title: "bradeazy — Basement Mix Vol. 4",
      type: "soundcloud",
      primary: "bradeazy",
      daysAgo: 1,
      durationSec: 3000,
      source: "SoundCloud",
      sourceUrl: "https://soundcloud.com/bradeazy",
      cover: "#34e0c4",
      tracklist: [
        raw("Intro — bradeazy edit", "soundcloud"),
        id("drop-it", "soundcloud"),
        id("warehouse", "soundcloud"),
        unid("ID - ID", "soundcloud", undefined, "Track ID? comments open"),
        id("bass-jam", "soundcloud"),
        res("bradeazy - ID", "static", "community"),
        raw("garage bootleg (untitled)", "soundcloud"),
        id("get-down", "soundcloud"),
      ],
    },
    {
      slug: "volac-house-work",
      title: "Volac — House Work Podcast 099",
      type: "soundcloud",
      primary: "volac",
      daysAgo: 5,
      durationSec: 3600,
      source: "SoundCloud",
      sourceUrl: "https://soundcloud.com/volac",
      cover: "#b06bff",
      tracklist: [
        id("rave-tool", "soundcloud"),
        id("serotonin", "soundcloud"),
        unid("Volac - ID", "soundcloud", "Volac"),
        id("ratchet", "soundcloud"),
        raw("unknown — big room bass ID", "soundcloud"),
        res("ID - ID", "flex", "community"),
        id("serotonin", "fingerprint"),
      ],
    },
    {
      slug: "vnssa-raw-house",
      title: "VNSSA — Raw House Mix",
      type: "soundcloud",
      primary: "vnssa",
      daysAgo: 10,
      durationSec: 2700,
      source: "SoundCloud",
      sourceUrl: "https://soundcloud.com/vnssa",
      cover: "#ff9f1c",
      tracklist: [
        id("tunnel", "soundcloud"),
        id("roll-with-it", "soundcloud"),
        unid("VNSSA - ID", "soundcloud", "VNSSA"),
        id("juke", "soundcloud"),
        raw("dubplate — no ID", "soundcloud"),
        res("ID - ID", "pressure", "community"),
      ],
    },
    {
      slug: "habstrakt-bass-house-mix",
      title: "Habstrakt — Bass House Essentials",
      type: "soundcloud",
      primary: "habstrakt",
      daysAgo: 15,
      durationSec: 3300,
      source: "SoundCloud",
      sourceUrl: "https://soundcloud.com/habstrakt",
      cover: "#6a5cff",
      tracklist: [
        id("higher-ground", "soundcloud"),
        id("gravity", "soundcloud"),
        unid("Habstrakt - ID", "soundcloud", "Habstrakt"),
        id("overdrive", "soundcloud"),
        raw("riddim bootleg (unreleased)", "soundcloud"),
        res("ID - ID", "static", "community"),
        id("gravity", "fingerprint"),
      ],
    },
    {
      slug: "bijou-gspot-mix",
      title: "BIJOU — G-SPOT Radio 077",
      type: "soundcloud",
      primary: "bijou",
      daysAgo: 19,
      durationSec: 3600,
      source: "SoundCloud",
      sourceUrl: "https://soundcloud.com/bijou",
      cover: "#ff2d7e",
      tracklist: [
        id("flex", "soundcloud"),
        id("juke", "soundcloud"),
        unid("BIJOU - ID", "soundcloud", "BIJOU"),
        id("ratchet", "soundcloud"),
        raw("G-house dub — untitled", "soundcloud"),
        res("ID - ID", "midnight", "community"),
      ],
    },
    {
      slug: "westend-cause-affect-b2b",
      title: "Westend b2b Cause & Affect — Live Studio Mix",
      type: "soundcloud",
      primary: "westend",
      collaborators: ["cause-affect"],
      daysAgo: 24,
      durationSec: 3000,
      source: "SoundCloud",
      sourceUrl: "https://soundcloud.com/westend",
      cover: "#2bd67b",
      tracklist: [
        id("moonwalk", "soundcloud"),
        id("bass-jam", "soundcloud"),
        id("pressure", "soundcloud"),
        unid("Westend - ID", "soundcloud", "Westend"),
        id("static", "soundcloud"),
        raw("Cause & Affect - garage edit (unreleased)", "soundcloud"),
        res("ID - ID", "moonwalk", "community"),
      ],
    },
  ];

  for (const s of setDefs) {
    const set = await prisma.set.create({
      data: {
        slug: s.slug,
        title: s.title,
        type: s.type,
        publishedAt: daysAgo(s.daysAgo),
        durationSec: s.durationSec,
        sourceName: s.source,
        sourceUrl: s.sourceUrl,
        cover: s.cover,
        eventId: s.event ? events[s.event] : null,
        seriesId: s.series ? series[s.series] : null,
      },
    });

    // artists
    await prisma.setArtist.create({
      data: { setId: set.id, djId: djs[s.primary], isPrimary: true },
    });
    for (const c of s.collaborators ?? []) {
      await prisma.setArtist.create({
        data: { setId: set.id, djId: djs[c], isPrimary: false },
      });
    }

    // plays
    const n = s.tracklist.length;
    for (let i = 0; i < n; i++) {
      const e = s.tracklist[i];
      const timestamp = Math.round((s.durationSec * (i + 1)) / (n + 1));
      const base = { setId: set.id, position: i + 1, timestamp, provenance: e.prov };

      if (e.kind === "id") {
        await prisma.played.create({
          data: { ...base, idStatus: "identified", trackId: tracks[e.track] },
        });
      } else if (e.kind === "unid") {
        const idTrack = await prisma.idTrack.create({
          data: { label: e.label, suspectedArtist: e.suspected, note: e.note, status: "unresolved" },
        });
        await prisma.played.create({
          data: {
            ...base,
            idStatus: "unresolved_id",
            idTrackId: idTrack.id,
            rawText: e.label,
          },
        });
      } else if (e.kind === "res") {
        const idTrack = await prisma.idTrack.create({
          data: {
            label: e.label,
            status: "community_resolved",
            resolvedTrackId: tracks[e.track],
          },
        });
        await prisma.played.create({
          data: {
            ...base,
            idStatus: "community_resolved",
            idTrackId: idTrack.id,
            trackId: tracks[e.track],
            rawText: e.label,
          },
        });
      } else {
        await prisma.played.create({
          data: { ...base, idStatus: "unparsed", rawText: e.text },
        });
      }
    }
    console.log(`  set ${s.slug}: ${n} plays @ ${hms(s.durationSec)}`);
  }

  const counts = {
    labels: await prisma.label.count(),
    djs: await prisma.dj.count(),
    events: await prisma.event.count(),
    series: await prisma.series.count(),
    tracks: await prisma.track.count(),
    idTracks: await prisma.idTrack.count(),
    sets: await prisma.set.count(),
    plays: await prisma.played.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
