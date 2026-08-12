/**
 * Build the operator "next 10 captures" queue from catalog gaps.
 *
 * Sources (offline, no DB required):
 * 1. Curated priority assists (Street Parade remainder, Relive captures)
 * 2. Top100 missing/thin tracks matched to curated YT slugs
 * 3. Density-severe YouTube sets not yet 1001-mapped
 *
 * Output consumed by /capture-1001 (server → client props).
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { TRACKLIST_1001_BY_SOURCE_SLUG } from "./tracklists1001/festival2026";

export type CapturePreset = {
  label: string;
  slug: string;
  name: string;
  searchUrl: string;
  /** Known 1001 tracklist page (preferred over searchUrl when set). */
  tracklistUrl?: string;
  /** Why this row was queued */
  reason?: string;
};

export function search1001(...parts: string[]): string {
  const q = [...parts, "site:1001tracklists.com"].join(" ");
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
}

/** Hand-curated high-value assists (official YT, 1001 TBD). */
export const PRIORITY_CAPTURES: CapturePreset[] = [
  {
    label: "PAN-POT · Street Parade",
    slug: "yt-LpFxQmtEeAA",
    name: "TL_PAN_POT_STREET_PARADE_2025",
    searchUrl: search1001(
      "pan-pot",
      "opera stage",
      "street parade",
      "zurich",
      "2025-08-09",
    ),
    tracklistUrl:
      "https://www.1001tracklists.com/tracklist/1sftnn01/pan-pot-opera-stage-street-parade-zurich-switzerland-2025-08-09.html",
    reason: "priority:street-parade-gap",
  },
  {
    label: "HoneyLuv · Street Parade",
    slug: "yt-WTN5ru2ceRE",
    name: "TL_HONEYLUV_STREET_PARADE_2025",
    searchUrl: search1001(
      "honeyluv",
      "street parade",
      "zurich",
      "2025-08-09",
    ),
    tracklistUrl:
      "https://www.1001tracklists.com/tracklist/2ncvv7l1/honeyluv-center-stage-street-parade-zurich-switzerland-2025-08-09.html",
    reason: "priority:street-parade-gap",
  },
  {
    label: "Zamna Soundsystem · Street Parade",
    slug: "yt-1Mp9Pl6YgDM",
    name: "TL_ZAMNA_STREET_PARADE_2025",
    searchUrl: search1001(
      "zamna",
      "street parade",
      "zurich",
      "2025-08-09",
    ),
    reason: "priority:street-parade-gap",
  },
  {
    label: "Plastik Funk · Nature One",
    slug: "yt-dEX8Y8Mzkok",
    name: "TL_PLASTIK_FUNK_NATURE_ONE_2025",
    searchUrl: search1001("plastik funk", "nature one", "2025"),
    reason: "priority:top100-missing-tracks",
  },
  {
    label: "Mike Williams · Tomorrowland WE2",
    slug: "yt-WnjXXOZ8Te8",
    name: "TL_MIKE_WILLIAMS_TML_WE2_2026",
    searchUrl: search1001(
      "mike williams",
      "tomorrowland",
      "weekend 2",
      "2026",
    ),
    reason: "priority:top100-missing-tracks",
  },
  {
    label: "Peggy Gou · Cercle Lille",
    slug: "yt--UOMvxh4MYU",
    name: "TL_PEGGY_GOU_CERCLE_LILLE",
    searchUrl: search1001("peggy gou", "cercle", "lille", "palais"),
    reason: "priority:top100-thin",
  },
  {
    label: "Boris Brejcha · Tomorrowland WE1",
    slug: "yt-NpL_bT5vgmU",
    name: "TL_BORIS_BREJCHA_TML_WE1_2026",
    searchUrl: search1001(
      "boris brejcha",
      "mainstage",
      "tomorrowland",
      "weekend 1",
      "2026",
    ),
    reason: "priority:top100-thin",
  },
  {
    label: "Sebastian Ingrosso · Tomorrowland WE2",
    slug: "yt-g4vR2VlhNtk",
    name: "TL_SEBASTIAN_INGROSSO_TML_WE2_2026",
    searchUrl: search1001(
      "sebastian ingrosso",
      "tomorrowland",
      "weekend 2",
      "2026",
    ),
    reason: "priority:official-relive",
  },
  {
    label: "Miss Monique · BIORHYTHM",
    slug: "yt-1LpQZ5GTRDg",
    name: "TL_MISS_MONIQUE_BIORHYTHM",
    searchUrl: search1001("miss monique", "biorhythm"),
    reason: "priority:artist-upload",
  },
  {
    label: "John Summit · Lollapalooza",
    slug: "yt-9TKqqBCmDHA",
    name: "TL_JOHN_SUMMIT_LOLLAPALOOZA",
    searchUrl: search1001("john summit", "lollapalooza"),
    reason: "priority:festival-set",
  },
];

