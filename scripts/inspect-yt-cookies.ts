/**
 * Summarize ACRCLOUD_YTDLP_COOKIES without printing values.
 * Usage: npx tsx scripts/inspect-yt-cookies.ts [--path cookies.txt]
 */
import { readFileSync } from "node:fs";
import {
  cookieHealthNotice,
  cookieRefreshHint,
  inspectYoutubeCookies,
} from "../src/lib/ingest/enrich/youtubeCookies";

function argPath(): string {
  const i = process.argv.indexOf("--path");
  if (i >= 0 && process.argv[i + 1]) return process.argv[i + 1]!;
  return (process.env.ACRCLOUD_YTDLP_COOKIES || "").trim();
}

const path = argPath();
const text = path ? readFileSync(path, "utf8") : "";
const health = inspectYoutubeCookies(text);
const notice = cookieHealthNotice(health);
console.log(`[yt-cookies] ${notice}`);
console.log(`[yt-cookies] ${cookieRefreshHint(health)}`);
if (health.stale) {
  console.log(`::warning title=YouTube cookies::${notice}`);
} else {
  console.log(`::notice title=YouTube cookies::${notice}`);
}
