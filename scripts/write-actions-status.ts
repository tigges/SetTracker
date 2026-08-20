/**
 * Snapshot recent GitHub Actions runs for /stats.
 * No-op without GITHUB_TOKEN (local / missing actions:read).
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ActionsStatusFile, ActionsWorkflowSnapshot } from "../src/lib/actionsStatus";

const WORKFLOWS: Array<{ id: string; label: string }> = [
  { id: "catalog-enrich.yml", label: "Catalog enrich" },
  { id: "catalog-deep.yml", label: "Catalog deep" },
  { id: "deploy-pages.yml", label: "Pages" },
];

type GhRun = {
  html_url?: string;
  status?: string;
  conclusion?: string | null;
  display_title?: string;
  created_at?: string;
  updated_at?: string;
};

async function latestRun(
  repo: string,
  token: string,
  workflowId: string,
): Promise<ActionsWorkflowSnapshot | null> {
  const url = `https://api.github.com/repos/${repo}/actions/workflows/${workflowId}/runs?per_page=1`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "setradar-actions-status",
    },
  });
  if (!res.ok) {
    console.log(`[actions-status] ${workflowId} HTTP ${res.status}`);
    return null;
  }
  const json = (await res.json()) as { workflow_runs?: GhRun[] };
  const run = json.workflow_runs?.[0];
  if (!run) return null;
  return {
    id: workflowId,
    label: WORKFLOWS.find((w) => w.id === workflowId)?.label || workflowId,
    status: run.status || "",
    conclusion: run.conclusion || "",
    htmlUrl: run.html_url || "",
    displayTitle: run.display_title || "",
    createdAt: run.created_at || "",
    updatedAt: run.updated_at || "",
  };
}

async function main() {
  const out = join(process.cwd(), "data/crosscheck/actions-status.json");
  const token = (process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "").trim();
  const repo = (process.env.GITHUB_REPOSITORY || "").trim();
  if (!token || !repo) {
    const empty: ActionsStatusFile = {
      updatedAt: new Date().toISOString(),
      workflows: [],
      skipped: "no GITHUB_TOKEN / GITHUB_REPOSITORY — local or Pages without actions:read",
    };
    writeFileSync(out, `${JSON.stringify(empty, null, 2)}\n`);
    console.log("[actions-status] skipped (no token/repo)");
    return;
  }
  const workflows: ActionsWorkflowSnapshot[] = [];
  for (const w of WORKFLOWS) {
    const row = await latestRun(repo, token, w.id);
    if (row) workflows.push(row);
  }
  const file: ActionsStatusFile = {
    updatedAt: new Date().toISOString(),
    workflows,
  };
  writeFileSync(out, `${JSON.stringify(file, null, 2)}\n`);
  console.log(`[actions-status] wrote ${workflows.length} workflow(s)`);
}

main().catch((err) => {
  console.warn("[actions-status] failed (non-fatal):", err);
});
