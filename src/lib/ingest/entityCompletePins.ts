/**
 * Producer / Claude completeness pins (thumbs + official URLs).
 * Fill-null on Dj / Event via verify-urls / Pages. Never invents @slug.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { PrismaClient } from "@prisma/client";
import { isWeakOfficialUrl } from "../officialUrls";
import { youtubeChannelUrl } from "../social";
import { normalizeSocialUrl } from "./eventSocials";

export type EntityCompleteKind = "dj" | "festival" | "club";

export type EntityCompleteField =
  | "imageUrl"
  | "website"
  | "instagram"
  | "youtube"
  | "soundcloud"
  | "twitter";

export type EntityCompletePin = {
  kind: EntityCompleteKind;
  slug: string;
  imageUrl?: string;
  website?: string;
  instagram?: string;
  youtube?: string;
  soundcloud?: string;
  twitter?: string;
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
]);

const CANNOT_CONFIRM = /cannot confirm|no published links|unsure/i;

export function parseEntityCompleteCsv(text: string): EntityCompleteAuditRow[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  const rows: EntityCompleteAuditRow[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const cells = splitCsvLine(line);
    if (cells[0] === "kind" && cells[1] === "slug") continue;
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

/** Handle or host must overlap the catalog name (never @slug guesses). */
export function nameOverlapsHandle(name: string, value: string): boolean {
  const nameKey = coreName(name);
  if (nameKey.length < 3) return false;
  let hay = value;
  try {
    const u = new URL(value);
    hay = `${u.hostname} ${u.pathname}`;
  } catch {
    /* bare handle */
  }
  const handleKey = coreName(hay.replace(/^www/, ""));
  if (handleKey.includes(nameKey) || nameKey.includes(handleKey)) return true;
  // "AC Slater" → acslater inside djacslater / "Dr. Fresch" → drfresch.
  if (nameKey.length >= 5 && handleKey.includes(nameKey)) return true;
  return false;
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

  if (field === "imageUrl") {
    if (!isHttpsImageUrl(row.value)) return { drop: "image url not allowed" };
    return { field, value: row.value };
  }

  if (field === "website") {
    const n = normalizeSocialUrl(row.value);
    if (!n || isWeakOfficialUrl(n)) return { drop: "weak or invalid website" };
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

export function pinsFromAudit(rows: EntityCompleteAuditRow[]): {
  pins: EntityCompletePin[];
  dropped: EntityCompleteDrop[];
} {
  const dropped: EntityCompleteDrop[] = [];
  const byKey = new Map<string, EntityCompletePin>();
  for (const row of rows) {
    const judged = evaluateEntityCompleteRow(row);
    if (judged.drop || !judged.field || !judged.value) {
      dropped.push({
        kind: row.kind,
        slug: row.slug,
        field: row.field || "",
        reason: judged.drop ?? "rejected",
      });
      continue;
    }
    const key = `${row.kind}:${row.slug}`;
    const pin = byKey.get(key) ?? {
      kind: row.kind as EntityCompleteKind,
      slug: row.slug,
    };
    pin[judged.field] = judged.value;
    byKey.set(key, pin);
  }
  return {
    pins: [...byKey.values()].sort(
      (a, b) => a.kind.localeCompare(b.kind) || a.slug.localeCompare(b.slug),
    ),
    dropped,
  };
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
  for (const pin of pins) {
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
        },
      });
      if (!row) continue;
      matched += 1;
      const data: Record<string, string> = {};
      for (const field of FIELDS) {
        const next = pin[field];
        if (!next) continue;
        if (shouldFill(field, row[field])) data[field] = next;
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
