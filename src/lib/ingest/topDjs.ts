import { slugify, type RawPlay, type RawSet, type SourceAdapter } from "./types";

// A curated "top 100" electronic / house / bass roster. Entries that already
// exist in the DB are matched by slug and reused (only a new set is added).
const TOP_100: [name: string, genre: string][] = [
  ["Martin Garrix", "Big Room"],
  ["David Guetta", "Big Room"],
  ["Calvin Harris", "House"],
  ["Tiësto", "House"],
  ["Skrillex", "Dubstep"],
  ["Marshmello", "Future Bass"],
  ["The Chainsmokers", "Future Bass"],
  ["Illenium", "Melodic Bass"],
  ["deadmau5", "Progressive House"],
  ["Zedd", "Electro House"],
  ["Diplo", "House"],
  ["Alesso", "Progressive House"],
  ["Kygo", "Tropical House"],
  ["Don Diablo", "Future House"],
  ["Oliver Heldens", "Future House"],
  ["Fisher", "Tech House"],
  ["Chris Lake", "Tech House"],
  ["John Summit", "Tech House"],
  ["Dom Dolla", "Tech House"],
  ["Cloonee", "Tech House"],
  ["Tchami", "Future House"],
  ["Malaa", "Bass House"],
  ["Chris Lorenzo", "Bass House"],
  ["AC Slater", "Bass House"],
  ["Wax Motif", "G-House"],
  ["Jauz", "Bass House"],
  ["Habstrakt", "Bass House"],
  ["Dombresky", "House"],
  ["CID", "Tech House"],
  ["Marten Hörger", "Bass House"],
  ["Matroda", "Bass House"],
  ["Gettoblaster", "Ghetto House"],
  ["BIJOU", "G-House"],
  ["Westend", "Tech House"],
  ["VNSSA", "Bass House"],
  ["Volac", "Bass House"],
  ["bradeazy", "Bass House"],
  ["Cause & Affect", "UK Bass"],
  ["Kyle Walker", "Tech House"],
  ["Sammy Virji", "UK Garage"],
  ["Taiki Nulight", "UK Bass"],
  ["Hex Cougar", "Bass House"],
  ["salute", "UK Garage"],
  ["Interplanetary Criminal", "UK Garage"],
  ["Skepsis", "Bassline"],
  ["Dr. Fresch", "House"],
  ["Walker & Royce", "Tech House"],
  ["Sacha Robotti", "Tech House"],
  ["Nikki Nair", "Bass"],
  ["Ardalan", "Tech House"],
  ["Justin Jay", "House"],
  ["Claude VonStroke", "Tech House"],
  ["Green Velvet", "Tech House"],
  ["Gorgon City", "House"],
  ["Duke Dumont", "House"],
  ["MK", "House"],
  ["Sonny Fodera", "House"],
  ["Chris Stussy", "Tech House"],
  ["Michael Bibi", "Tech House"],
  ["Skream", "Dubstep"],
  ["Excision", "Dubstep"],
  ["Subtronics", "Riddim"],
  ["Zeds Dead", "Dubstep"],
  ["Rezz", "Midtempo"],
  ["GRiZ", "Future Funk"],
  ["Flume", "Future Bass"],
  ["ODESZA", "Melodic"],
  ["Netsky", "Drum & Bass"],
  ["Andy C", "Drum & Bass"],
  ["Sub Focus", "Drum & Bass"],
  ["Wilkinson", "Drum & Bass"],
  ["Dimension", "Drum & Bass"],
  ["Chase & Status", "Drum & Bass"],
  ["Hybrid Minds", "Drum & Bass"],
  ["Culture Shock", "Drum & Bass"],
  ["Charlotte de Witte", "Techno"],
  ["Amelie Lens", "Techno"],
  ["Adam Beyer", "Techno"],
  ["Carl Cox", "Techno"],
  ["Boris Brejcha", "Techno"],
  ["ANNA", "Techno"],
  ["I Hate Models", "Techno"],
  ["Peggy Gou", "House"],
  ["Fred again..", "House"],
  ["Four Tet", "Electronic"],
  ["Bicep", "Electronic"],
  ["Disclosure", "House"],
  ["Jamie xx", "House"],
  ["Above & Beyond", "Trance"],
  ["Armin van Buuren", "Trance"],
  ["Seven Lions", "Melodic Dubstep"],
  ["Porter Robinson", "Electronic"],
  ["Madeon", "Electro House"],
  ["San Holo", "Future Bass"],
  ["What So Not", "Trap"],
  ["RL Grime", "Trap"],
  ["Baauer", "Trap"],
  ["TroyBoi", "Trap"],
  ["Ekali", "Trap"],
  ["NGHTMRE", "Trap"],
];

