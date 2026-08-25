/**
 * Mandatory pre-flight disclosure for billable audio recognition
 * (ACRCloud Identify, ACRCloud File Scanning, AudD recognize).
 *
 * These run in the program (not by hand), but no billable request is sent
 * until this plan has been printed for the current process AND spend is
 * confirmed for that run. `acrIdentify()`, `submitPlatformScan()` and the
 * AudD recognize calls throw otherwise, so a new call site cannot quietly
 * bill. One confirm (`ACRCLOUD_CONFIRM_SPEND`) covers all three.
 *
 * Pure module (no fs) so /stats can show the same wording.
 *
 * Unit prices are rounded operator estimates, not a billing quote.
 * Override with ACR_USD_PER_IDENTIFY_LOW/HIGH and
 * ACR_USD_PER_FS_HOUR_LOW/HIGH once you have the real plan rate.
 */

/** Billable audio-recognition calls. AudD runs inside the Identify pass. */
export type AcrSpendMode = "identify" | "filescan" | "audd";

export type AcrUnitPrice = { low: number; high: number };

/** Per Identify request (one audio clip). */
export const ACR_USD_PER_IDENTIFY: AcrUnitPrice = { low: 0.002, high: 0.006 };

/** Per audio-hour submitted to a File Scanning container. */
export const ACR_USD_PER_FS_HOUR: AcrUnitPrice = { low: 0.05, high: 0.15 };

/** Per AudD recognize request (paid tier, api_token). */
export const ACR_USD_PER_AUDD: AcrUnitPrice = { low: 0.003, high: 0.008 };

function priceFromEnv(
  base: AcrUnitPrice,
  lowKey: string,
  highKey: string,
  env: Record<string, string | undefined>,
): AcrUnitPrice {
  const low = Number(env[lowKey]);
  const high = Number(env[highKey]);
  return {
    low: Number.isFinite(low) && low >= 0 ? low : base.low,
    high: Number.isFinite(high) && high >= 0 ? high : base.high,
  };
}

export function acrIdentifyPrice(
  env: Record<string, string | undefined> = process.env,
): AcrUnitPrice {
  return priceFromEnv(
    ACR_USD_PER_IDENTIFY,
    "ACR_USD_PER_IDENTIFY_LOW",
    "ACR_USD_PER_IDENTIFY_HIGH",
    env,
  );
}

export function acrFileScanHourPrice(
  env: Record<string, string | undefined> = process.env,
): AcrUnitPrice {
  return priceFromEnv(
    ACR_USD_PER_FS_HOUR,
    "ACR_USD_PER_FS_HOUR_LOW",
    "ACR_USD_PER_FS_HOUR_HIGH",
    env,
  );
}

export function auddPrice(
  env: Record<string, string | undefined> = process.env,
): AcrUnitPrice {
  return priceFromEnv(
    ACR_USD_PER_AUDD,
    "ACR_USD_PER_AUDD_LOW",
    "ACR_USD_PER_AUDD_HIGH",
    env,
  );
}

export type AcrSpendEstimate = {
  mode: AcrSpendMode;
  /** Identify: clips. File Scan: videos submitted. */
  units: number;
  unitLabel: string;
  usdLow: number;
  usdHigh: number;
  summary: string;
};

export function acrSpendConfirmed(
  env: Record<string, string | undefined> = process.env,
): boolean {
  const v = (env.ACRCLOUD_CONFIRM_SPEND || "").trim().toLowerCase();
  return v === "1" || v === "yes" || v === "true";
}

export function formatUsdRange(low: number, high: number): string {
  const fmt = (n: number) => `$${n.toFixed(2)}`;
  if (Math.abs(high - low) < 0.005) return `≈ ${fmt(low)}`;
  return `≈ ${fmt(low)}–${fmt(high)}`;
}

/** Worst case: every set burns its full probe budget. */
export function estimateAcrIdentifySpend(input: {
  sets: number;
  probesPerSet: number;
  env?: Record<string, string | undefined>;
}): AcrSpendEstimate {
  const env = input.env ?? process.env;
  const price = acrIdentifyPrice(env);
  const units = Math.max(0, input.sets) * Math.max(0, input.probesPerSet);
  const usdLow = units * price.low;
  const usdHigh = units * price.high;
  return {
    mode: "identify",
    units,
    unitLabel: "clips",
    usdLow,
    usdHigh,
    summary: `${formatUsdRange(usdLow, usdHigh)} · up to ${units} clips (${input.sets} sets × ${input.probesPerSet})`,
  };
}

export function estimateAcrFileScanSpend(input: {
  videos: number;
  avgHours?: number;
  env?: Record<string, string | undefined>;
}): AcrSpendEstimate {
  const env = input.env ?? process.env;
  const price = acrFileScanHourPrice(env);
  const videos = Math.max(0, input.videos);
  const hours = videos * (input.avgHours ?? 1.5);
  const usdLow = hours * price.low;
  const usdHigh = hours * price.high;
  return {
    mode: "filescan",
    units: videos,
    unitLabel: "videos",
    usdLow,
    usdHigh,
    summary: `${formatUsdRange(usdLow, usdHigh)} · up to ${videos} videos (~${hours.toFixed(1)} audio-hours)`,
  };
}

