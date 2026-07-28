"use client";

import { useState, type ReactNode } from "react";

const DEFAULT_PREVIEW = 12;

/**
 * Grid that shows the top N items by default with a bottom "Show more".
 * Pass items already sorted (e.g. labels by setCount).
 */
export function ExpandableCardGrid({
  items,
  previewCount = DEFAULT_PREVIEW,
  moreLabel = "labels",
}: {
  items: ReactNode[];
  previewCount?: number;
  /** Noun for the control copy (“12 more labels”). */
  moreLabel?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const hidden = Math.max(0, items.length - previewCount);
  const visible =
    expanded || hidden === 0 ? items : items.slice(0, previewCount);

  return (
    <div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible}
      </div>
      {hidden > 0 && (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mono text-[12px] text-muted2 transition-colors hover:text-ink"
          >
            {expanded
              ? "Show less"
              : `Show ${hidden} more ${moreLabel}`}
          </button>
        </div>
      )}
    </div>
  );
}
