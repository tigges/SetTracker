/**
 * Build-time snapshot of committed LLM / first-party research reports.
 * Used by /stats. Models propose; we only show verified writes + identity.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type LlmResearchTarget = "dj" | "event" | "identity" | "first-party";

export type LlmResearchRound = {
  file: string;
  provider: string;
  target: LlmResearchTarget;
  scanned: number;
  applied: number;
  rejected: number;
  generatedAt: string | null;
};

export type LlmAcceptedFill = {
  kind: "dj" | "event";
  slug: string;
  name: string;
  fields: string[];
};

export type LlmIdentityRow = {
  slug: string;
  name: string;
  cls: string;
  sets: number;
  notes?: string;
};

export type LlmResearchStats = {
  generatedAt: string | null;
  note: string;
  totals: {
    djsScanned: number;
    djFieldsApplied: number;
    eventsScanned: number;
    eventFieldsApplied: number;
    identityClassified: number;
    touringDj: number;
    junkOrHost: number;
  };
  firstParty: {
    anySocial: number;
    djsIg: number;
    noSocialWithSets: number;
    eventsIg: number;
  } | null;
  rounds: LlmResearchRound[];
  fills: LlmAcceptedFill[];
  identity: LlmIdentityRow[];
};

type HandleRow = {
  slug?: string;
  name?: string;
  accepted?: Array<{ field?: string }>;
};

type IdentityRow = {
  slug?: string;
  name?: string;
  cls?: string | null;
  sets?: number;
  notes?: string;
};

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function targetFromFile(file: string): LlmResearchTarget | null {
  if (file.startsWith("llm-identity-research")) return "identity";
  if (file.startsWith("llm-event-handle-research")) return "event";
  if (file.startsWith("llm-handle-research") && !file.includes("summary")) {
    return "dj";
  }
  return null;
}

export function summarizeHandleReport(
  file: string,
  raw: unknown,
): {
  round: LlmResearchRound | null;
  fills: LlmAcceptedFill[];
} {
  const target = targetFromFile(file);
  if (!target || target === "identity") {
    return { round: null, fills: [] };
  }
  const body = raw as {
    generatedAt?: string;
    provider?: string;
    stats?: { scanned?: number; applied?: number; rejected?: number };
    rows?: HandleRow[];
  };
  const scanned = Number(body.stats?.scanned ?? 0);
  const applied = Number(body.stats?.applied ?? 0);
  const rejected = Number(body.stats?.rejected ?? 0);
  if (scanned <= 0 && applied <= 0) return { round: null, fills: [] };
  const kind = target === "event" ? "event" : "dj";
  const fills: LlmAcceptedFill[] = [];
  for (const row of body.rows ?? []) {
    const fields = (row.accepted ?? [])
      .map((a) => a.field)
      .filter((f): f is string => Boolean(f));
    if (!row.slug || !row.name || !fields.length) continue;
    fills.push({ kind, slug: row.slug, name: row.name, fields });
  }
  return {
    round: {
      file,
      provider: body.provider || "unknown",
      target,
      scanned,
      applied,
      rejected,
      generatedAt: body.generatedAt ?? null,
    },
    fills,
  };
}

export function summarizeIdentityReport(raw: unknown): LlmIdentityRow[] {
  const body = raw as { rows?: IdentityRow[] };
  const out: LlmIdentityRow[] = [];
  for (const row of body.rows ?? []) {
    if (!row.slug || !row.name || !row.cls) continue;
    out.push({
      slug: row.slug,
      name: row.name,
      cls: row.cls,
      sets: Number(row.sets ?? 0),
      notes: row.notes,
    });
  }
  return out;
}

const IDENTITY_RANK: Record<string, number> = {
  touring_dj: 0,
  track_credit: 1,
  venue_host: 2,
  junk: 3,
  unknown: 4,
};

export function loadLlmResearchStats(
  cwd = process.cwd(),
): LlmResearchStats {
  const dir = join(cwd, "data", "crosscheck");
  const empty: LlmResearchStats = {
    generatedAt: null,
    note: "Models propose; we write only live name-matched profiles.",
    totals: {
      djsScanned: 0,
      djFieldsApplied: 0,
      eventsScanned: 0,
      eventFieldsApplied: 0,
      identityClassified: 0,
      touringDj: 0,
      junkOrHost: 0,
    },
    firstParty: null,
    rounds: [],
    fills: [],
    identity: [],
  };
  if (!existsSync(dir)) return empty;

  const files = readdirSync(dir).filter((f) => f.endsWith(".json")).sort();
  const rounds: LlmResearchRound[] = [];
  const fillMap = new Map<string, LlmAcceptedFill>();
  const identity: LlmIdentityRow[] = [];
  let generatedAt: string | null = null;

  for (const file of files) {
    const raw = readJson(join(dir, file));
    if (!raw || typeof raw !== "object") continue;
    if (file.startsWith("llm-identity-research")) {
      identity.push(...summarizeIdentityReport(raw));
      const at = (raw as { generatedAt?: string }).generatedAt;
      if (at && (!generatedAt || at > generatedAt)) generatedAt = at;
      continue;
    }
    const { round, fills } = summarizeHandleReport(file, raw);
    if (round) {
      rounds.push(round);
      if (round.generatedAt && (!generatedAt || round.generatedAt > generatedAt)) {
        generatedAt = round.generatedAt;
      }
    }
    for (const fill of fills) {
      fillMap.set(`${fill.kind}:${fill.slug}`, fill);
    }
  }

  const firstRaw = readJson(join(dir, "first-party-socials.json")) as {
    anySocial?: number;
    djsIg?: number;
    noSocialWithSets?: number;
    eventsIg?: number;
    generatedAt?: string;
  } | null;
  const firstParty = firstRaw
    ? {
        anySocial: Number(firstRaw.anySocial ?? 0),
        djsIg: Number(firstRaw.djsIg ?? 0),
        noSocialWithSets: Number(firstRaw.noSocialWithSets ?? 0),
        eventsIg: Number(firstRaw.eventsIg ?? 0),
      }
    : null;
  if (firstRaw?.generatedAt && (!generatedAt || firstRaw.generatedAt > generatedAt)) {
    generatedAt = firstRaw.generatedAt;
  }

  const fills = [...fillMap.values()].sort((a, b) => {
    if (b.fields.length !== a.fields.length) return b.fields.length - a.fields.length;
    return a.name.localeCompare(b.name);
  });

  const identitySorted = [...identity].sort((a, b) => {
    const ra = IDENTITY_RANK[a.cls] ?? 9;
    const rb = IDENTITY_RANK[b.cls] ?? 9;
    if (ra !== rb) return ra - rb;
    return b.sets - a.sets || a.name.localeCompare(b.name);
  });

  const totals = {
    djsScanned: rounds.filter((r) => r.target === "dj").reduce((n, r) => n + r.scanned, 0),
    djFieldsApplied: rounds
      .filter((r) => r.target === "dj")
      .reduce((n, r) => n + r.applied, 0),
    eventsScanned: rounds
      .filter((r) => r.target === "event")
      .reduce((n, r) => n + r.scanned, 0),
    eventFieldsApplied: rounds
      .filter((r) => r.target === "event")
      .reduce((n, r) => n + r.applied, 0),
    identityClassified: identitySorted.length,
    touringDj: identitySorted.filter((r) => r.cls === "touring_dj").length,
    junkOrHost: identitySorted.filter(
      (r) => r.cls === "junk" || r.cls === "venue_host",
    ).length,
  };

  return {
    generatedAt,
    note: "Models propose; we write only live name-matched profiles. Events never receive a lineup-artist profile. Identity is report-only.",
    totals,
    firstParty,
    rounds,
    fills,
    identity: identitySorted,
  };
}
