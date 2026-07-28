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
  ["Chris Lorenzo", "Tech House"],
  ["Hannah Wants", "Tech House"],
  ["AC Slater", "Bass House"],
  ["Wax Motif", "G-House"],
  ["Jauz", "Bass House"],
  ["Habstrakt", "Bass House"],
  ["Dombresky", "House"],
  ["CID", "Tech House"],
  ["Marten Horger", "Bass House"],
  ["Matroda", "Bass House"],
  ["Gettoblaster", "Ghetto House"],
  ["BIJOU", "G-House"],
  ["Westend", "Tech House"],
  ["VNSSA", "Bass House"],
  ["Volac", "Bass House"],
  ["bradeazy", "Bass House"],
  ["Cause & Affect", "Bass House"],
  ["Kyle Walker", "Tech House"],
  ["Sammy Virji", "UK Garage"],
  ["Taiki Nulight", "Bass House"],
  ["Hex Cougar", "Bass House"],
  ["salute", "UK Garage"],
  ["Interplanetary Criminal", "UK Garage"],
  ["Skepsis", "Bassline"],
  ["Dr. Fresch", "House"],
  ["Walker & Royce", "Tech House"],
  ["Sacha Robotti", "Tech House"],
  ["Nikki Nair", "Bass House"],
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
  ["Four Tet", "House"],
  ["Bicep", "House"],
  ["Disclosure", "House"],
  ["Jamie xx", "House"],
  ["Above & Beyond", "Trance"],
  ["Armin van Buuren", "Trance"],
  ["Seven Lions", "Melodic Dubstep"],
  ["Porter Robinson", "House"],
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

// A shared catalog of (title, artist) so generated mixes are realistically
// multi-artist and reuse tracks across sets (good for label / most-played stats).
const CATALOG: { title: string; artist: string }[] = TOP_100.flatMap(([name], j) => [
  { title: TITLE_POOL[(j * 2) % TITLE_POOL.length], artist: name },
  { title: TITLE_POOL[(j * 2 + 1) % TITLE_POOL.length], artist: name },
]);

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

// One set per DJ — a full, realistic mix (~18-22 multi-artist tracks) covering
// all four statuses, with the DJ's own tracks opening the set.
function buildSet(name: string, genre: string, i: number): RawSet {
  const slug = slugify(name);
  const kind = SET_KINDS[i % SET_KINDS.length];
  const accent = coverFor(slug);
  const durationSec = kind.type === "festival" ? 3900 : 3600;
  const prov = kind.type === "soundcloud" ? "soundcloud" : "1001tl";
  const ownA = CATALOG[(2 * i) % CATALOG.length];
  const ownB = CATALOG[(2 * i + 1) % CATALOG.length];
  const n = 18 + (i % 5); // 18..22 tracks

  const entries: Omit<RawPlay, "position" | "timestamp">[] = [];
  for (let j = 0; j < n; j++) {
    const cat = CATALOG[(i * 7 + j * 13) % CATALOG.length];
    if (j === 0) {
      entries.push({ idStatus: "identified", provenance: prov, trackTitle: ownA.title, artistName: name });
    } else if (j === 1) {
      entries.push({ idStatus: "identified", provenance: prov, trackTitle: ownB.title, artistName: name });
    } else if (j % 7 === 6) {
      entries.push({ idStatus: "unresolved_id", provenance: prov, idLabel: `${cat.artist} - ID`, suspectedArtist: cat.artist, rawText: `${cat.artist} - ID` });
    } else if (j % 9 === 4) {
      entries.push({ idStatus: "community_resolved", provenance: "community", idLabel: "ID - ID", trackTitle: cat.title, artistName: cat.artist, rawText: "ID - ID" });
    } else if (j % 11 === 10) {
      entries.push({ idStatus: "unparsed", provenance: prov, rawText: "unreleased dub (rip)" });
    } else {
      entries.push({ idStatus: "identified", provenance: j % 8 === 5 ? "fingerprint" : prov, trackTitle: cat.title, artistName: cat.artist });
    }
  }

  const nn = entries.length;
  const plays: RawPlay[] = entries.map((e, idx) => ({
    ...e,
    position: idx + 1,
    timestamp: Math.round((durationSec * (idx + 1)) / (nn + 1)),
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
