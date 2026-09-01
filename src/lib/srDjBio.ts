import { cleanBestKnownFor, displayDjBio } from "@/lib/djBio";

export type BioLinkKind = "dj" | "label" | "track" | "event";

export type BioLinkTarget = {
  kind: BioLinkKind;
  slug: string;
  name: string;
};

export type DjBioPart = {
  text: string;
  href?: string;
};

export type SrDjBio = {
  parts: DjBioPart[];
  full: string;
};

const QUOTE = /['‘]([^'’]{2,80})['’]/g;

function splitSentences(bio: string): string[] {
  return bio
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function quotedTitles(text: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const m of text.matchAll(QUOTE)) {
    const title = (m[1] ?? "").trim();
    const key = title.toLowerCase();
    if (!title || seen.has(key)) continue;
    seen.add(key);
    out.push(title);
  }
  return out;
}

function compact(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function hrefFor(hit: BioLinkTarget): string {
  if (hit.kind === "dj") return `/djs/${hit.slug}`;
  if (hit.kind === "label") return `/labels/${hit.slug}`;
  if (hit.kind === "track") return `/tracks/${hit.slug}`;
  return `/events/${hit.slug}`;
}

/** Longest catalog name first. Skip this DJ and tiny tokens. */
export function linkifyBioText(
  text: string,
  catalog: readonly BioLinkTarget[],
  opts?: { skipSlugs?: readonly string[] },
): DjBioPart[] {
  const skip = new Set((opts?.skipSlugs ?? []).map((s) => s.toLowerCase()));
  const names = catalog
    .filter((c) => !skip.has(c.slug.toLowerCase()) && c.name.trim().length >= 3)
    .slice()
    .sort((a, b) => b.name.length - a.name.length);
  if (!text) return [];
  if (!names.length) return [{ text }];

  const parts: DjBioPart[] = [];
  let rest = text;
  while (rest) {
    let best: { at: number; hit: BioLinkTarget } | null = null;
    for (const hit of names) {
      const at = rest.toLowerCase().indexOf(hit.name.toLowerCase());
      if (at < 0) continue;
      const before = rest[at - 1] ?? " ";
      const after = rest[at + hit.name.length] ?? " ";
      if (/\w/.test(before) || /\w/.test(after)) continue;
      if (!best || at < best.at || (at === best.at && hit.name.length > best.hit.name.length)) {
        best = { at, hit };
      }
    }
    if (!best) {
      parts.push({ text: rest });
      break;
    }
    if (best.at > 0) parts.push({ text: rest.slice(0, best.at) });
    parts.push({
      text: rest.slice(best.at, best.at + best.hit.name.length),
      href: hrefFor(best.hit),
    });
    rest = rest.slice(best.at + best.hit.name.length);
  }
  return parts;
}

function factsLine(
  full: string,
  catalog: readonly BioLinkTarget[],
  skipSlugs: readonly string[],
): string | null {
  const skip = new Set(skipSlugs.map((s) => s.toLowerCase()));
  const titles = quotedTitles(full).slice(0, 3);
  const people = catalog
    .filter((c) => c.kind === "dj" && !skip.has(c.slug.toLowerCase()))
    .filter((c) => new RegExp(`\\b${c.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(full))
    .sort((a, b) => b.name.length - a.name.length)
    .slice(0, 2);
  const labels = catalog
    .filter((c) => c.kind === "label")
    .filter((c) => new RegExp(`\\b${c.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(full))
    .slice(0, 1);
  const bits: string[] = [];
  if (titles[0]) {
    const withWho = people[0] ? ` with ${people[0].name}` : "";
    bits.push(`‘${titles[0]}’${withWho}`);
    if (titles[1]) bits.push(`‘${titles[1]}’`);
  } else if (people[0]) {
    bits.push(people[0].name);
  }
  if (labels[0]) bits.push(labels[0].name);
  if (!bits.length) return null;
  const line = bits.join(" · ");
  return line.length >= 3 ? line : null;
}

/**
 * Short setradar line: first sentence = Best known for.
 * Optional second line names titles / collabs / labels for links.
 */
export function srDjBio(
  bio: string | null | undefined,
  catalog: readonly BioLinkTarget[] = [],
  opts?: { genre?: string | null; homeCity?: string | null; skipSlugs?: readonly string[] },
): SrDjBio | null {
  const full = displayDjBio(bio, { genre: opts?.genre, homeCity: opts?.homeCity });
  if (!full) return null;
  const firstRaw = String(bio)
    .trim()
    .split(/(?<=[.!?])\s+/)[0] ?? "";
  const first =
    cleanBestKnownFor(firstRaw) ??
    displayDjBio(firstRaw, { genre: opts?.genre, homeCity: opts?.homeCity }) ??
    splitSentences(full)[0];
  if (!first) return null;
  const skip = opts?.skipSlugs ?? [];
  const facts = factsLine(full, catalog, skip);
  const head = first.replace(/[.!?]$/, "");
  const skipOpts = { skipSlugs: skip };
  const parts = linkifyBioText(`${head}.`, catalog, skipOpts);
  if (facts && !head.toLowerCase().includes(facts.slice(0, 12).toLowerCase())) {
    parts.push({ text: " " }, ...linkifyBioText(`${facts}.`, catalog, skipOpts));
  }
  return {
    parts,
    full,
  };
}

export function catalogMatchesName(
  name: string,
  catalog: readonly BioLinkTarget[],
): BioLinkTarget | null {
  const key = compact(name);
  if (key.length < 3) return null;
  return (
    catalog.find((c) => compact(c.name) === key) ??
    catalog.find((c) => compact(c.name).includes(key) || key.includes(compact(c.name))) ??
    null
  );
}
