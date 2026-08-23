/**
 * Producer / Claude completeness pins (thumbs + official URLs).
 * Fill-null on Dj / Event via verify-urls / Pages. Never invents @slug.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { PrismaClient } from "@prisma/client";
import { normalizeGenre } from "../genre";
import { isWeakOfficialUrl } from "../officialUrls";
import { youtubeChannelUrl } from "../social";
import { remapAtomicActHalfSlug, remapAtomicActPin } from "./atomicActs";
import { evaluateHomeCity } from "./discovery/llmJobs";
import { normalizeSocialUrl } from "./eventSocials";

export type EntityCompleteKind = "dj" | "festival" | "club";

export type EntityCompleteField =
  | "imageUrl"
  | "website"
  | "instagram"
  | "youtube"
  | "soundcloud"
  | "twitter"
  | "homeCity"
  | "bio"
  | "genre";

export type EntityCompletePin = {
  kind: EntityCompleteKind;
  slug: string;
  imageUrl?: string;
  website?: string;
  instagram?: string;
  youtube?: string;
  soundcloud?: string;
  twitter?: string;
  homeCity?: string;
  bio?: string;
  genre?: string;
};

export type EntityCompleteAuditRow = {
  kind: string;
  slug: string;
  name: string;
  field: string;
  value: string;
  evidence: string;
};

export type EntityCompleteDrop = {
  kind: string;
  slug: string;
  field: string;
  reason: string;
};

const PINS_PATH = join(process.cwd(), "data/entity-complete-pins.json");

const KINDS = new Set<EntityCompleteKind>(["dj", "festival", "club"]);
const FIELDS = new Set<EntityCompleteField>([
  "imageUrl",
  "website",
  "instagram",
  "youtube",
  "soundcloud",
  "twitter",
  "homeCity",
  "bio",
  "genre",
]);

const PROFILE_FIELDS = new Set<EntityCompleteField>([
  "homeCity",
  "bio",
  "genre",
]);

const WEAK_WEBSITE_HUB =
  /linktr\.ee|mixcloud\.com|hearthis\.at|\.gov\b|music\.youtube\.com/i;

const TEMPLATE_BIO =
  /is an? (?:.+based )?DJ, producer or electronic artist whose work centers on/i;

const GENERIC_HANDLE_LEFTOVER =
  /^(the|its|itsthe|official|real|dj|music|live|tv|hq|ok|iam|im|weare|and|com|dot|dotcom)*$/;

const WIDE_FIELD_MAP: Record<string, EntityCompleteField> = {
  imageurl: "imageUrl",
  website: "website",
  instagram: "instagram",
  youtube: "youtube",
  soundcloud: "soundcloud",
  twitter: "twitter",
  location: "homeCity",
  homecity: "homeCity",
  "short bio": "bio",
  bio: "bio",
  genre: "genre",
};

const CANNOT_CONFIRM = /cannot confirm|no published links|unsure/i;

export function decodeMojibake(value: string): string {
  if (!/[ÃÂ]/.test(value) && !/â[€™]/.test(value)) return value;
  try {
    return Buffer.from(value, "latin1").toString("utf8");
  } catch {
    return value;
  }
}

export function parseEntityCompleteCsv(text: string): EntityCompleteAuditRow[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const rows: EntityCompleteAuditRow[] = [];
  let header: string[] | null = null;
  for (const line of lines) {
    if (!line.trim()) continue;
    const cells = splitCsvLine(line).map((c) => decodeMojibake(c.trim()));
    if (!header && cells[0] === "kind" && cells[1] === "slug") {
      header = cells.map((c) => c.toLowerCase());
      continue;
    }
    if (header && header.includes("setcount")) {
      rows.push(...wideRowToAudit(header, cells));
      continue;
    }
    rows.push({
      kind: (cells[0] ?? "").trim(),
      slug: (cells[1] ?? "").trim(),
      name: (cells[2] ?? "").trim(),
      field: (cells[3] ?? "").trim(),
      value: (cells[4] ?? "").trim(),
      evidence: (cells[5] ?? "").trim(),
    });
  }
  return rows;
}

function wideRowToAudit(header: string[], cells: string[]): EntityCompleteAuditRow[] {
  const get = (name: string) => {
    const i = header.indexOf(name);
    return i >= 0 ? (cells[i] ?? "").trim() : "";
  };
  const kind = get("kind");
  const slug = get("slug");
  const name = get("name");
  const out: EntityCompleteAuditRow[] = [];
  for (let i = 0; i < header.length; i++) {
    const field = WIDE_FIELD_MAP[header[i] ?? ""];
    const value = (cells[i] ?? "").trim();
    if (!field || !value) continue;
    out.push({
      kind,
      slug,
      name,
      field,
      value,
      evidence: "producer completeness csv 2026-08-23",
    });
  }
  return out;
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      quoted = true;
      continue;
    }
    if (ch === ",") {
      cells.push(cell);
      cell = "";
      continue;
    }
    cell += ch;
  }
  cells.push(cell);
  return cells;
}

export function coreName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function handleHaystack(value: string): string {
  try {
    const u = new URL(value);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (
      /(^|\.)(youtube|youtu\.be|instagram|soundcloud|twitter|x)\.com$/.test(host) ||
      host === "youtu.be" ||
      host === "x.com"
    ) {
      return coreName(u.pathname);
    }
    return coreName(`${host} ${u.pathname}`);
  } catch {
    return coreName(value);
  }
}

function leftoverAfterName(nameKey: string, handleKey: string): string {
  return handleKey.split(nameKey).join("");
}

/** Extra tokens after the name must be generic (music/official), not another act. */
export function handleLeftoverOk(name: string, value: string): boolean {
  const handleKey = handleHaystack(value);
  const nameKey = coreName(name);
  if (!handleKey) return false;
  let leftover = handleKey;
  if (nameKey && handleKey.includes(nameKey)) {
    leftover = leftoverAfterName(nameKey, handleKey);
  } else {
    const tokens = name
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length >= 2);
    if (!tokens.length) return false;
    for (const t of tokens) leftover = leftover.split(t).join("");
  }
  return GENERIC_HANDLE_LEFTOVER.test(leftover);
}

