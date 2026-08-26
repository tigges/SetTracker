"use client";

import { useCallback, useEffect, useState } from "react";
import {
  anyRunActive,
  fetchLiveRuns,
  runConclusionLabel,
  shortAgo,
  type LiveRunRow,
} from "@/lib/actionsLive";

function toneClass(row: LiveRunRow): string {
  if (row.status === "in_progress" || row.status === "queued") {
    return "text-teal";
  }
  if (row.conclusion === "success") return "text-brandstrong";
  if (row.conclusion === "failure" || row.conclusion === "cancelled") {
    return "text-amber";
  }
  return "text-muted2";
}

/**
 * Workflow rows that refresh in the browser.
 *
 * `initial` is the export-time snapshot, so the list renders identically
 * before hydration. On mount we replace it with a live read of the public
 * Actions API — the snapshot is always stale for Pages, which is written
 * mid-run and can never record its own conclusion. While a run is active we
 * poll slowly; once everything is finished we stop.
 */
export function StatsLiveRuns({ initial }: { initial: LiveRunRow[] }) {
  const [rows, setRows] = useState<LiveRunRow[]>(initial);
  const [live, setLive] = useState(false);
  const [checkedAt, setCheckedAt] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  // Only ever called with data in hand, so no setState before the await.
  const apply = useCallback((next: LiveRunRow[]) => {
    if (next.length === 0) return;
    setRows(next);
    setLive(true);
    setCheckedAt(Date.now());
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const next = await fetchLiveRuns();
      if (!cancelled) apply(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [apply]);

  // Follow an in-flight run to completion, then stop polling.
  const active = live && anyRunActive(rows);
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const timer = setInterval(() => {
      void (async () => {
        const next = await fetchLiveRuns();
        if (!cancelled) apply(next);
      })();
    }, 30_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [active, apply]);

  async function onRefresh() {
    setBusy(true);
    try {
      apply(await fetchLiveRuns());
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2">
      {rows.length === 0 ? (
        <p className="text-[12px] text-muted2">
          No run snapshot in this export. Checking GitHub…
        </p>
      ) : null}
      <ul className="divide-y divide-line border-y border-line">
        {rows.map((row) => {
          const label = runConclusionLabel(row.conclusion, row.status);
          const ago = row.updatedAt ? shortAgo(row.updatedAt) : "";
          return (
            <li
              key={row.id}
              className="flex items-baseline justify-between gap-2 py-1"
            >
              {row.htmlUrl ? (
                <a
                  href={row.htmlUrl}
                  className="truncate text-[13px] font-semibold text-ink hover:underline"
                  title={row.displayTitle}
                >
                  {row.label}
                </a>
              ) : (
                <span className="truncate text-[13px] font-semibold text-ink">
                  {row.label}
                </span>
              )}
              <span className="flex shrink-0 items-baseline gap-2">
                {ago ? (
                  <span className="mono text-[11px] text-muted2">{ago}</span>
                ) : null}
                <span
                  className={`mono text-[12px] font-semibold ${toneClass(row)}`}
                >
                  {label}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mono mt-1 text-[11px] text-muted2">
        {live
          ? `live from GitHub${
              checkedAt
                ? ` · checked ${shortAgo(new Date(checkedAt).toISOString())}`
                : ""
            }`
          : "export snapshot — Pages cannot record its own conclusion mid-run"}
        {" · "}
        <button
          type="button"
          onClick={() => void onRefresh()}
          disabled={busy}
          className="underline decoration-dotted underline-offset-2 hover:text-ink disabled:opacity-60"
        >
          {busy ? "checking…" : "refresh"}
        </button>
      </p>
    </div>
  );
}
