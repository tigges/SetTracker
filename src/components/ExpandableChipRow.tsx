"use client";

import { useState, type ReactNode } from "react";

const DEFAULT_PREVIEW = 12;

/**
 * Flex chip row with a bottom "Show more" when the list gets long.
 */
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
      {hidden > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mono text-[12px] text-muted2 transition-colors hover:text-ink"
          >
            {expanded ? "Show less" : `Show ${hidden} more ${moreLabel}`}
          </button>
        </div>
      )}
    </div>
  );
}
