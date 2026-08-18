"use client";

import { useState, type ReactNode } from "react";

const DEFAULT_PREVIEW = 12;

/**
 * Flex chip row with a bottom "Show more" when the list gets long.
 */
function ExpandToggle({
  expanded,
  hidden,
  moreLabel,
  onToggle,
}: {
  expanded: boolean;
  hidden: number;
  moreLabel: string;
  onToggle: () => void;
}) {
  if (hidden === 0) return null;
  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={onToggle}
        className="mono text-[12px] text-muted2 transition-colors hover:text-ink"
      >
        {expanded ? "Show less" : `Show ${hidden} more ${moreLabel}`}
      </button>
    </div>
  );
}

export function ExpandableChipRow({
  items,
  previewCount = DEFAULT_PREVIEW,
  moreLabel = "artists",
}: {
  items: ReactNode[];
  previewCount?: number;
  moreLabel?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const hidden = Math.max(0, items.length - previewCount);
  const visible =
    expanded || hidden === 0 ? items : items.slice(0, previewCount);

  return (
    <div>
      <div className="flex flex-wrap gap-2">{visible}</div>
      <ExpandToggle
        expanded={expanded}
        hidden={hidden}
        moreLabel={moreLabel}
        onToggle={() => setExpanded((v) => !v)}
      />
    </div>
  );
}

/** Stacked list with the same “Show N more” pattern. */
export function ExpandableList({
  items,
  previewCount = 5,
  moreLabel = "nights",
  listClassName = "divide-y divide-line",
}: {
  items: ReactNode[];
  previewCount?: number;
  moreLabel?: string;
  listClassName?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const hidden = Math.max(0, items.length - previewCount);
  const visible =
    expanded || hidden === 0 ? items : items.slice(0, previewCount);

  return (
    <div>
      <ul className={listClassName}>{visible}</ul>
      <ExpandToggle
        expanded={expanded}
        hidden={hidden}
        moreLabel={moreLabel}
        onToggle={() => setExpanded((v) => !v)}
      />
    </div>
  );
}
