/**
 * Export a Netscape YouTube jar from a local desktop browser.
 * Never prints cookie values. Writes .local/yt-cookies.txt (gitignored).
 *
 *   npm run cookies:export
 *   npm run cookies:export -- --browser firefox
 *
 * Then, from the same machine (needs `gh` auth):
 *   gh secret set YT_DUMMY_COOKIE_LOCAL < .local/yt-cookies.txt
 *
 * This does not make GitHub-hosted Actions YouTube-steady. File Scan is
 * the CI path. Use the jar on a self-hosted residential runner, or for
 * catalog-acr-diagnose from a home IP.
 */
import { execFile } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import {
  cookieHealthNotice,
  cookieRefreshHint,
  inspectYoutubeCookies,
} from "../src/lib/ingest/enrich/youtubeCookies";
import { readFileSync } from "node:fs";

const execFileAsync = promisify(execFile);

const BROWSERS = new Set([
  "chrome",
  "chromium",
  "brave",
  "edge",
  "firefox",
  "safari",
]);

export function parseExportArgs(argv: string[]): {
  browser: string;
  outPath: string;
  dryRun: boolean;
} {
  let browser = "chrome";
  let outPath = ".local/yt-cookies.txt";
  let dryRun = false;
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--dry-run") dryRun = true;
    else if (a === "--browser" && argv[i + 1]) {
      browser = argv[++i]!.toLowerCase();
    } else if (a === "--out" && argv[i + 1]) {
      outPath = argv[++i]!;
    }
  }
  if (!BROWSERS.has(browser)) {
    throw new Error(`Unknown browser '${browser}'. Use: ${[...BROWSERS].join(", ")}`);
  }
  return { browser, outPath: resolve(outPath), dryRun };
}

export function ytDlpExportArgs(browser: string, outPath: string): string[] {
  return [
    "--cookies-from-browser",
    browser,
    "--cookies",
    outPath,
    "--skip-download",
    "--ignore-no-formats-error",
    "--no-warnings",
    "https://www.youtube.com/watch?v=jNQXAC9IVRw",
  ];
}

async function main() {
  const { browser, outPath, dryRun } = parseExportArgs(process.argv.slice(2));
  const args = ytDlpExportArgs(browser, outPath);
  console.log(`[yt-cookies] export from ${browser} → ${outPath}`);
  if (dryRun) {
    console.log(`yt-dlp ${args.map((a) => JSON.stringify(a)).join(" ")}`);
    return;
  }
  mkdirSync(dirname(outPath), { recursive: true });
  try {
    await execFileAsync("yt-dlp", args, { timeout: 60_000, maxBuffer: 2 * 1024 * 1024 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[yt-cookies] yt-dlp failed (is it installed? is the browser logged into YouTube on this machine?)");
    console.error(msg.split("\n").filter((l) => !/cookie/i.test(l) || /ERROR|failed|not found/i.test(l)).slice(0, 8).join("\n"));
    process.exitCode = 1;
    return;
  }
  const health = inspectYoutubeCookies(readFileSync(outPath, "utf8"));
  console.log(`[yt-cookies] ${cookieHealthNotice(health)}`);
  console.log(`[yt-cookies] ${cookieRefreshHint(health)}`);
  if (health.stale) {
    console.error("[yt-cookies] jar is not a logged-in YouTube session — log into YouTube in that browser and retry.");
    process.exitCode = 1;
    return;
  }
  console.log("[yt-cookies] next (from this machine, values stay local):");
  console.log(`  gh secret set YT_DUMMY_COOKIE_LOCAL < ${outPath}`);
}

const isEntry =
  process.argv[1]?.includes("export-yt-cookies") &&
  !process.argv[1]?.includes(".test.");
if (isEntry) {
  void main();
}
