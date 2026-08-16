/**
 * Curated record-label roster (Beatstats / dance-chart imprints + seed staples).
 * Upserted on seed and thumbs so the Labels directory stays populated even
 * before tracklists attach releases.
 */

import { labelSocials } from "../social";
import { slugify } from "./types";

export type CuratedLabel = {
  name: string;
  /** Override slugify(name) when a shorter/stable slug is preferred. */
  slug?: string;
  color?: string;
};

const PALETTE = [
  "#f5a623",
  "#e0338a",
  "#4bd0c0",
  "#7c5cff",
  "#2bd67b",
  "#ff6b3d",
  "#ff2d55",
  "#3aa0e0",
  "#f4c560",
  "#8a7cff",
  "#45c7e0",
  "#ff6fb0",
  "#d7dde2",
  "#ff7a45",
  "#97a0b0",
];

function withColors(entries: CuratedLabel[]): CuratedLabel[] {
  return entries.map((e, i) => ({
    ...e,
    color: e.color ?? PALETTE[i % PALETTE.length],
  }));
}

/** Seed staples + house/tech imprints from Beatstats top ~100. */
export const CURATED_LABELS: CuratedLabel[] = withColors([
  // ---- Existing seed / catalog staples ----
  { name: "Night Bass", slug: "nightbass", color: "#f5a623" },
  { name: "Confession", slug: "confession", color: "#e0338a" },
  { name: "Black Book Records", slug: "blackbook", color: "#d7dde2" },
  { name: "Divided Souls", slug: "divided", color: "#4bd0c0" },
  { name: "bitbird", slug: "bitbird", color: "#7c5cff" },
  { name: "Monstercat", slug: "monstercat", color: "#2bd67b" },
  { name: "House of Hustle", slug: "houseofhustle", color: "#ff6b3d" },
  { name: "Insomniac Records", slug: "insomniac", color: "#ff2d55" },
  { name: "DIRTYBIRD", slug: "dirtybird", color: "#f2b33d" },
  { name: "Realm Records", slug: "realm-records", color: "#8a7cff" },
  { name: "STEREOHYPE", slug: "stereohype", color: "#ff3d6e" },

  // ---- Beatstats / Beatport top-chart imprints (approx. ranks 1–47) ----
  { name: "Defected", slug: "defected", color: "#e10600" },
  { name: "Toolroom", slug: "toolroom", color: "#111111" },
  { name: "Experts Only", slug: "experts-only", color: "#222222" },
  { name: "Hot Creations", slug: "hot-creations", color: "#ff4d00" },
  { name: "Glitterbox Recordings", slug: "glitterbox-recordings", color: "#ff2d95" },
  { name: "Cecille", slug: "cecille", color: "#c8a2ff" },
  // Beatportal House 2025 #4 label
  { name: "Disorder", slug: "disorder", color: "#ff3355" },
  { name: "Rekids", slug: "rekids", color: "#2bd67b" },
  { name: "Nervous Records", slug: "nervous-records", color: "#ffcc00" },
  { name: "LTF Records", slug: "ltf-records", color: "#4bd0c0" },
  { name: "Solid Grooves", slug: "solid-grooves", color: "#ff6b3d" },
  { name: "Drumcode", slug: "drumcode", color: "#ff0000" },
  { name: "Afterlife", slug: "afterlife", color: "#9b8cff" },
  { name: "Anjunadeep", slug: "anjunadeep", color: "#3d7eff" },
  { name: "Anjunabeats", slug: "anjunabeats", color: "#1a4bff" },
  { name: "Diynamic", slug: "diynamic", color: "#e8ff00" },
  // Berlin imprint (Beatport 12792, keinemusik.bandcamp.com, KM071 Say What).
  // Collective is also DJ Mag #20 — radio guests are not this label.
  { name: "Keinemusik", slug: "keinemusik", color: "#e8c547" },
  { name: "Innervisions", slug: "innervisions", color: "#111111" },
  { name: "Spinnin' Records", slug: "spinnin-records", color: "#ff6a00" },
  { name: "Musical Freedom", slug: "musical-freedom", color: "#00c2ff" },
  { name: "Protocol Recordings", slug: "protocol-recordings", color: "#7c5cff" },
  { name: "Revealed Recordings", slug: "revealed-recordings", color: "#ff2d55" },
  { name: "Armada Music", slug: "armada-music", color: "#00a3e0" },
  { name: "Size Records", slug: "size-records", color: "#d7dde2" },
  { name: "FFRR", slug: "ffrr", color: "#ff3d6e" },
  { name: "Ultra Records", slug: "ultra-records", color: "#00e5ff" },
  { name: "STMPD RCRDS", slug: "stmpd-rcrds", color: "#111111" },
  { name: "Helix Records", slug: "helix-records", color: "#45c7e0" },
  { name: "Higher Ground", slug: "higher-ground", color: "#7c5cff" },
  { name: "Mad Decent", slug: "mad-decent", color: "#ff6b84" },
  { name: "Deadbeats", slug: "deadbeats", color: "#b48cff" },
  { name: "mau5trap", slug: "mau5trap", color: "#00ff9c" },
  { name: "Owsla", slug: "owsla", color: "#f5a623" },
  // Steve Aoki's imprint — official dimmak.com
  { name: "Dim Mak", slug: "dim-mak", color: "#e31c23" },
  { name: "Astralwerks", slug: "astralwerks", color: "#c6cfda" },
  { name: "Kompakt", slug: "kompakt", color: "#ff7a45" },
  { name: "Relief Records", slug: "relief-records", color: "#4bd0c0" },
  { name: "Trax Records", slug: "trax-records", color: "#ff2d55" },
  { name: "DFTD", slug: "dftd", color: "#e10600" },
  { name: "Solomun+1", slug: "solomun-1", color: "#e8ff00" },
  { name: "Saved Records", slug: "saved-records", color: "#ff6b3d" },
  { name: "Culprit", slug: "culprit", color: "#8a7cff" },
  { name: "Circus Recordings", slug: "circus-recordings", color: "#45c7e0" },
  { name: "Pets Recordings", slug: "pets-recordings", color: "#f4c560" },
  { name: "Get Physical Music", slug: "get-physical-music", color: "#ff2d55" },
  { name: "Exploited", slug: "exploited", color: "#111111" },

  // ---- Beatstats chart imprints (approx. ranks 48–100) ----
  { name: "Funkiman" },
  { name: "Crosstown Rebels" },
  { name: "Creamfields Recordings" },
  { name: "Paraiso" },
  { name: "You&Me Records", slug: "you-me-records" },
  { name: "Classic Music Company" },
  { name: "Botaniq" },
  { name: "MVSON" },
  { name: "Ministry of Sound Recordings", slug: "ministry-of-sound-recordings" },
  { name: "Jackies Music Records" },
  { name: "Arms & Legs" },
  { name: "Elrow Music" },
  { name: "Elrow Limited" },
  { name: "Verve" },
  { name: "Range.", slug: "range" },
  { name: "Make The Girls Dance Records" },
  { name: "Who Plays" },
  { name: "Maccabi House" },
  { name: "Coffee Cola" },
  { name: "MoBlack Records", slug: "moblack-records" },
  { name: "Cajual" },
  { name: "PVCLB" },
  { name: "Koltrax" },
  { name: "There Was Jack" },
  { name: "Scenarios" },
  { name: "Petit Comite of House" },
  { name: "Deeperfect" },
  { name: "Soulfuric Trax" },
  { name: "South" },
  { name: "Maison Arts" },
  { name: "Nothing Else Matters" },
  { name: "Robots & Humans" },
  { name: "Hell Beach" },
  { name: "When Stars Align" },
  { name: "Steel City Dance Discs" },
  { name: "Dance Traxx LDN" },
  { name: "Dawn Patrol Records" },
  { name: "Trust Recordings" },
  { name: "Heavy House Society" },
  { name: "Snatch! Records", slug: "snatch-records" },
  { name: "Metamorfosi Records" },
  { name: "Heist Recordings" },
  { name: "Chaos" },
  { name: "Moxy Muzik" },
  { name: "Knee Deep In Sound" },
  { name: "Noisetraxx" },
  { name: "PutYouOn Music Group" },
  { name: "Soulfuric Deep" },
]);

