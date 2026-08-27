/**
 * Catalog quality control + safe improvement pass.
 *
 *   npm run qc              # static QC + refresh operator reports
 *   npm run qc -- --fix     # also drop junk track-id pins
 *   npm run qc -- --full    # also lint unit tests listed below
 *
 * Never scrapes Beatport or 1001. Never invents ISRCs or handles.
 * Live DB audits run only when the catalog is large enough (not seed).
 */
import { spawnSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import {
  dropJunkTrackIdPins,
  runStaticCatalogQc,
} from "../src/lib/qc/staticCatalogQc";
import { loadTrackIdPins } from "../src/lib/ingest/identify/trackIdPins";

const FIX = process.argv.includes("--fix");
const FULL = process.argv.includes("--full");
const MIN_LIVE_SETS = Number(process.env.QC_MIN_SETS || 200);

function runStep(
  name: string,
  cmd: string,
  args: string[],
): { name: string; ok: boolean; detail: string } {
  const hit = spawnSync(cmd, args, {
    encoding: "utf8",
    timeout: 120_000,
    env: process.env,
  });
  const out = `${hit.stdout ?? ""}${hit.stderr ?? ""}`.trim();
  const ok = hit.status === 0;
  return {
    name,
    ok,
    detail: ok
      ? out.split("\n").slice(-3).join(" | ")
      : out.slice(-800) || `exit ${hit.status}`,
  };
}

async function catalogSetCount(): Promise<number> {
  const prisma = new PrismaClient();
  try {
    return await prisma.set.count();
  } catch {
    return 0;
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const staticQc = runStaticCatalogQc();
  const steps: Array<{ name: string; ok: boolean; detail: string }> = [];
  let pinsDropped: string[] = [];

  if (FIX) {
    const pins = loadTrackIdPins();
    const { next, dropped } = dropJunkTrackIdPins(pins);
    pinsDropped = dropped;
    if (dropped.length) {
      writeFileSync(
        join(process.cwd(), "data/track-id-pins.json"),
        `${JSON.stringify(next, null, 2)}\n`,
      );
    }
  }

  const refresh = [
    runStep("roster-graduates", "npx", [
      "tsx",
      "scripts/report-roster-graduates.ts",
    ]),
    runStep("held-relives", "npx", ["tsx", "scripts/watch-held-relives.ts"]),
    runStep("next-captures", "npx", ["tsx", "scripts/build-next-captures.ts"]),
  ];
  steps.push(...refresh);

  const sets = await catalogSetCount();
  const live = sets >= MIN_LIVE_SETS;
  if (live) {
    steps.push(
      runStep("audit-top100", "npx", ["tsx", "scripts/audit-top100-coverage.ts"]),
    );
    steps.push(
      runStep("audit-event-socials", "npx", [
        "tsx",
        "scripts/audit-event-socials.ts",
      ]),
    );
    steps.push(
      runStep("audit-homepage-sparse", "npx", [
        "tsx",
        "scripts/audit-homepage-sparse.ts",
      ]),
    );
    steps.push(
      runStep("set-density", "npx", [
        "tsx",
        "scripts/crosscheck-set-density.ts",
      ]),
    );
  }

  if (FULL) {
    steps.push(
      runStep("static-qc-test", "npx", [
        "tsx",
        "src/lib/qc/staticCatalogQc.test.ts",
      ]),
    );
    steps.push(
      runStep("official-urls-test", "npx", [
        "tsx",
        "--test",
        "src/lib/officialUrls.test.ts",
      ]),
    );
    steps.push(
      runStep("events-test", "npx", ["tsx", "src/lib/ingest/events.test.ts"]),
    );
    steps.push(
      runStep("capture-lookup-test", "npx", [
        "tsx",
        "src/lib/ingest/captureLookup.test.ts",
      ]),
    );
    steps.push(
      runStep("resolutions-test", "npx", [
        "tsx",
        "src/lib/ingest/resolutions.test.ts",
      ]),
    );
    steps.push(
      runStep("community-keeps-test", "npx", [
        "tsx",
        "src/lib/ingest/communityKeeps.test.ts",
      ]),
    );
    steps.push(
      runStep("resolutions-apply-test", "npx", [
        "tsx",
        "--env-file=.env",
        "src/lib/ingest/resolutions.apply.test.ts",
      ]),
    );
    steps.push(
      runStep("suggest-id-snippet-test", "npx", [
        "tsx",
        "src/lib/suggestIdSnippet.test.ts",
      ]),
    );
    steps.push(
      runStep("suggest-id-issue-test", "npx", [
        "tsx",
        "src/lib/suggestIdIssue.test.ts",
      ]),
    );
  }

  const errors = staticQc.issues.filter((i) => i.severity === "error");
  const report = {
    generatedAt: new Date().toISOString(),
    mode: { fix: FIX, full: FULL, liveAudits: live, sets },
    static: staticQc,
    pinsDropped,
    steps,
    note: live
      ? "Live DB audits ran."
      : `Seed/small catalog (${sets} sets) — skipped live audits (need ${MIN_LIVE_SETS}+).`,
  };

  mkdirSync(join(process.cwd(), "data/crosscheck"), { recursive: true });
  const outPath = join(process.cwd(), "data/crosscheck/qc-report.json");
  writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);

  console.log(
    JSON.stringify(
      {
        errors: errors.length,
        warns: staticQc.issues.filter((i) => i.severity === "warn").length,
        pins: staticQc.pins,
        sets,
        liveAudits: live,
        pinsDropped: pinsDropped.length,
        steps: steps.map((s) => ({ name: s.name, ok: s.ok })),
        report: outPath,
      },
      null,
      2,
    ),
  );
  const requiredFailed = steps
    .filter((s) => !["roster-graduates", "held-relives", "next-captures"].includes(s.name))
    .some((s) => !s.ok);
  if (errors.length || requiredFailed) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
