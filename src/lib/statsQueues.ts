/** /stats queue follow-up: jobs vs operator paste. */

export type QueueFollowUp = "auto" | "operator" | "both";

export const QUEUE_FOLLOW_UP_LABEL: Record<QueueFollowUp, string> = {
  auto: "Automatic",
  operator: "Operator",
  both: "Automatic + operator",
};

export const QUEUE_FOLLOW_UP_HINT: Record<QueueFollowUp, string> = {
  auto: "Deep / enrich / Pages drain this. Leftovers failed confirm or wait for the next pass.",
  operator: "You link or paste. Jobs do not invent URLs or relink leftover hosts.",
  both: "Jobs run first. 1001 paste / official www / leftover IDs stay on you.",
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
