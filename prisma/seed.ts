import { PrismaClient } from "@prisma/client";
import { ARTIST_ROSTER } from "../src/lib/ingest/roster";
import { slugify } from "../src/lib/ingest/types";
import { djSocials, djSocialsFromKnown, labelSocials } from "../src/lib/social";

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
    // Prefer slug lookup so "divided" hits curated Divided Souls URLs.
    const socials = {
      ...labelSocials(name),
      ...(labelSocials(slug).website ? labelSocials(slug) : {}),
    };
    const l = await prisma.label.create({
      data: { slug, name, color, ...socials },
    });
    labels[slug] = l.id;
  }

  // -------------------------------------------------------------------------
  // DJs
  // -------------------------------------------------------------------------
  const djData = [
    ["marten-horger", "Marten Horger", "Berlin, DE", "#ff7a45", "German producer bending tech house into hard-hitting bass grooves."],
    ["ac-slater", "AC Slater", "Los Angeles, US", "#f2b33d", "Night Bass founder and the definitional voice of modern bass house."],
    ["chris-lake", "Chris Lake", "Los Angeles, US", "#c6cfda", "Black Book Records boss steering peak-time house."],
    ["tchami", "Tchami", "Paris, FR", "#e06cc4", "Future house pioneer and Confession label head."],
    ["bradeazy", "bradeazy", "Atlanta, US", "#3aa0e0", "Bass-forward selector splicing house, garage and dubstep."],
    ["wax-motif", "Wax Motif", "Los Angeles, US", "#f4c560", "Divided Souls founder with a G-house pedigree."],
    ["malaa", "Malaa", "Paris, FR", "#97a0b0", "Masked Confession affiliate dealing in dark house."],
    ["habstrakt", "Habstrakt", "Lyon, FR", "#8a7cff", "French producer straddling bass house and dubstep."],
    ["jauz", "Jauz", "Los Angeles, US", "#ff6b84", "Bite This! captain fusing bass house and riddim."],
    ["dombresky", "Dombresky", "Marseille, FR", "#ff9457", "French house energy with a festival gloss."],
    ["cid", "CID", "New York, US", "#45c7e0", "House of Hustle founder, Grammy-winning house selector."],
    ["volac", "Volac", "Moscow, RU", "#b48cff", "Russian duo delivering relentless tech-tinged bass house."],
    ["bijou", "BIJOU", "Phoenix, US", "#ff6fb0", "G-house purveyor and Do Not Duplicate boss."],
    ["westend", "Westend", "Nashville, US", "#52c7d2", "Tech house rising through Insomniac and bitbird."],
    ["vnssa", "VNSSA", "Los Angeles, US", "#ffa84d", "Night Bass mainstay pushing raw house and bass."],
    ["cause-affect", "Cause & Affect", "Vancouver, CA", "#4e9dff", "Canadian duo bridging bass house and UK garage."],
    ["cloonee", "Cloonee", "London, UK", "#f08a3d", "Tech-house heavyweight with a bass-house swing."],
    ["matroda", "Matroda", "Los Angeles, US", "#4fb0e0", "Croatian-born producer and Terminal Underground boss."],
    ["chris-lorenzo", "Chris Lorenzo", "Birmingham, UK", "#ff7096", "Bass-house architect from the UK's Cause & Affect lineage."],
    ["kyle-walker", "Kyle Walker", "Los Angeles, US", "#b0d24e", "West-coast bass house and tech house selector."],
    ["sammy-virji", "Sammy Virji", "London, UK", "#ffd24d", "UK garage phenomenon crossing into bass house."],
    ["taiki-nulight", "Taiki Nulight", "London, UK", "#5cc7d6", "UK bass and house hybridist."],
    ["hex-cougar", "Hex Cougar", "Los Angeles, US", "#c56cff", "Dark, bass-heavy house and trap fusion."],
    ["gettoblaster", "Gettoblaster", "Chicago, US", "#ff6f5e", "Chicago house duo with a raw, bouncy edge."],
    ["dr-fresch", "Dr. Fresch", "Los Angeles, US", "#ff5e5e", "House-music trailblazer bending bass and G-house."],
    ["walker-royce", "Walker & Royce", "New York, US", "#58c0ff", "Dirtybird duo with quirky, groovy tech house."],
    ["sacha-robotti", "Sacha Robotti", "Los Angeles, US", "#c99cff", "Dirtybird selector serving playful tech house."],
    ["nikki-nair", "Nikki Nair", "Atlanta, US", "#4fe0c0", "Experimental bass and breaks producer."],
    ["ardalan", "Ardalan", "San Francisco, US", "#ff9f5c", "Dirtybird mainstay delivering dark tech house."],
    ["justin-jay", "Justin Jay", "Los Angeles, US", "#a0d24e", "Genre-fluid house artist and live performer."],
  ];
  const djs: Record<string, string> = {};
  for (const [slug, name, homeCity, accent, bio] of djData) {
    const roster = ARTIST_ROSTER.find((a) => slugify(a.name) === slug);
    const socials = roster
      ? djSocialsFromKnown({
          name,
          soundcloudPermalink: roster.soundcloud?.permalink,
          socials: roster.socials,
          website: roster.website,
        })
      : djSocials(name);
    const d = await prisma.dj.create({
      data: { slug, name, homeCity, accent, bio, ...socials },
    });
    djs[slug] = d.id;
  }

  // -------------------------------------------------------------------------
  // Events
  // -------------------------------------------------------------------------
  const eventData: Array<[string, string, string, string, string | null]> = [
    ["edc-lv", "EDC Las Vegas", "festival", "Las Vegas Motor Speedway", "https://lasvegas.edc.com/"],
    ["ultra-miami", "Ultra Music Festival", "festival", "Bayfront Park, Miami", "https://ultramusicfestival.com/"],
    ["hard-summer", "HARD Summer", "festival", "Hollywood Park, Los Angeles", "https://hardfest.com/"],
    ["coachella", "Coachella", "festival", "Empire Polo Club, Indio", "https://www.coachella.com/"],
    ["lollapalooza", "Lollapalooza", "festival", "Grant Park, Chicago", "https://www.lollapalooza.com/"],
    ["brooklyn-mirage", "The Brooklyn Mirage", "club", "Brooklyn, New York", "https://www.avantgardner.com/"],
    ["parklife", "Parklife", "festival", "Heaton Park, Manchester", null],
    ["elrow", "elrow", "club", "various", null],
  ];
  const events: Record<string, string> = {};
  for (const [slug, name, kind, location, website] of eventData) {
    const e = await prisma.event.create({
      data: { slug, name, kind, location, website },
    });
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
    ["terminal-radio", "Terminal Radio", "matroda"],
    ["vault-radio", "Vault Radio", "sammy-virji"],
    ["house-calls-radio", "House Calls Radio", "dr-fresch"],
    ["rules-radio", "Rules Radio", "walker-royce"],
  ];
  const series: Record<string, string> = {};
  for (const [slug, name, dj] of seriesData) {
    const s = await prisma.series.create({ data: { slug, name, djId: djs[dj] } });
    series[slug] = s.id;
  }

  // -------------------------------------------------------------------------
  // Track pool (reused across sets so "most-played" is meaningful)
  // -------------------------------------------------------------------------
  // Prefer real release titles where we can — thumbs resolves cover art via Deezer/iTunes.
  const trackData: [string, string, string, string | null, number][] = [
    ["lose-my-mind", "No Bite", "Marten Horger", "nightbass", 126],
    ["turn-it-up", "Rampage", "AC Slater", "nightbass", 128],
    ["deceiver", "Deceiver", "Chris Lake", "blackbook", 126],
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
    ["turbulence", "Worth The Wait", "Marten Horger", null, 128],
    ["work", "Crew Joint", "AC Slater", "nightbass", 128],
    ["all-night", "All Night", "Chris Lake", "blackbook", 125],
    ["ride", "The Calling", "Tchami", "confession", 125],
    ["drop-it", "Drop It", "bradeazy", null, 130],
    ["warehouse", "Warehouse", "bradeazy", "houseofhustle", 128],
    ["neon", "Neon", "Dombresky", null, 124],
    ["gravity", "Gravity", "Habstrakt", "monstercat", 128],
    ["vibrate", "Vibrate", "Wax Motif", "divided", 125],
    ["overdrive", "Overdrive", "Jauz", "insomniac", 126],
    ["midnight", "Midnight", "CID", null, 124],
    ["serotonin", "Serotonin", "Volac", null, 127],
    ["flex", "Flex", "BIJOU", null, 128],
    ["moonwalk", "Moonwalk", "Westend", "bitbird", 122],
    ["tunnel", "Tunnel", "VNSSA", null, 126],
    ["static", "Static", "Cause & Affect", null, 130],
    ["pulse", "I Know", "Marten Horger", null, 127],
    ["lowkey", "Lowkey", "Malaa", null, 125],
    ["afterdark", "A Drug From God", "Chris Lake", "blackbook", 126],
    ["glow", "Keep On Pushing", "Marten Horger", "confession", 126],
    ["get-loose", "Get Loose", "Cloonee", null, 128],
    ["low-ride", "Low Ride", "Cloonee", null, 127],
    ["superstar", "Superstar", "Matroda", null, 126],
    ["zamba", "Zamba", "Matroda", null, 125],
    ["the-crave", "The Crave", "Chris Lorenzo", null, 130],
    ["guardala", "Guardala", "Chris Lorenzo", null, 129],
    ["if-u-need-it", "If U Need It", "Sammy Virji", null, 138],
    ["shellas-cake", "Shella's Cake", "Sammy Virji", null, 136],
    ["work-it", "Work It", "Kyle Walker", null, 127],
    ["benzo", "Benzo", "Taiki Nulight", null, 128],
    ["trust", "Trust", "Hex Cougar", null, 150],
    ["freak", "Freak", "Gettoblaster", null, 126],
    ["the-plug", "The Plug", "Dr. Fresch", null, 128],
    ["west-coast", "West Coast Bass", "Dr. Fresch", null, 126],
    ["rub-a-dub", "Rub Anotha Dub", "Walker & Royce", null, 125],
    ["your-leader", "Take Me to Your Leader", "Walker & Royce", null, 126],
    ["sloth-vip", "Sloth VIP", "Sacha Robotti", null, 125],
    ["vertigo", "Vertigo", "Sacha Robotti", null, 127],
    ["detach", "Detach", "Nikki Nair", null, 133],
    ["rush", "Rush", "Nikki Nair", null, 132],
    ["cracklin", "Cracklin", "Ardalan", null, 126],
    ["voodoo", "Voodoo", "Ardalan", null, 127],
    ["karma", "Karma", "Justin Jay", null, 124],
    ["sundays", "Sundays", "Justin Jay", null, 122],
  ];
  const tracks: Record<string, string> = {};
  for (const [slug, title, artistName, labelSlug, bpm] of trackData) {
    const t = await prisma.track.create({
      data: {
        slug,
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
    genre?: string;
    daysAgo: number;
    durationSec: number;
    source: string;
    sourceUrl?: string;
    cover: string;
    tracklist: Entry[];
  };

  // Default genre per DJ (a set can override via `genre`).
  const djGenre: Record<string, string> = {
    "marten-horger": "Bass House",
    "ac-slater": "Bass House",
    "chris-lake": "Tech House",
    "tchami": "Future House",
    "bradeazy": "Bass House",
    "wax-motif": "G-House",
    "malaa": "Bass House",
    "habstrakt": "Bass House",
    "jauz": "Bass House",
    "dombresky": "House",
    "cid": "Tech House",
    "volac": "Bass House",
    "bijou": "G-House",
    "westend": "Tech House",
    "vnssa": "Bass House",
    "cause-affect": "Bass House",
    "cloonee": "Tech House",
    "matroda": "Bass House",
    "chris-lorenzo": "Bass House",
    "kyle-walker": "Tech House",
    "sammy-virji": "UK Garage",
    "taiki-nulight": "Bass House",
    "hex-cougar": "Bass House",
    "gettoblaster": "Ghetto House",
    "dr-fresch": "House",
    "walker-royce": "Tech House",
    "sacha-robotti": "Tech House",
    "nikki-nair": "Bass House",
    "ardalan": "Tech House",
    "justin-jay": "House",
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
      cover: "#f2b33d",
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
      cover: "#e06cc4",
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
      cover: "#ff7a45",
      tracklist: [
        id("turbulence"),
        id("lose-my-mind"),
        id("pulse"),
        unid("Marten Horger - ID", "1001tl", "Marten Horger"),
        id("glow"),
        res("ID - ID", "vibrate", "community"),
        id("ratchet"),
        raw("Marten Horger - VIP edit (rip)", "1001tl"),
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
      cover: "#3aa0e0",
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
      cover: "#c6cfda",
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
      cover: "#f2b33d",
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
      cover: "#e06cc4",
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
      title: "EDC Las Vegas · kineticFIELD",
      type: "festival",
      primary: "chris-lake",
      event: "edc-lv",
      daysAgo: 3,
      durationSec: 4500,
      source: "1001Tracklists",
      cover: "#c6cfda",
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
      title: "Ultra Music Festival · No Redemption",
      type: "festival",
      primary: "tchami",
      collaborators: ["malaa"],
      event: "ultra-miami",
      daysAgo: 5,
      durationSec: 3900,
      source: "1001Tracklists",
      cover: "#e06cc4",
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
      title: "HARD Summer",
      type: "festival",
      primary: "marten-horger",
      event: "hard-summer",
      daysAgo: 8,
      durationSec: 3600,
      source: "1001Tracklists",
      cover: "#ff7a45",
      tracklist: [
        id("turbulence"),
        id("lose-my-mind"),
        id("pulse"),
        id("ratchet"),
        unid("Marten Horger - ID", "fingerprint", "Marten Horger"),
        res("ID - ID", "vibrate", "community"),
        raw("Marten Horger - new ID (festival rip)", "fingerprint"),
        id("glow"),
        id("turbulence", "fingerprint"),
      ],
    },
    {
      slug: "wax-motif-coachella",
      title: "Coachella · Yuma Tent",
      type: "festival",
      primary: "wax-motif",
      event: "coachella",
      daysAgo: 14,
      durationSec: 3600,
      source: "1001Tracklists",
      cover: "#f4c560",
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
      title: "Lollapalooza",
      type: "festival",
      primary: "jauz",
      event: "lollapalooza",
      daysAgo: 18,
      durationSec: 3300,
      source: "1001Tracklists",
      cover: "#ff6b84",
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
      title: "The Brooklyn Mirage",
      type: "festival",
      primary: "cid",
      event: "brooklyn-mirage",
      daysAgo: 22,
      durationSec: 4200,
      source: "1001Tracklists",
      cover: "#45c7e0",
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
      title: "EDC Las Vegas · bassPOD",
      type: "festival",
      primary: "dombresky",
      event: "edc-lv",
      daysAgo: 25,
      durationSec: 3600,
      source: "1001Tracklists",
      cover: "#ff9457",
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
      title: "Basement Mix Vol. 4",
      type: "soundcloud",
      primary: "bradeazy",
      daysAgo: 1,
      durationSec: 3000,
      source: "SoundCloud",
      sourceUrl: "https://soundcloud.com/bradeazy",
      cover: "#3aa0e0",
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
      title: "House Work Podcast 099",
      type: "soundcloud",
      primary: "volac",
      daysAgo: 5,
      durationSec: 3600,
      source: "SoundCloud",
      sourceUrl: "https://soundcloud.com/volac",
      cover: "#b48cff",
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
      title: "Raw House Mix",
      type: "soundcloud",
      primary: "vnssa",
      daysAgo: 10,
      durationSec: 2700,
      source: "SoundCloud",
      sourceUrl: "https://soundcloud.com/vnssa",
      cover: "#ffa84d",
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
      title: "Bass House Essentials",
      type: "soundcloud",
      primary: "habstrakt",
      daysAgo: 15,
      durationSec: 3300,
      source: "SoundCloud",
      sourceUrl: "https://soundcloud.com/habstrakt",
      cover: "#8a7cff",
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
      title: "G-SPOT Radio 077",
      type: "soundcloud",
      primary: "bijou",
      daysAgo: 19,
      durationSec: 3600,
      source: "SoundCloud",
      sourceUrl: "https://soundcloud.com/bijou",
      cover: "#ff6fb0",
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
      title: "Live Studio Mix",
      type: "soundcloud",
      primary: "westend",
      collaborators: ["cause-affect"],
      daysAgo: 24,
      durationSec: 3000,
      source: "SoundCloud",
      sourceUrl: "https://soundcloud.com/westend",
      cover: "#52c7d2",
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

    // ------------------------------ MORE RADIO ------------------------------
    {
      slug: "terminal-radio-012",
      title: "Terminal Radio 012",
      type: "radio",
      primary: "matroda",
      series: "terminal-radio",
      daysAgo: 3,
      durationSec: 3600,
      source: "1001Tracklists",
      cover: "#4fb0e0",
      tracklist: [
        id("superstar"),
        id("zamba"),
        id("get-loose"),
        unid("Matroda - ID", "1001tl", "Matroda"),
        id("ratchet"),
        res("ID - ID", "freak", "community"),
        raw("Matroda - unreleased edit (rip)", "1001tl"),
        id("superstar", "fingerprint"),
      ],
    },
    {
      slug: "vault-radio-005",
      title: "Vault Radio 005",
      type: "radio",
      primary: "sammy-virji",
      series: "vault-radio",
      daysAgo: 5,
      durationSec: 3600,
      source: "1001Tracklists",
      cover: "#ffd24d",
      tracklist: [
        id("if-u-need-it"),
        id("shellas-cake"),
        unid("Sammy Virji - ID", "1001tl", "Sammy Virji"),
        id("the-crave"),
        res("ID - ID", "benzo", "community"),
        raw("Sammy Virji - dubplate (rip)", "1001tl"),
        id("if-u-need-it", "fingerprint"),
      ],
    },

    // ------------------------------ MORE FESTIVAL ------------------------------
    {
      slug: "cloonee-parklife",
      title: "Parklife · The Valley",
      type: "festival",
      primary: "cloonee",
      event: "parklife",
      daysAgo: 6,
      durationSec: 3600,
      source: "1001Tracklists",
      cover: "#f08a3d",
      tracklist: [
        id("get-loose"),
        id("low-ride"),
        id("ratchet"),
        unid("Cloonee - ID", "fingerprint", "Cloonee"),
        id("superstar"),
        res("ID - ID", "freak", "community"),
        raw("Cloonee - unreleased 2025 ID", "fingerprint"),
        id("get-loose", "fingerprint"),
      ],
    },
    {
      slug: "chris-lorenzo-elrow",
      title: "elrow · Town",
      type: "festival",
      primary: "chris-lorenzo",
      event: "elrow",
      daysAgo: 11,
      durationSec: 3600,
      source: "1001Tracklists",
      cover: "#ff7096",
      tracklist: [
        id("the-crave"),
        id("guardala"),
        id("ratchet"),
        unid("Chris Lorenzo - ID", "fingerprint", "Chris Lorenzo"),
        id("deceiver"),
        res("ID - ID", "trust", "community"),
        raw("Cause & Affect ID", "fingerprint"),
        id("the-crave", "fingerprint"),
      ],
    },
    {
      slug: "matroda-edc-lv",
      title: "EDC Las Vegas · cosmicMEADOW",
      type: "festival",
      primary: "matroda",
      event: "edc-lv",
      daysAgo: 13,
      durationSec: 3900,
      source: "1001Tracklists",
      cover: "#4fb0e0",
      tracklist: [
        id("superstar"),
        id("zamba"),
        id("ratchet"),
        unid("Matroda - ID", "fingerprint", "Matroda"),
        id("vibrate"),
        res("ID - ID", "get-loose", "community"),
        raw("Terminal ID", "fingerprint"),
        id("zamba", "fingerprint"),
      ],
    },
    {
      slug: "sammy-virji-parklife",
      title: "Parklife · Hangar",
      type: "festival",
      primary: "sammy-virji",
      event: "parklife",
      daysAgo: 17,
      durationSec: 3600,
      source: "1001Tracklists",
      cover: "#ffd24d",
      tracklist: [
        id("if-u-need-it"),
        id("shellas-cake"),
        id("benzo"),
        unid("Sammy Virji - ID", "fingerprint", "Sammy Virji"),
        id("the-crave"),
        raw("UKG bootleg (unreleased)", "fingerprint"),
        id("if-u-need-it", "fingerprint"),
      ],
    },
    {
      slug: "kyle-walker-hard-summer",
      title: "HARD Summer · Purple Stage",
      type: "festival",
      primary: "kyle-walker",
      event: "hard-summer",
      daysAgo: 23,
      durationSec: 3300,
      source: "1001Tracklists",
      cover: "#b0d24e",
      tracklist: [
        id("work-it"),
        id("ratchet"),
        id("shake-it"),
        unid("Kyle Walker - ID", "fingerprint", "Kyle Walker"),
        id("get-down"),
        res("ID - ID", "freak", "community"),
        raw("unreleased edit", "fingerprint"),
      ],
    },

    // ------------------------------ MORE SOUNDCLOUD ------------------------------
    {
      slug: "cloonee-wcis-mix",
      title: "What Can I Say Vol. 12",
      type: "soundcloud",
      primary: "cloonee",
      daysAgo: 1,
      durationSec: 3000,
      source: "SoundCloud",
      sourceUrl: "https://soundcloud.com/cloonee",
      cover: "#f08a3d",
      tracklist: [
        raw("Intro — Cloonee edit", "soundcloud"),
        id("get-loose", "soundcloud"),
        id("low-ride", "soundcloud"),
        unid("ID - ID", "soundcloud", undefined, "Track ID? comments open"),
        id("superstar", "soundcloud"),
        res("Cloonee - ID", "freak", "community"),
        raw("bootleg (untitled)", "soundcloud"),
        id("ratchet", "soundcloud"),
      ],
    },
    {
      slug: "matroda-cloonee-b2b",
      title: "Terminal x WCIS (b2b)",
      type: "soundcloud",
      primary: "matroda",
      collaborators: ["cloonee"],
      daysAgo: 4,
      durationSec: 3600,
      source: "SoundCloud",
      sourceUrl: "https://soundcloud.com/matroda",
      cover: "#4fb0e0",
      tracklist: [
        id("superstar", "soundcloud"),
        id("get-loose", "soundcloud"),
        id("zamba", "soundcloud"),
        unid("Matroda x Cloonee - ID", "soundcloud", "Matroda, Cloonee"),
        id("low-ride", "soundcloud"),
        res("ID - ID", "freak", "community"),
        raw("mashup (unreleased)", "soundcloud"),
      ],
    },
    {
      slug: "taiki-nulight-mix",
      title: "Bass House Selects 03",
      type: "soundcloud",
      primary: "taiki-nulight",
      daysAgo: 8,
      durationSec: 3000,
      source: "SoundCloud",
      sourceUrl: "https://soundcloud.com/taikinulight",
      cover: "#5cc7d6",
      tracklist: [
        id("benzo", "soundcloud"),
        id("ratchet", "soundcloud"),
        unid("Taiki Nulight - ID", "soundcloud", "Taiki Nulight"),
        id("higher-ground", "soundcloud"),
        raw("dub — no ID", "soundcloud"),
        res("ID - ID", "trust", "community"),
        id("benzo", "fingerprint"),
      ],
    },
    {
      slug: "hex-cougar-mix",
      title: "Trust The Process",
      type: "soundcloud",
      primary: "hex-cougar",
      daysAgo: 12,
      durationSec: 2700,
      source: "SoundCloud",
      sourceUrl: "https://soundcloud.com/hexcougar",
      cover: "#c56cff",
      tracklist: [
        id("trust", "soundcloud"),
        id("overdrive", "soundcloud"),
        unid("Hex Cougar - ID", "soundcloud", "Hex Cougar"),
        id("get-down", "soundcloud"),
        raw("trap bootleg", "soundcloud"),
        res("ID - ID", "freak", "community"),
      ],
    },
    {
      slug: "gettoblaster-mix",
      title: "Chicago Bounce 08",
      type: "soundcloud",
      primary: "gettoblaster",
      daysAgo: 21,
      durationSec: 3000,
      source: "SoundCloud",
      sourceUrl: "https://soundcloud.com/gettoblaster",
      cover: "#ff6f5e",
      tracklist: [
        id("freak", "soundcloud"),
        id("shake-it", "soundcloud"),
        unid("Gettoblaster - ID", "soundcloud", "Gettoblaster"),
        id("midnight", "soundcloud"),
        raw("ghetto house edit", "soundcloud"),
        res("ID - ID", "work-it", "community"),
      ],
    },

    // ------------------------------ BATCH 3: RADIO ------------------------------
    {
      slug: "house-calls-044",
      title: "House Calls Radio 044",
      type: "radio",
      primary: "dr-fresch",
      series: "house-calls-radio",
      daysAgo: 2,
      durationSec: 3600,
      source: "1001Tracklists",
      cover: "#ff5e5e",
      tracklist: [
        id("the-plug"),
        id("west-coast"),
        unid("Dr. Fresch - ID", "1001tl", "Dr. Fresch"),
        id("ratchet"),
        res("ID - ID", "vertigo", "community"),
        raw("Dr. Fresch - unreleased edit", "1001tl"),
        id("the-plug", "fingerprint"),
      ],
    },
    {
      slug: "rules-radio-021",
      title: "Rules Radio 021",
      type: "radio",
      primary: "walker-royce",
      series: "rules-radio",
      daysAgo: 5,
      durationSec: 3600,
      source: "1001Tracklists",
      cover: "#58c0ff",
      tracklist: [
        id("rub-a-dub"),
        id("your-leader"),
        unid("Walker & Royce - ID", "1001tl", "Walker & Royce"),
        id("sloth-vip"),
        res("ID - ID", "cracklin", "community"),
        raw("Dirtybird ID", "1001tl"),
        id("rub-a-dub", "fingerprint"),
      ],
    },

    // ------------------------------ BATCH 3: FESTIVAL ------------------------------
    {
      slug: "sacha-robotti-elrow",
      title: "elrow · Rowsattack",
      type: "festival",
      primary: "sacha-robotti",
      event: "elrow",
      daysAgo: 9,
      durationSec: 3600,
      source: "1001Tracklists",
      cover: "#c99cff",
      tracklist: [
        id("sloth-vip"),
        id("vertigo"),
        id("ratchet"),
        unid("Sacha Robotti - ID", "fingerprint", "Sacha Robotti"),
        id("rub-a-dub"),
        res("ID - ID", "voodoo", "community"),
        raw("Dirtybird ID", "fingerprint"),
      ],
    },
    {
      slug: "ardalan-hard-summer",
      title: "HARD Summer · Green Stage",
      type: "festival",
      primary: "ardalan",
      event: "hard-summer",
      daysAgo: 15,
      durationSec: 3300,
      source: "1001Tracklists",
      cover: "#ff9f5c",
      tracklist: [
        id("cracklin"),
        id("voodoo"),
        id("shake-it"),
        unid("Ardalan - ID", "fingerprint", "Ardalan"),
        id("get-down"),
        res("ID - ID", "sloth-vip", "community"),
        raw("unreleased edit", "fingerprint"),
      ],
    },
    {
      slug: "nikki-nair-coachella",
      title: "Coachella · Yuma Tent",
      type: "festival",
      primary: "nikki-nair",
      event: "coachella",
      genre: "Bass House",
      daysAgo: 19,
      durationSec: 3600,
      source: "1001Tracklists",
      cover: "#4fe0c0",
      tracklist: [
        id("detach"),
        id("rush"),
        id("ratchet"),
        unid("Nikki Nair - ID", "fingerprint", "Nikki Nair"),
        id("overdrive"),
        res("ID - ID", "trust", "community"),
        raw("breaks dub", "fingerprint"),
      ],
    },

    // ------------------------------ BATCH 3: SOUNDCLOUD ------------------------------
    {
      slug: "justin-jay-mix",
      title: "Fantastic Voyage 07",
      type: "soundcloud",
      primary: "justin-jay",
      daysAgo: 1,
      durationSec: 3000,
      source: "SoundCloud",
      sourceUrl: "https://soundcloud.com/justinjay",
      cover: "#a0d24e",
      tracklist: [
        raw("Intro — Justin Jay edit", "soundcloud"),
        id("karma", "soundcloud"),
        id("sundays", "soundcloud"),
        unid("Justin Jay - ID", "soundcloud", "Justin Jay"),
        id("the-plug", "soundcloud"),
        res("ID - ID", "cracklin", "community"),
        raw("edit (untitled)", "soundcloud"),
      ],
    },
    {
      slug: "dr-fresch-mix",
      title: "The Plug Mix 12",
      type: "soundcloud",
      primary: "dr-fresch",
      daysAgo: 6,
      durationSec: 3000,
      source: "SoundCloud",
      sourceUrl: "https://soundcloud.com/drfresch",
      cover: "#ff5e5e",
      tracklist: [
        id("the-plug", "soundcloud"),
        id("west-coast", "soundcloud"),
        unid("Dr. Fresch - ID", "soundcloud", "Dr. Fresch"),
        id("ratchet", "soundcloud"),
        raw("G-house dub", "soundcloud"),
        res("ID - ID", "vertigo", "community"),
      ],
    },
    {
      slug: "walker-royce-b2b-sacha",
      title: "Dirtybird b2b Session",
      type: "soundcloud",
      primary: "walker-royce",
      collaborators: ["sacha-robotti"],
      daysAgo: 4,
      durationSec: 3600,
      source: "SoundCloud",
      sourceUrl: "https://soundcloud.com/walkerandroyce",
      cover: "#58c0ff",
      tracklist: [
        id("rub-a-dub", "soundcloud"),
        id("sloth-vip", "soundcloud"),
        id("your-leader", "soundcloud"),
        unid("Walker & Royce x Sacha Robotti - ID", "soundcloud", "Walker & Royce, Sacha Robotti"),
        id("vertigo", "soundcloud"),
        res("ID - ID", "cracklin", "community"),
        raw("mashup (unreleased)", "soundcloud"),
      ],
    },
    {
      slug: "nikki-nair-mix",
      title: "Fracture 03",
      type: "soundcloud",
      primary: "nikki-nair",
      genre: "Bass House",
      daysAgo: 11,
      durationSec: 2700,
      source: "SoundCloud",
      sourceUrl: "https://soundcloud.com/nikkinair",
      cover: "#4fe0c0",
      tracklist: [
        id("detach", "soundcloud"),
        id("rush", "soundcloud"),
        unid("Nikki Nair - ID", "soundcloud", "Nikki Nair"),
        id("higher-ground", "soundcloud"),
        raw("experimental dub", "soundcloud"),
        res("ID - ID", "trust", "community"),
      ],
    },
    {
      slug: "ardalan-mix",
      title: "Voodoo Sessions 05",
      type: "soundcloud",
      primary: "ardalan",
      daysAgo: 22,
      durationSec: 3000,
      source: "SoundCloud",
      sourceUrl: "https://soundcloud.com/ardalan",
      cover: "#ff9f5c",
      tracklist: [
        id("cracklin", "soundcloud"),
        id("voodoo", "soundcloud"),
        unid("Ardalan - ID", "soundcloud", "Ardalan"),
        id("midnight", "soundcloud"),
        raw("tech house dub", "soundcloud"),
        res("ID - ID", "sloth-vip", "community"),
      ],
    },
  ];

  // Fabricated demo sets are opt-in (SEED_MOCK_SETS=1). Deep ingest leaves this
  // off and fills real rows. Fast Pages deploys use mocks only on cache miss so
  // `output: "export"` always has /sets/[slug] params.
  const seedMockSets = process.env.SEED_MOCK_SETS === "1";
  if (!seedMockSets) {
    console.log(
      "Skipping mock sets/plays (SEED_MOCK_SETS!=1). Real tracklists come from ingest.",
    );
  } else {
    for (const s of setDefs) {
      const set = await prisma.set.create({
        data: {
          slug: s.slug,
          title: s.title,
          type: s.type,
          genre: s.genre ?? djGenre[s.primary] ?? "Bass House",
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
            data: {
              label: e.label,
              suspectedArtist: e.suspected,
              note: e.note,
              status: "unresolved",
            },
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
