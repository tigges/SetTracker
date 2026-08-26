/**
 * Last GitHub Actions runs (Pages build snapshot) + last enrich report
 * stored in the catalog DB. Missing files/token → empty, never throw.
 *
 * This snapshot is only the pre-hydration value for the run rows; /stats
 * refreshes them from the public Actions API in the browser (actionsLive.ts).
 * Server-only — reads from disk, so never import it into a client component.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { EnrichRunReport } from "./ingest/enrich/enrichRunReport";

export type ActionsWorkflowSnapshot = {
  id: string;
  label: string;
  status: string;
  conclusion: string;
  htmlUrl: string;
  displayTitle: string;
  createdAt: string;
  updatedAt: string;
};

export type ActionsStatusFile = {
  updatedAt: string;
  workflows: ActionsWorkflowSnapshot[];
  skipped?: string;
};

export function loadActionsStatusFile(
  cwd = process.cwd(),
): ActionsStatusFile | null {
  const path = join(cwd, "data/crosscheck/actions-status.json");
  try {
    const parsed = JSON.parse(readFileSync(path, "utf8")) as ActionsStatusFile;
    if (!parsed || !Array.isArray(parsed.workflows)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function enrichOutcomeLabel(report: EnrichRunReport | null): string {
  if (!report) return "no enrich snapshot yet";
  if (report.outcome === "ok") return "hits written";
  if (report.outcome === "partial") return "ran, few or no hits";
  return "no-op";
}
