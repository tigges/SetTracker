/**
 * ACRCloud diagnostic — proves the Identify pipeline end-to-end, independent of
 * the sparse-set queue. Two checks:
 *
 *   A) Known-track control: sample a short clip from a track ACRCloud definitely
 *      has in its DB (Rick Astley — Never Gonna Give You Up) via the SAME
 *      yt-dlp → ffmpeg → Identify path used for Relive enrich. A hit here means
 *      the whole YouTube path (cookies included) works; a miss means the
 *      pipeline — not the music — is the problem.
 *
 *   B) Real Relive probes: sample our curated YouTube sets at offsets where a
 *      well-known commercial track is playing (from captured 1001 seeds) and
 *      report identify results. This shows the expected hit-rate on live sets.
 *
 * Safe + read-only: never writes the DB. Requires ACRCLOUD_* creds; uses
 * ACRCLOUD_YTDLP_COOKIES when set. Prints a summary and exits non-zero only when
 * the known-track control fails for a transport/auth reason (so CI flags a
 * genuinely broken pipeline, not merely hard-to-match live audio).
 *
 * Run: npx tsx scripts/acr-diagnose.ts
 */
import {
  acrIdentify,
  sampleClipFromYoutube,
  ytDlpAvailable,
  type AcrHit,
} from "../src/lib/ingest/enrich/acrcloud";
import {
  fileScanConfig,
  listFileScanContainers,
  scanYoutube,
} from "../src/lib/ingest/enrich/acrFileScan";

type Probe = {
  label: string;
  url: string;
  offsetSec: number;
  /** Substring we expect in a correct hit (soft check). */
  expect?: string;
};

const SAMPLE_SEC = Number(process.env.ACRCLOUD_SAMPLE_SEC || 12) || 12;

// A) Control — a commercial track ACRCloud is guaranteed to know.
const CONTROL: Probe = {
  label: "CONTROL Rick Astley — Never Gonna Give You Up",
  url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  offsetSec: 60,
  expect: "astley",
};

// B) Real Relive probes at offsets of known commercial tracks (from 1001 seeds).
const RELIVE_PROBES: Probe[] = [
  {
    label: "Ingrosso TML WE2 @ 40:13 (Don't You Worry Child)",
    url: "https://www.youtube.com/watch?v=g4vR2VlhNtk",
    offsetSec: 40 * 60 + 20,
    expect: "worry",
  },
  {
    label: "Mike Williams TML WE2 @ 6:54 (Wannabe)",
    url: "https://www.youtube.com/watch?v=WnjXXOZ8Te8",
    offsetSec: 6 * 60 + 58,
    expect: "wannabe",
  },
  {
    label: "Boris Brejcha TML WE1 @ 0:12 (Cello Tears)",
    url: "https://www.youtube.com/watch?v=NpL_bT5vgmU",
    offsetSec: 30,
    expect: "cello",
  },
];

function fmtHit(hit: AcrHit | null): string {
  if (!hit) return "no match";
  const isrc = hit.isrc ? ` isrc=${hit.isrc}` : "";
  return `${hit.artist} — ${hit.title} (score ${hit.score}${isrc})`;
}

async function runProbe(p: Probe): Promise<{
  label: string;
  ok: boolean;
  detail: string;
  softMatch: boolean | null;
}> {
  const clip = await sampleClipFromYoutube(p.url, p.offsetSec, SAMPLE_SEC);
  if (!clip.ok) {
    return {
      label: p.label,
      ok: false,
      detail:
        clip.reason === "bot-wall"
          ? "YouTube bot-wall (File Scan is the CI path)"
          : `clip download failed (${clip.reason})`,
      softMatch: null,
    };
  }
  const res = await acrIdentify(clip.clip);
  if (!res.ok) {
    return { label: p.label, ok: false, detail: `ERROR ${res.error}`, softMatch: null };
  }
  const detail = `${fmtHit(res.hit)} [status ${res.statusCode} ${res.statusMsg}]`;
  const softMatch = p.expect
    ? Boolean(
        res.hit &&
          (res.hit.title.toLowerCase().includes(p.expect) ||
            res.hit.artist.toLowerCase().includes(p.expect)),
      )
    : null;
  return { label: p.label, ok: true, detail, softMatch };
}

