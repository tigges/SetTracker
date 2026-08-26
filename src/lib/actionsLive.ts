/**
 * Live Actions status for /stats without a rebuild.
 *
 * The baked snapshot (data/crosscheck/actions-status.json) is written during
 * the Pages run, so the Pages row can never show its own conclusion — it is
 * always "in progress" in the export. The repo is public, so the browser can
 * read the same Actions API unauthenticated and replace the snapshot on load.
 *
 * Unauthenticated GitHub API allows 60 requests/hour/IP; we spend one per
 * tracked workflow per refresh, so an operator page is far inside that.
 */

import { OPERATOR_REPO } from "./site";

export type LiveRunRow = {
  id: string;
  label: string;
  status: string;
  conclusion: string;
  htmlUrl: string;
  displayTitle: string;
  updatedAt: string;
};

export const LIVE_WORKFLOWS: Array<{ id: string; label: string }> = [
  { id: "catalog-enrich.yml", label: "Catalog enrich" },
  { id: "catalog-deep.yml", label: "Catalog deep" },
  { id: "deploy-pages.yml", label: "Pages" },
];

export function workflowRunsApiUrl(
  workflowId: string,
  repo = OPERATOR_REPO,
): string {
  return `https://api.github.com/repos/${repo}/actions/workflows/${workflowId}/runs?per_page=1`;
}

type GhRun = {
  html_url?: string;
  status?: string;
  conclusion?: string | null;
  display_title?: string;
  updated_at?: string;
};

export function rowFromGhRun(
  workflowId: string,
  label: string,
  run: GhRun | undefined,
): LiveRunRow | null {
  if (!run) return null;
  return {
    id: workflowId,
    label,
    status: run.status || "",
    conclusion: run.conclusion || "",
    htmlUrl: run.html_url || "",
    displayTitle: run.display_title || "",
    updatedAt: run.updated_at || "",
  };
}

/**
 * Status word for a run. Kept here rather than in actionsStatus.ts so the
 * client component never pulls that module's `node:fs` read into the bundle.
 */
export function runConclusionLabel(conclusion: string, status: string): string {
  if (status === "in_progress" || status === "queued") {
    return status.replace("_", " ");
  }
  return conclusion || status || "unknown";
}

/** "4m ago" / "2h ago" — short enough to sit next to a status word. */
export function shortAgo(iso: string, now = Date.now()): string {
  const at = Date.parse(iso);
  if (!Number.isFinite(at)) return "";
  const secs = Math.max(0, Math.round((now - at) / 1000));
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

/** In-flight runs are worth re-checking; finished ones are not. */
export function anyRunActive(rows: LiveRunRow[]): boolean {
  return rows.some((r) => r.status === "in_progress" || r.status === "queued");
}

export async function fetchLiveRuns(
  opts: {
    repo?: string;
    workflows?: Array<{ id: string; label: string }>;
    fetchImpl?: typeof fetch;
  } = {},
): Promise<LiveRunRow[]> {
  const repo = opts.repo ?? OPERATOR_REPO;
  const workflows = opts.workflows ?? LIVE_WORKFLOWS;
  const doFetch = opts.fetchImpl ?? fetch;
  const rows = await Promise.all(
    workflows.map(async (w) => {
      try {
        const res = await doFetch(workflowRunsApiUrl(w.id, repo), {
          headers: { Accept: "application/vnd.github+json" },
          cache: "no-store",
        });
        if (!res.ok) return null;
        const json = (await res.json()) as { workflow_runs?: GhRun[] };
        return rowFromGhRun(w.id, w.label, json.workflow_runs?.[0]);
      } catch {
        return null;
      }
    }),
  );
  return rows.filter((r): r is LiveRunRow => r !== null);
}
