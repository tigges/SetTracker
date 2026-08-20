/**
 * Inspect a Netscape cookies.txt without logging values.
 *
 * YouTube bot-walls on GitHub Actions are mostly caller-IP. Cookies still
 * help on a residential / self-hosted runner, and a stale jar burns the
 * Google session when used from a datacenter IP. This report is fill-null
 * metadata only — never cookie names' values.
 */

export type YoutubeCookieHealth = {
  present: boolean;
  netscapeHeader: boolean;
  youtubeRows: number;
  googleRows: number;
  hasLoginInfo: boolean;
  hasSapisid: boolean;
  hasSecure1psid: boolean;
  hasSecure1psidts: boolean;
  sessionOnly: boolean;
  /** Soonest persistent expiry (unix seconds), if any. */
  soonestExpirySec: number | null;
  stale: boolean;
  staleReason: string;
};

const SESSION_NAMES = new Set([
  "LOGIN_INFO",
  "SAPISID",
  "__Secure-1PSID",
  "__Secure-1PSIDTS",
  "__Secure-3PSID",
  "SID",
  "APISID",
  "HSID",
  "SSID",
]);

function hostKind(domain: string): "youtube" | "google" | "other" {
  const d = domain.replace(/^\./, "").toLowerCase();
  if (d === "youtube.com" || d.endsWith(".youtube.com") || d === "youtu.be") {
    return "youtube";
  }
  if (d === "google.com" || d.endsWith(".google.com") || d === "youtube-nocookie.com") {
    return d === "youtube-nocookie.com" ? "youtube" : "google";
  }
  return "other";
}

export function inspectYoutubeCookies(text: string, nowSec = Math.floor(Date.now() / 1000)): YoutubeCookieHealth {
  const raw = text.replace(/^\uFEFF/, "");
  const present = raw.trim().length > 0;
  const netscapeHeader = /^\s*#\s*(Netscape HTTP Cookie File|HTTP Cookie File)/im.test(raw);
  let youtubeRows = 0;
  let googleRows = 0;
  const names = new Set<string>();
  let soonestExpirySec: number | null = null;
  let persistent = 0;

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const cols = trimmed.split("\t");
    if (cols.length < 7) continue;
    const domain = cols[0] ?? "";
    const expiry = Number(cols[4]);
    const name = cols[5] ?? "";
    const kind = hostKind(domain);
    if (kind === "youtube") youtubeRows += 1;
    else if (kind === "google") googleRows += 1;
    else continue;
    if (SESSION_NAMES.has(name)) names.add(name);
    if (Number.isFinite(expiry) && expiry > 0) {
      persistent += 1;
      if (soonestExpirySec == null || expiry < soonestExpirySec) {
        soonestExpirySec = expiry;
      }
    }
  }

  const hasLoginInfo = names.has("LOGIN_INFO");
  const hasSapisid = names.has("SAPISID");
  const hasSecure1psid = names.has("__Secure-1PSID");
  const hasSecure1psidts = names.has("__Secure-1PSIDTS");
  const sessionOnly = present && persistent === 0 && youtubeRows + googleRows > 0;

  let stale = false;
  let staleReason = "";
  if (!present) {
    stale = true;
    staleReason = "no cookies.txt";
  } else if (youtubeRows < 3) {
    stale = true;
    staleReason = "too few youtube.com rows — re-export a logged-in Netscape jar";
  } else if (!hasLoginInfo && !hasSapisid && !hasSecure1psid) {
    stale = true;
    staleReason = "missing LOGIN_INFO / SAPISID — jar is not a logged-in YouTube session";
  } else if (sessionOnly) {
    stale = true;
    staleReason = "session-only cookies (expiry 0) — they die when the browser closes";
  } else if (soonestExpirySec != null && soonestExpirySec < nowSec + 3 * 86400) {
    stale = true;
    staleReason =
      soonestExpirySec < nowSec
        ? "persistent cookies already expired"
        : "persistent cookies expire within 3 days";
  }

  return {
    present,
    netscapeHeader,
    youtubeRows,
    googleRows,
    hasLoginInfo,
    hasSapisid,
    hasSecure1psid,
    hasSecure1psidts,
    sessionOnly,
    soonestExpirySec,
    stale,
    staleReason,
  };
}

export function cookieHealthNotice(h: YoutubeCookieHealth): string {
  const bits = [
    h.present ? "present" : "missing",
    h.netscapeHeader ? "netscape" : "no-header",
    `ytRows=${h.youtubeRows}`,
    h.hasLoginInfo ? "LOGIN_INFO" : "no-LOGIN_INFO",
    h.stale ? `stale:${h.staleReason}` : "fresh",
  ];
  return bits.join(" · ");
}

/** Operator next step — never includes cookie values. */
export function cookieRefreshHint(
  h: YoutubeCookieHealth,
  nowSec = Math.floor(Date.now() / 1000),
): string {
  if (!h.present) {
    return "On a desktop: npm run cookies:export — then gh secret set ACRCLOUD_YTDLP_COOKIES < .local/yt-cookies.txt";
  }
  if (h.stale) return `Refresh now — ${h.staleReason}`;
  if (h.soonestExpirySec != null) {
    const days = Math.floor((h.soonestExpirySec - nowSec) / 86400);
    if (days <= 7) return `Refresh this week — persistent cookies expire in ~${days} day(s)`;
    return `Jar looks logged-in · next refresh in ~${days} days (or after a diagnose bot-wall)`;
  }
  return "Jar looks logged-in";
}
