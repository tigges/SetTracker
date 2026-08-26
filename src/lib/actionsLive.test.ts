import assert from "node:assert/strict";
import {
  anyRunActive,
  fetchLiveRuns,
  LIVE_WORKFLOWS,
  rowFromGhRun,
  runConclusionLabel,
  shortAgo,
  workflowRunsApiUrl,
  type LiveRunRow,
} from "./actionsLive";

// Live rows come straight from the API, so an unfinished run has no conclusion.
assert.equal(runConclusionLabel("", "in_progress"), "in progress");
assert.equal(runConclusionLabel("", "queued"), "queued");
assert.equal(runConclusionLabel("success", "completed"), "success");
assert.equal(runConclusionLabel("failure", "completed"), "failure");
assert.equal(runConclusionLabel("", ""), "unknown");

assert.equal(
  workflowRunsApiUrl("deploy-pages.yml", "tigges/SetTracker"),
  "https://api.github.com/repos/tigges/SetTracker/actions/workflows/deploy-pages.yml/runs?per_page=1",
);
assert.deepEqual(
  LIVE_WORKFLOWS.map((w) => w.id),
  ["catalog-enrich.yml", "catalog-deep.yml", "deploy-pages.yml"],
);

assert.equal(rowFromGhRun("x.yml", "X", undefined), null);
const row = rowFromGhRun("deploy-pages.yml", "Pages", {
  html_url: "https://github.com/tigges/SetTracker/actions/runs/1",
  status: "completed",
  conclusion: "success",
  display_title: "Merge pull request #310",
  updated_at: "2026-08-26T01:48:14Z",
});
assert.equal(row?.label, "Pages");
assert.equal(row?.conclusion, "success");
assert.equal(row?.updatedAt, "2026-08-26T01:48:14Z");

// A null conclusion (still running) must not become the string "null".
const running = rowFromGhRun("deploy-pages.yml", "Pages", {
  status: "in_progress",
  conclusion: null,
});
assert.equal(running?.conclusion, "");
assert.equal(running?.status, "in_progress");

const now = Date.parse("2026-08-26T02:00:00Z");
assert.equal(shortAgo("2026-08-26T01:59:30Z", now), "30s ago");
assert.equal(shortAgo("2026-08-26T01:48:00Z", now), "12m ago");
assert.equal(shortAgo("2026-08-25T20:00:00Z", now), "6h ago");
assert.equal(shortAgo("2026-08-20T02:00:00Z", now), "6d ago");
assert.equal(shortAgo("not-a-date", now), "");

const done: LiveRunRow[] = [
  { ...row!, status: "completed", conclusion: "success" },
];
assert.equal(anyRunActive(done), false);
assert.equal(anyRunActive([{ ...row!, status: "in_progress" }]), true);
assert.equal(anyRunActive([{ ...row!, status: "queued" }]), true);

// Whole-fetch behaviour, including one workflow failing.
async function fakeFetch(url: string | URL | Request): Promise<Response> {
  const href = String(url);
  if (href.includes("catalog-deep")) {
    return new Response("nope", { status: 403 });
  }
  return new Response(
    JSON.stringify({
      workflow_runs: [
        {
          html_url: "https://example.com/run",
          status: "completed",
          conclusion: "success",
          updated_at: "2026-08-26T01:48:14Z",
        },
      ],
    }),
    { status: 200 },
  );
}

async function main() {
  const rows = await fetchLiveRuns({ fetchImpl: fakeFetch as typeof fetch });
  assert.equal(rows.length, 2, "a rate-limited workflow is skipped, not fatal");
  assert.deepEqual(rows.map((r) => r.label), ["Catalog enrich", "Pages"]);

  const allFail = await fetchLiveRuns({
    fetchImpl: (async () => {
      throw new Error("offline");
    }) as unknown as typeof fetch,
  });
  assert.deepEqual(allFail, [], "offline keeps the export snapshot");

  console.log("actionsLive.test.ts ok");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
