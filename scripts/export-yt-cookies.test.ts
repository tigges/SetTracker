import assert from "node:assert/strict";
import { parseExportArgs, ytDlpExportArgs } from "./export-yt-cookies";

const parsed = parseExportArgs(["--browser", "firefox", "--out", "/tmp/yt-cookies.txt"]);
assert.equal(parsed.browser, "firefox");
assert.ok(parsed.outPath.endsWith("yt-cookies.txt"));
assert.equal(parsed.dryRun, false);

const dry = parseExportArgs(["--dry-run"]);
assert.equal(dry.browser, "chrome");
assert.equal(dry.dryRun, true);

const args = ytDlpExportArgs("chrome", "/tmp/yt-cookies.txt");
assert.deepEqual(args.slice(0, 4), [
  "--cookies-from-browser",
  "chrome",
  "--cookies",
  "/tmp/yt-cookies.txt",
]);
assert.ok(args.includes("--skip-download"));

assert.throws(() => parseExportArgs(["--browser", "netscape"]));

console.log("export-yt-cookies.test.ts ok");
