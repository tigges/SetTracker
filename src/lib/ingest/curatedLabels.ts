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