export const CURATED_LABEL_SLUGS: ReadonlySet<string> = new Set(
  CURATED_LABELS.map((l) => l.slug ?? slugify(l.name)),
);

export function curatedLabelSlug(entry: CuratedLabel): string {
  return entry.slug ?? slugify(entry.name);
}

type LabelClient = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  label: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    findUnique: (...args: any[]) => Promise<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    create: (...args: any[]) => Promise<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    update: (...args: any[]) => Promise<any>;
  };
};

/**
 * Upsert curated labels. Fills missing color/socials; never clears imageUrl.
 */
export async function ensureCuratedLabels(
  prisma: LabelClient,
): Promise<{ created: number; updated: number }> {
  let created = 0;
  let updated = 0;

  for (const entry of CURATED_LABELS) {
    const slug = curatedLabelSlug(entry);
    const socials = {
      ...labelSocials(entry.name),
      ...(labelSocials(slug).website || labelSocials(slug).soundcloud
        ? labelSocials(slug)
        : {}),
    };
    const existing = await prisma.label.findUnique({ where: { slug } });
    if (!existing) {
      await prisma.label.create({
        data: {
          slug,
          name: entry.name,
          color: entry.color ?? null,
          ...socials,
        },
      });
      created += 1;
      continue;
    }

    const data: {
      name?: string;
      color?: string;
      website?: string | null;
      soundcloud?: string | null;
      instagram?: string | null;
    } = {};
    if (existing.name !== entry.name) data.name = entry.name;
    if (!existing.color && entry.color) data.color = entry.color;
    if (!existing.website && socials.website) data.website = socials.website;
    if (!existing.soundcloud && socials.soundcloud)
      data.soundcloud = socials.soundcloud;
    if (!existing.instagram && socials.instagram)
      data.instagram = socials.instagram;
    if (Object.keys(data).length > 0) {
      await prisma.label.update({ where: { id: existing.id }, data });
      updated += 1;
    }
  }

  return { created, updated };
}
