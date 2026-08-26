"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Open the enclosing <details> when the page was opened with a ?q= filter.
 *
 * The Capture 1001 fold is collapsed by default, but /stats?q=…#capture-1001 is
 * a real deep link — the legacy /capture-1001 redirect and the workbench row
 * links both use it. Without this the operator would land on a closed fold whose
 * filter is already applied but invisible.
 *
 * /stats is a static export, so the open state cannot be decided at build time.
 * Rendering a marker and walking up to the fold keeps QueueFold a plain server
 * component; with JS off the fold simply stays closed.
 */
export function OpenFoldWhenQuery() {
  const query = useSearchParams().get("q");
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!query?.trim()) return;
    marker.current?.closest("details")?.setAttribute("open", "");
  }, [query]);

  return <span ref={marker} hidden aria-hidden />;
}