/** AudD is tried before ACR on each clip, so it can bill on its own. */
export function estimateAuddSpend(input: {
  clips: number;
  env?: Record<string, string | undefined>;
}): AcrSpendEstimate {
  const price = auddPrice(input.env ?? process.env);
  const units = Math.max(0, input.clips);
  const usdLow = units * price.low;
  const usdHigh = units * price.high;
  return {
    mode: "audd",
    units,
    unitLabel: "clips",
    usdLow,
    usdHigh,
    summary: `${formatUsdRange(usdLow, usdHigh)} · up to ${units} clips`,
  };
}

const AUDD_DISCLOSURE = {
  researches:
    "Same question as ACR Identify — which track plays at a sampled offset — tried first on each clip when AUDD_ANALYZE=1",
  sends:
    "The same short audio clip, plus your AudD api_token (paid tier)",
  writes:
    "Feeds the ACR Identify result path, so writes are the same gap-fill \"fingerprint\" rows",
};

const IDENTIFY_DISCLOSURE = {
  researches:
    "Which tracks play at sampled offsets inside a set we already host, so unnamed cues get a title",
  sends:
    "Short audio clips (default 12s) cut from the official SoundCloud / hearthis / YouTube playback we already store",
  writes:
    "Gap-fill Played rows with provenance \"fingerprint\" only; never overwrites sourceUrl / sourceName or a 1001tl / community row",
};

const FILESCAN_DISCLOSURE = {
  researches:
    "Full-length track detection for a YouTube set, returned as timestamped matches",
  sends:
    "The YouTube URL itself — ACRCloud downloads and fingerprints it server-side (no clip upload, no yt-dlp)",
  writes:
    "Same provenance \"fingerprint\" gap-fill rows; held official playbacks are skipped",
};

export function acrDisclosure(mode: AcrSpendMode) {
  if (mode === "audd") return AUDD_DISCLOSURE;
  return mode === "identify" ? IDENTIFY_DISCLOSURE : FILESCAN_DISCLOSURE;
}

const MODE_TITLE: Record<AcrSpendMode, string> = {
  identify: "ACRCloud Identify (audio clips)",
  filescan: "ACRCloud File Scanning (YouTube URLs)",
  audd: "AudD recognize (audio clips, paid token)",
};

export function formatAcrPlan(est: AcrSpendEstimate): string {
  const d = acrDisclosure(est.mode);
  const title = MODE_TITLE[est.mode];
  return [
    `=== ${title} — nothing has been sent yet ===`,
    `Researches: ${d.researches}`,
    `Sends:      ${d.sends}`,
    `Writes:     ${d.writes}`,
    "",
    `Estimated cost: ${formatUsdRange(est.usdLow, est.usdHigh)} for up to ${est.units} ${est.unitLabel}.`,
    "Estimate only — a rounded operator range, not a billing quote. Set",
    est.mode === "identify"
      ? "ACR_USD_PER_IDENTIFY_LOW/HIGH to match your plan rate."
      : est.mode === "audd"
        ? "ACR_USD_PER_AUDD_LOW/HIGH to match your plan rate."
        : "ACR_USD_PER_FS_HOUR_LOW/HIGH to match your plan rate.",
    "===============================================",
  ].join("\n");
}

export function formatAcrPlanMarkdown(est: AcrSpendEstimate): string {
  const d = acrDisclosure(est.mode);
  return [
    `### ${MODE_TITLE[est.mode]} plan (pre-flight)`,
    "",
    `**Estimated cost:** ${formatUsdRange(est.usdLow, est.usdHigh)} · up to ${est.units} ${est.unitLabel}`,
    "",
    "| | |",
    "| --- | --- |",
    `| Researches | ${d.researches} |`,
    `| Sends | ${d.sends} |`,
    `| Writes | ${d.writes} |`,
    "",
    "Rounded operator estimate, not a billing quote.",
  ].join("\n");
}

const announced = new Set<AcrSpendMode>();

/** Print the disclosure and unlock billable ACR calls for this mode. */
export function announceAcrPlan(
  est: AcrSpendEstimate,
  log: (msg: string) => void = console.log,
): void {
  log(formatAcrPlan(est));
  announced.add(est.mode);
}

export function acrPlanAnnounced(mode: AcrSpendMode): boolean {
  return announced.has(mode);
}

/**
 * Gate for the billable call sites. Throws with an actionable message so a
 * missed disclosure fails loudly instead of silently spending.
 */
export function assertAcrSpendAllowed(
  mode: AcrSpendMode,
  env: Record<string, string | undefined> = process.env,
): void {
  if (!acrPlanAnnounced(mode)) {
    throw new Error(
      `ACR ${mode} blocked — announceAcrPlan() must disclose what is sent and the cost estimate before any billable request`,
    );
  }
  if (!acrSpendConfirmed(env)) {
    throw new Error(
      `ACR ${mode} blocked — confirm spend (ACRCLOUD_CONFIRM_SPEND=1) for this run`,
    );
  }
}

/** Test helper — do not use from ingest. */
export function resetAcrPlanForTests(): void {
  announced.clear();
}