const TITLE_POOL = [
  "Momentum", "Vertex", "Afterglow", "Lowend", "Pyramid", "Overload",
  "Nightfall", "Cascade", "Voltage", "Sacrifice", "Mirage", "Tremor",
  "Gravity Well", "Neon Rain", "Hypnotic", "Detonate", "Serpent", "Echoes",
  "Rapture", "Warpath", "Sundown", "Frequency", "Obsidian", "Kinetic",
  "Phantom", "Riptide", "Zenith", "Cobra", "Vandal", "Slipstream",
];

const COVERS = [
  "#ff7a45", "#4fb0e0", "#ff7096", "#b0d24e", "#ffd24d", "#5cc7d6",
  "#c56cff", "#ff6f5e", "#8a7cff", "#45c7e0", "#ff5e5e", "#58c0ff",
];

function coverFor(seed: string): string {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return COVERS[h % COVERS.length];
}

function titleFor(i: number, k: number): string {
  return TITLE_POOL[(i * 3 + k) % TITLE_POOL.length];
}

const SET_KINDS = [
  { type: "radio" as const, title: "Essential Mix", source: "1001Tracklists" },
  { type: "festival" as const, title: "Festival Set", source: "1001Tracklists" },
  { type: "soundcloud" as const, title: "Guest Mix", source: "SoundCloud" },
];

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(12, 0, 0, 0);
  return d;
}

// One set per DJ, with a short representative tracklist covering all statuses.
function buildSet(name: string, genre: string, i: number): RawSet {
  const slug = slugify(name);
  const kind = SET_KINDS[i % SET_KINDS.length];
  const accent = coverFor(slug);
  const durationSec = 3600;
  const t1 = titleFor(i, 0);
  const t2 = titleFor(i, 1);
  const t3 = titleFor(i, 2);
  const prov = kind.type === "soundcloud" ? "soundcloud" : "1001tl";

  const entries: Omit<RawPlay, "position" | "timestamp">[] = [
    { idStatus: "identified", provenance: prov, trackTitle: t1, artistName: name },
    { idStatus: "identified", provenance: prov, trackTitle: t2, artistName: name },
    { idStatus: "unresolved_id", provenance: prov, idLabel: `${name} - ID`, suspectedArtist: name, rawText: `${name} - ID` },
    { idStatus: "community_resolved", provenance: "community", idLabel: "ID - ID", trackTitle: t3, artistName: name, rawText: "ID - ID" },
    { idStatus: "unparsed", provenance: prov, rawText: "unreleased dub (rip)" },
    { idStatus: "identified", provenance: "fingerprint", trackTitle: t1, artistName: name },
  ];
  const n = entries.length;
  const plays: RawPlay[] = entries.map((e, idx) => ({
    ...e,
    position: idx + 1,
    timestamp: Math.round((durationSec * (idx + 1)) / (n + 1)),
  }));

  return {
    sourceSlug: `${slug}-top-set`,
    title: kind.title,
    type: kind.type,
    genre,
    primaryArtist: { name, slug, accent },
    publishedAt: daysAgo(4 + i * 2),
    durationSec,
    sourceName: kind.source,
    cover: accent,
    plays,
  };
}

// One-time-ish backfill of the top-100 roster. Idempotent: sets are keyed by a
// stable `${slug}-top-set` slug, so re-runs skip everything already present.
export const topDjs: SourceAdapter = {
  id: "top-djs",
  label: "Top DJs backfill",
  async fetchRecent(): Promise<RawSet[]> {
    return TOP_100.map(([name, genre], i) => buildSet(name, genre, i));
  },
};
