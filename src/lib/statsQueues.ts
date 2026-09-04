/** /stats queue follow-up: jobs vs operator paste. */

export type QueueFollowUp = "auto" | "operator" | "both";

export const QUEUE_FOLLOW_UP_LABEL: Record<QueueFollowUp, string> = {
  auto: "Automatic",
  operator: "Operator",
  both: "Automatic + operator",
};

export const QUEUE_FOLLOW_UP_HINT: Record<QueueFollowUp, string> = {
  auto: "Deep / enrich / Pages drain this. Leftovers failed confirm or wait for the next pass.",
  operator: "You link or paste. Jobs do not invent URLs or relink leftover hosts. 1001 is exceptional.",
  both: "Jobs run first. 1001 paste is exceptional; official www / leftover IDs stay on you.",
};

export function queueFollowUpLabel(kind: QueueFollowUp): string {
  return QUEUE_FOLLOW_UP_LABEL[kind];
}

export function queueFollowUpHint(kind: QueueFollowUp): string {
  return QUEUE_FOLLOW_UP_HINT[kind];
}

/** Workbench 1001 is operator paste; text / ACR / IDs are jobs. */
export function workbenchLaneFollowUp(lane: string): QueueFollowUp {
  return lane === "capture_1001" ? "operator" : "auto";
}

export type QueueDjRow = {
  slug: string;
  name: string;
  setCount: number;
  playCount: number;
};

export type DjCompleteRow = QueueDjRow & {
  needsHandle: boolean;
  needsArt: boolean;
};

/** One DJ row when handle and/or artwork is missing. */
export function mergeDjCompleteQueue(
  handles: QueueDjRow[],
  art: QueueDjRow[],
  starRank: (slug: string) => number = () => 1,
): DjCompleteRow[] {
  const bySlug = new Map<string, DjCompleteRow>();
  for (const d of handles) {
    bySlug.set(d.slug, { ...d, needsHandle: true, needsArt: false });
  }
  for (const d of art) {
    const cur = bySlug.get(d.slug);
    if (cur) {
      cur.needsArt = true;
      continue;
    }
    bySlug.set(d.slug, { ...d, needsHandle: false, needsArt: true });
  }
  return [...bySlug.values()].sort((a, b) => {
    const star = starRank(a.slug) - starRank(b.slug);
    if (star) return star;
    const handleFirst = Number(b.needsHandle) - Number(a.needsHandle);
    if (handleFirst) return handleFirst;
    return a.name.localeCompare(b.name);
  });
}

export type PlaceGapRow = {
  slug: string;
  name: string;
  onChart: boolean;
  kind: "festival" | "club";
};

/** Festivals and clubs without a set, ★ first, festivals before clubs. */
export function mergePlaceGapQueue(
  festivals: Array<{ slug: string; name: string; onChart: boolean }>,
  clubs: Array<{ slug: string; name: string; onChart: boolean }>,
): PlaceGapRow[] {
  const rows: PlaceGapRow[] = [
    ...festivals.map((r) => ({ ...r, kind: "festival" as const })),
    ...clubs.map((r) => ({ ...r, kind: "club" as const })),
  ];
  return rows.sort((a, b) => {
    const star = Number(b.onChart) - Number(a.onChart);
    if (star) return star;
    if (a.kind !== b.kind) return a.kind === "festival" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}