/** Held 1001 seeds waiting on official Relive — do not queue fan clips. */
export const HELD_RELIVE_WATCH: {
  name: string;
  seed: string;
  match: RegExp;
  search: string[];
}[] = [
  {
    name: "Calvin Harris · TML WE2",
    seed: "TL_CALVIN_HARRIS_TML_WE2_2026",
    match: /calvin\s*harris/i,
    search: ["calvin harris", "tomorrowland", "weekend 2", "2026"],
  },
  {
    name: "Chris Lorenzo · TML WE2",
    seed: "TL_CHRIS_LORENZO_TML_WE2_2026",
    match: /chris\s*lorenzo/i,
    search: ["chris lorenzo", "tomorrowland", "weekend 2", "2026"],
  },
  {
    name: "Sonny Fodera · TML WE2",
    seed: "TL_SONNY_FODERA_TML_WE2_2026",
    match: /sonny\s*fodera/i,
    search: ["sonny fodera", "tomorrowland", "weekend 2", "2026"],
  },
  {
    name: "Darren Styles · TML WE2",
    seed: "TL_DARREN_STYLES_TML_WE2_2026",
    match: /darren\s*styles/i,
    search: ["darren styles", "tomorrowland", "weekend 2", "2026"],
  },
  {
    name: "Dyzen · TML WE2",
    seed: "TL_DYZEN_TML_WE2_2026",
    match: /\bdyzen\b/i,
    search: ["dyzen", "tomorrowland", "weekend 2", "2026"],
  },
  {
    name: "Holy Priest · TML WE1",
    seed: "TL_HOLY_PRIEST_TML_WE1_2026",
    match: /holy\s*priest/i,
    search: ["holy priest", "tomorrowland", "weekend 1", "2026"],
  },
];

type DensityRow = {
  slug?: string;
  title?: string;
  primaryDj?: string;
  severity?: string;
};

type Top100Row = {
  rank: number;
  name: string;
  slug: string;
  sets: number;
  tracks: number;
  missingTracks?: boolean;
};

function mappedSlugs(): Set<string> {
  return new Set(Object.keys(TRACKLIST_1001_BY_SOURCE_SLUG));
}

function tlNameFromLabel(label: string): string {
  return (
    "TL_" +
    label
      .replace(/[·|@]/g, " ")
      .replace(/[^a-zA-Z0-9]+/g, "_")
      .replace(/^_|_$/g, "")
      .toUpperCase()
  );
}

function loadDensityYtSevere(cwd: string): CapturePreset[] {
  const paths = [
    join(cwd, "data/crosscheck/set-density.json"),
    join(cwd, "data/crosscheck/set-density-live.json"),
  ];
  const out: CapturePreset[] = [];
  for (const p of paths) {
    if (!existsSync(p)) continue;
    try {
      const d = JSON.parse(readFileSync(p, "utf8")) as {
        severeEmpty?: DensityRow[];
        severeSparse?: DensityRow[];
      };
      for (const row of [...(d.severeEmpty ?? []), ...(d.severeSparse ?? [])]) {
        const slug = row.slug?.trim();
        if (!slug?.startsWith("yt-")) continue;
        const dj = row.primaryDj || "Unknown";
        const title = (row.title || slug).slice(0, 80);
        out.push({
          label: `${dj} · density gap`,
          slug,
          name: tlNameFromLabel(dj),
          searchUrl: search1001(dj, title.replace(/\|/g, " ").slice(0, 60)),
          reason: `density:${row.severity ?? "severe"}`,
        });
      }
      break;
    } catch {
      /* try next */
    }
  }
  return out;
}

function loadTop100Gaps(cwd: string): { slug: string; name: string; tracks: number }[] {
  const p = join(cwd, "data/crosscheck/top100-coverage.json");
  if (!existsSync(p)) return [];
  try {
    const t = JSON.parse(readFileSync(p, "utf8")) as { rows?: Top100Row[] };
    return (t.rows ?? [])
      .filter((r) => r.missingTracks || (r.sets > 0 && r.tracks < 8))
      .map((r) => ({ slug: r.slug, name: r.name, tracks: r.tracks }));
  } catch {
    return [];
  }
}

/**
 * Build up to `limit` capture presets, priority first, then density gaps
 * that aren't already 1001-mapped.
 */
export function buildNextCaptures(
  opts: { cwd?: string; limit?: number } = {},
): CapturePreset[] {
  const cwd = opts.cwd ?? process.cwd();
  const limit = opts.limit ?? 10;
  const mapped = mappedSlugs();
  const seen = new Set<string>();
  const out: CapturePreset[] = [];

  const push = (p: CapturePreset) => {
    if (seen.has(p.slug) || mapped.has(p.slug)) return;
    if (out.length >= limit) return;
    seen.add(p.slug);
    out.push(p);
  };

  for (const p of PRIORITY_CAPTURES) push(p);

  // Prefer density gaps whose primary DJ is Top100 thin/missing.
  const topGaps = loadTop100Gaps(cwd);
  const topNames = new Set(topGaps.map((g) => g.name.toLowerCase()));
  const density = loadDensityYtSevere(cwd);
  const densityTop = density.filter(
    (d) =>
      d.label &&
      [...topNames].some((n) => d.label.toLowerCase().includes(n.split(" ")[0]!)),
  );
  for (const p of densityTop) push(p);
  for (const p of density) push(p);

  return out.slice(0, limit);
}

export type HeldReliveReport = {
  generatedAt: string;
  held: {
    name: string;
    seed: string;
    searchUrl: string;
    status: "waiting" | "candidate";
    note: string;
  }[];
};

/** Offline held-seed watch report (operator finds Relive, then wires). */
export function buildHeldReliveWatch(): HeldReliveReport {
  return {
    generatedAt: new Date().toISOString(),
    held: HELD_RELIVE_WATCH.map((h) => ({
      name: h.name,
      seed: h.seed,
      searchUrl: search1001(...h.search, "relive", "youtube"),
      status: "waiting" as const,
      note: "Do not wire fan clips — wait for official Tomorrowland/artist Relive.",
    })),
  };
}
