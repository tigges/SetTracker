/**
 * Visitor-facing set-card status line. Internal keys stay identified /
 * unresolved_id; the card never says "ID" or "unresolved".
 */

export function setCardStatusHint(counts: {
  identified?: number;
  unresolved_id?: number;
  community_resolved?: number;
}): string {
  return [
    counts.identified ? `${counts.identified} named` : null,
    counts.unresolved_id ? `${counts.unresolved_id} unknown` : null,
    counts.community_resolved ? `${counts.community_resolved} community` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