async function main() {
  const host = (process.env.ACRCLOUD_HOST || "").trim();
  const key = (process.env.ACRCLOUD_ACCESS_KEY || "").trim();
  const secret = (process.env.ACRCLOUD_ACCESS_SECRET || "").trim();
  if (!host || !key || !secret) {
    console.error("::error::ACRCLOUD_HOST / ACCESS_KEY / ACCESS_SECRET missing");
    process.exit(1);
  }
  const hasYtDlp = await ytDlpAvailable();
  const hasCookies = Boolean((process.env.ACRCLOUD_YTDLP_COOKIES || "").trim());
  console.log(
    `[acr-diagnose] yt-dlp=${hasYtDlp} cookies=${hasCookies} sampleSec=${SAMPLE_SEC}`,
  );
  if (!hasYtDlp) {
    console.error("::error::yt-dlp not on PATH — cannot sample YouTube");
    process.exit(1);
  }

  console.log("\n=== A) Known-track control ===");
  const control = await runProbe(CONTROL);
  console.log(`${control.ok ? "•" : "✗"} ${control.label}\n    ${control.detail}`);

  console.log("\n=== B) Relive probes (live-set hit-rate) ===");
  const results = [];
  for (const p of RELIVE_PROBES) {
    const r = await runProbe(p);
    const mark = r.softMatch === true ? "✓" : r.softMatch === false ? "≈" : "•";
    console.log(`${mark} ${r.label}\n    ${r.detail}`);
    results.push(r);
  }

  const controlHit = control.ok && /score \d/.test(control.detail) && !/no match/.test(control.detail);
  const reliveHits = results.filter((r) => r.ok && !/no match/.test(r.detail)).length;

  // C) File Scanning — server-side scan of ONE real Relive that yt-dlp cannot
  // fetch from CI. Proves the FS credentials + pipeline bypass the bot wall.
  let fsLine = "file-scan: not configured (set ACRCLOUD_FS_TOKEN + ACRCLOUD_FS_CONTAINER_ID)";
  const fsCfg = fileScanConfig();
  if (fsCfg) {
    // Short known track (~3.5m) so the server-side scan completes fast and
    // gives a definitive pipeline answer; long festival sets take much longer.
    const fsUrl =
      process.env.ACRCLOUD_FS_TEST_URL ||
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    console.log("\n=== C) File Scanning (server-side) ===");
    // Always list the containers this token can see, so a wrong id/region is
    // obvious ("Invalid Container").
    try {
      const containers = await listFileScanContainers(fsCfg.token);
      if (containers.length === 0) {
        console.log(
          "  token sees NO File Scanning containers in eu-west-1/us-west-2/ap-southeast-1 — check token/plan",
        );
      } else {
        console.log("  containers visible to this token:");
        for (const c of containers) {
          const mark = c.id === fsCfg.containerId ? " <- configured" : "";
          console.log(
            `    region=${c.region} id=${c.id} name="${c.name}"${mark}`,
          );
        }
      }
    } catch (e) {
      console.log(`  container list failed: ${e instanceof Error ? e.message : e}`);
    }
    console.log(`scanning ${fsUrl} (container ${fsCfg.containerId}) …`);
    try {
      const scanHits = await scanYoutube(fsCfg, fsUrl, {
        timeoutMs: Number(process.env.ACRCLOUD_FS_TIMEOUT_MS || 480_000),
        pollMs: Number(process.env.ACRCLOUD_FS_POLL_MS || 15_000),
      });
      if (scanHits == null) {
        fsLine = "file-scan: submit/poll FAILED (token/container/region?)";
      } else {
        fsLine = `file-scan: ${scanHits.length} tracks identified`;
        for (const h of scanHits.slice(0, 5)) {
          console.log(
            `  ${String(h.offsetSec).padStart(5)}s  ${h.hit.artist} — ${h.hit.title} (${h.hit.score})`,
          );
        }
      }
    } catch (err) {
      fsLine = `file-scan: ERROR ${err instanceof Error ? err.message : String(err)}`;
    }
    console.log(fsLine);
  }

  const summary = [
    "",
    "=== SUMMARY ===",
    `control: ${controlHit ? "HIT ✓ (pipeline works)" : "MISS ✗"}`,
    `relive:  ${reliveHits}/${RELIVE_PROBES.length} clips identified (yt-dlp path)`,
    fsLine,
  ];
  console.log(summary.join("\n"));

  const gh = process.env.GITHUB_STEP_SUMMARY;
  if (gh) {
    const { appendFileSync } = await import("node:fs");
    appendFileSync(
      gh,
      [
        "## ACRCloud diagnostic",
        "",
        `- yt-dlp: ${hasYtDlp} · cookies: ${hasCookies}`,
        `- **control**: ${controlHit ? "HIT ✓" : "MISS ✗"} — ${control.detail}`,
        `- **relive**: ${reliveHits}/${RELIVE_PROBES.length} identified (yt-dlp)`,
        `- **${fsLine}**`,
        "",
        ...results.map((r) => `  - ${r.label}: ${r.detail}`),
        "",
      ].join("\n"),
    );
  }

  // Fail only when the control transport/auth clearly broke — a genuine "no
  // match" on the control still indicates a pipeline problem worth flagging.
  if (!control.ok) {
    console.error(`::error::control probe failed: ${control.detail}`);
    process.exit(1);
  }
  if (!controlHit) {
    console.error(
      "::warning::control track returned no match — Identify pipeline may be misconfigured (clip/format/score), not just hard live audio",
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