/** Handle or host must overlap the catalog name (never @slug guesses). */
export function nameOverlapsHandle(name: string, value: string): boolean {
  const nameKey = coreName(name);
  if (nameKey.length < 3) return false;
  const handleKey = handleHaystack(value);
  const tokens = name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2);
  const tokenHit =
    tokens.length >= 2 && tokens.every((t) => handleKey.includes(t));
  const coreHit =
    handleKey.includes(nameKey) ||
    nameKey.includes(handleKey) ||
    (nameKey.length >= 5 && handleKey.includes(nameKey));
  if (!coreHit && !tokenHit) return false;
  return handleLeftoverOk(name, value);
}

export function isHttpsImageUrl(url: string): boolean {
  if (!/^https:\/\//i.test(url) || /^data:/i.test(url)) return false;
  if (isWeakOfficialUrl(url)) return false;
  return (
    /yt3\.googleusercontent\.com|i\.ytimg\.com|cloudfront\.net|upload\.wikimedia\.org|commons\.wikimedia\.org/i.test(
      url,
    ) || /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(url)
  );
}

export function evaluateEntityCompleteRow(row: EntityCompleteAuditRow): {
  field?: EntityCompleteField;
  value?: string;
  drop?: string;
} {
  if (!KINDS.has(row.kind as EntityCompleteKind)) {
    return { drop: "unknown kind" };
  }
  if (!row.slug) return { drop: "missing slug" };
  if (CANNOT_CONFIRM.test(row.evidence)) return { drop: "cannot confirm" };
  if (!row.field || !row.value) return { drop: "empty field" };
  if (!FIELDS.has(row.field as EntityCompleteField)) {
    return { drop: "unknown field" };
  }
  const field = row.field as EntityCompleteField;
  if (row.kind !== "dj" && field === "youtube") {
    return { drop: "event has no youtube column" };
  }
  if (row.kind !== "dj" && PROFILE_FIELDS.has(field)) {
    return { drop: "profile field is DJ-only" };
  }

  if (field === "imageUrl") {
    if (!isHttpsImageUrl(row.value)) return { drop: "image url not allowed" };
    return { field, value: row.value };
  }

  if (field === "homeCity") {
    const city = evaluateHomeCity(row.name, row.value);
    if (!city.ok || !city.value) return { drop: city.reason };
    return { field, value: city.value };
  }

  if (field === "bio") {
    const bio = decodeMojibake(row.value).replace(/\s+/g, " ").trim();
    if (bio.length < 24) return { drop: "bio too short" };
    if (TEMPLATE_BIO.test(bio)) return { drop: "template bio" };
    if (/[ÃÂ\uFFFD]/.test(bio)) return { drop: "bio encoding" };
    return { field, value: bio };
  }

  if (field === "genre") {
    const genre = normalizeGenre(row.value);
    if (!genre) return { drop: "genre not canonical" };
    return { field, value: genre };
  }

  if (field === "website") {
    const n = normalizeSocialUrl(row.value);
    if (!n || isWeakOfficialUrl(n) || WEAK_WEBSITE_HUB.test(n)) {
      return { drop: "weak or invalid website" };
    }
    if (!nameOverlapsHandle(row.name, n)) return { drop: "website name mismatch" };
    return { field, value: n };
  }

  if (field === "youtube") {
    const n = youtubeChannelUrl(row.value);
    if (!n) return { drop: "invalid youtube" };
    if (!nameOverlapsHandle(row.name, n)) return { drop: "youtube name mismatch" };
    return { field, value: n };
  }

  const n = normalizeSocialUrl(row.value);
  if (!n) return { drop: "invalid url" };
  if (!nameOverlapsHandle(row.name, n)) return { drop: "handle name mismatch" };
  return { field, value: n };
}

function remapDjAuditRow(row: EntityCompleteAuditRow): EntityCompleteAuditRow {
  if (row.kind !== "dj") return row;
  const mapped = remapAtomicActPin(row.slug, row.name);
  if (!mapped) return row;
  return { ...row, slug: mapped.slug, name: mapped.name };
}

export function pinsFromAudit(rows: EntityCompleteAuditRow[]): {
  pins: EntityCompletePin[];
  dropped: EntityCompleteDrop[];
} {
  const dropped: EntityCompleteDrop[] = [];
  const byKey = new Map<string, EntityCompletePin>();
  for (const row of rows) {
    const mapped = remapDjAuditRow(row);
    const halfSlugGenre =
      mapped.slug !== row.slug && row.field === "genre";
    if (halfSlugGenre) {
      dropped.push({
        kind: row.kind,
        slug: row.slug,
        field: row.field || "",
        reason: "atomic-act half genre",
      });
      continue;
    }
    const judged = evaluateEntityCompleteRow(mapped);
    if (judged.drop || !judged.field || !judged.value) {
      dropped.push({
        kind: row.kind,
        slug: row.slug,
        field: row.field || "",
        reason: judged.drop ?? "rejected",
      });
      continue;
    }
    const key = `${mapped.kind}:${mapped.slug}`;
    const pin = byKey.get(key) ?? {
      kind: mapped.kind as EntityCompleteKind,
      slug: mapped.slug,
    };
    pin[judged.field] = judged.value;
    byKey.set(key, pin);
  }
  return {
    pins: sortPins([...byKey.values()]),
    dropped,
  };
}

function sortPins(pins: EntityCompletePin[]): EntityCompletePin[] {
  return [...pins].sort(
    (a, b) => a.kind.localeCompare(b.kind) || a.slug.localeCompare(b.slug),
  );
}

function remapDjPin(pin: EntityCompletePin): EntityCompletePin {
  if (pin.kind !== "dj") return pin;
  const slug = remapAtomicActHalfSlug(pin.slug);
  return slug ? { ...pin, slug } : pin;
}

function mergePinFields(
  cur: EntityCompletePin,
  pin: EntityCompletePin,
): EntityCompletePin {
  const next = { ...cur };
  for (const field of FIELDS) {
    const value = pin[field];
    if (!value) continue;
    const have = next[field];
    if (!have || (field === "website" && isWeakOfficialUrl(have))) {
      next[field] = value;
    }
  }
  return next;
}

/** Fill-null merge. Never replaces a strong existing pin field. */
export function mergeEntityCompletePins(
  existing: EntityCompletePin[],
  incoming: EntityCompletePin[],
): EntityCompletePin[] {
  const byKey = new Map<string, EntityCompletePin>();
  for (const pin of [...existing, ...incoming].map(remapDjPin)) {
    const key = `${pin.kind}:${pin.slug}`;
    const cur = byKey.get(key) ?? { kind: pin.kind, slug: pin.slug };
    byKey.set(key, mergePinFields(cur, pin));
  }
  return sortPins([...byKey.values()]);
}

export function loadEntityCompletePins(): EntityCompletePin[] {
  try {
    const raw = JSON.parse(readFileSync(PINS_PATH, "utf8")) as unknown;
    if (!Array.isArray(raw)) return [];
    return raw.filter((row): row is EntityCompletePin => {
      if (!row || typeof row !== "object") return false;
      const kind = (row as EntityCompletePin).kind;
      const slug = String((row as EntityCompletePin).slug || "").trim();
      return KINDS.has(kind) && slug.length > 0;
    });
  } catch {
    return [];
  }
}

function shouldFill(
  field: EntityCompleteField,
  current: string | null | undefined,
): boolean {
  const cur = current?.trim();
  if (!cur) return true;
  if (field === "website" && isWeakOfficialUrl(cur)) return true;
  return false;
}

/** Fill-null by slug. Never overwrites a strong official URL or existing art. */
export async function applyEntityCompletePins(
  prisma: PrismaClient,
  pins = loadEntityCompletePins(),
): Promise<{ matched: number; filled: number }> {
  let matched = 0;
  let filled = 0;
  for (const pin of pins.map(remapDjPin)) {
    if (pin.kind === "dj") {
      const row = await prisma.dj.findUnique({
        where: { slug: pin.slug },
        select: {
          id: true,
          imageUrl: true,
          website: true,
          instagram: true,
          youtube: true,
          soundcloud: true,
          twitter: true,
          homeCity: true,
          bio: true,
          genre: true,
        },
      });
      if (!row) continue;
      matched += 1;
      const data: Record<string, string> = {};
      for (const field of FIELDS) {
        const next = pin[field];
        if (!next) continue;
        if (shouldFill(field, row[field as keyof typeof row] as string | null)) {
          data[field] = next;
        }
      }
      if (!Object.keys(data).length) continue;
      await prisma.dj.update({ where: { id: row.id }, data });
      filled += 1;
      continue;
    }

    const row = await prisma.event.findUnique({
      where: { slug: pin.slug },
      select: {
        id: true,
        imageUrl: true,
        website: true,
        instagram: true,
        soundcloud: true,
        twitter: true,
      },
    });
    if (!row) continue;
    matched += 1;
    const data: Record<string, string> = {};
    for (const field of [
      "imageUrl",
      "website",
      "instagram",
      "soundcloud",
      "twitter",
    ] as const) {
      const next = pin[field];
      if (!next) continue;
      if (shouldFill(field, row[field])) data[field] = next;
    }
    if (!Object.keys(data).length) continue;
    await prisma.event.update({ where: { id: row.id }, data });
    filled += 1;
  }
  return { matched, filled };
}
