/**
 * ACRCloud diagnostic — proves the CI fingerprint path, independent of
 * the sparse-set queue.
 *
 *   A) Known-track control via yt-dlp → ffmpeg → Identify. On GitHub IPs
 *      this usually bot-walls; that is expected, not a pipeline break.
 *   B) Optional official-playback probes on the same yt-dlp path (skipped
 *      on CI when File Scan is configured — those clips hit the same wall).
 *   C) File Scanning of the same control video. This is the CI YouTube
 *      path. A named hit (even below the catalog write floor of 55) means
 *      the Console token + container work.
 *
 * Safe + read-only: never writes the DB. Exits non-zero only when File
 * Scan is configured and does not name the control track, or Identify
 * fails for a non-YouTube-wall reason (bad HMAC, missing yt-dlp, …).
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
  diagnoseVerdict,
  isControlTrackMatch,
} from "../src/lib/ingest/enrich/acrDiagnose";
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

// B) Official-playback probes at offsets of known commercial tracks (from 1001 seeds).
const PLAYBACK_PROBES: Probe[] = [
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

  console.log("\n=== A) Known-track control (yt-dlp Identify) ===");
  const control = await runProbe(CONTROL);
  console.log(`${control.ok ? "•" : "✗"} ${control.label}\n    ${control.detail}`);

  const identifyHit =
    control.ok && /score \d/.test(control.detail) && !/no match/.test(control.detail);
  const fsCfg = fileScanConfig();
  const skipPlayback =
    Boolean(fsCfg) && !control.ok && /bot-wall|unavailable/i.test(control.detail);

  let playbackHits = 0;
  let playbackNote = "";
  const results: Awaited<ReturnType<typeof runProbe>>[] = [];
  if (skipPlayback) {
    playbackNote = "skipped (CI YouTube wall; File Scan is the path)";
    console.log(`\n=== B) Playback probes (yt-dlp) ===\n  ${playbackNote}`);
  } else {
    console.log("\n=== B) Playback probes (live-set hit-rate) ===");
    for (const p of PLAYBACK_PROBES) {
      const r = await runProbe(p);
      const mark = r.softMatch === true ? "✓" : r.softMatch === false ? "≈" : "•";
      console.log(`${mark} ${r.label}\n    ${r.detail}`);
      results.push(r);
    }
    playbackHits = results.filter((r) => r.ok && !/no match/.test(r.detail)).length;
    playbackNote = `${playbackHits}/${PLAYBACK_PROBES.length} clips identified (yt-dlp path)`;
  }

  // C) File Scanning — server-side scan of the control video. Proves the
  // FS credentials + pipeline bypass the bot wall. Report every music row
  // (including scores below the catalog write floor) so a 47-score Astley
  // still counts as a control HIT.
  let fsLine = "file-scan: not configured (set ACRCLOUD_FS_TOKEN + ACRCLOUD_FS_CONTAINER_ID)";
  let fsScanFailed = false;
  let fsControlHit = false;
  let fsControlDetail = "";
  if (fsCfg) {
    const fsUrl =
      process.env.ACRCLOUD_FS_TEST_URL ||
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    console.log("\n=== C) File Scanning (server-side) ===");
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
        minScore: 1,
      });
      if (scanHits == null) {
        fsScanFailed = true;
        fsLine = "file-scan: submit/poll FAILED (token/container/region?)";
      } else {
        const named = scanHits.find((h) =>
          isControlTrackMatch(h.hit.artist, h.hit.title, CONTROL.expect),
        );
        fsControlHit = Boolean(named);
        if (named) {
          fsControlDetail = `score ${named.hit.score}`;
        }
        const writeFloor = fsCfg.minScore;
        const aboveFloor = scanHits.filter((h) => h.hit.score >= writeFloor).length;
        fsLine = named
          ? `file-scan: ${named.hit.artist} — ${named.hit.title} (${named.hit.score}; ${aboveFloor}/${scanHits.length} ≥ write floor ${writeFloor})`
          : `file-scan: ${scanHits.length} tracks identified (control not named; ${aboveFloor} ≥ write floor ${writeFloor})`;
        for (const h of scanHits.slice(0, 5)) {
          console.log(
            `  ${String(h.offsetSec).padStart(5)}s  ${h.hit.artist} — ${h.hit.title} (${h.hit.score})`,
          );
        }
      }
    } catch (err) {
      fsScanFailed = true;
      fsLine = `file-scan: ERROR ${err instanceof Error ? err.message : String(err)}`;
    }
    console.log(fsLine);
  }

  const verdict = diagnoseVerdict({
    identifyOk: control.ok,
    identifyDetail: control.detail,
    identifyHit,
    fsConfigured: Boolean(fsCfg),
    fsScanFailed,
    fsControlHit,
    fsControlDetail,
  });

  const summary = [
    "",
    "=== SUMMARY ===",
    `control: ${verdict.controlLabel}`,
    `  yt-dlp: ${control.detail}`,
    `playback:  ${playbackNote}`,
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
        `- **control**: ${verdict.controlLabel}`,
        `- **yt-dlp**: ${control.detail}`,
        `- **playback**: ${playbackNote}`,
        `- **${fsLine}**`,
        "",
        ...results.map((r) => `  - ${r.label}: ${r.detail}`),
        "",
      ].join("\n"),
    );
  }

  if (!verdict.ok) {
    console.error(`::error::control probe failed: ${verdict.failReason ?? control.detail}`);
    process.exit(1);
  }
  if (!identifyHit && !fsControlHit) {
    console.error(
      "::warning::control track returned no match — Identify/File Scan may be misconfigured",
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
