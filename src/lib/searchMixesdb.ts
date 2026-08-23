/**
 * Operator assist + ingest lookup key: MixesDB “search by player URL”.
 *
 * Paste a YT / SC / hearthis / Mixcloud URL we already store. MixesDB
 * jumps to the mix page when they indexed that player. Do not search by
 * artist name, do not invent `/w/…` titles, do not browse Explorer.
 * CI never fetches MixesDB.
 *
 * @see https://www.mixesdb.com/w/Article:Search_By_Player_Url
 */

export type MixesdbPlayerHost =
  | "youtube"
  | "soundcloud"
  | "hearthis"
  | "mixcloud";

export type MixesdbPlayerQuery = {
  host: MixesdbPlayerHost;
  /** Sidebar search string MixesDB documents (no scheme). */
  search: string;
  /** Tight `insource:` token (video id or host/path). */
  insource: string;
};

const YT_ID = /^[\w-]{11}$/;

function youtubeId(raw: string): string | null {
  const s = raw.trim();
  if (YT_ID.test(s)) return s;
  try {
    const href = /^https?:\/\//i.test(s) ? s : `https://${s}`;
    const u = new URL(href);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (host === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && YT_ID.test(id) ? id : null;
    }
    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      const v = u.searchParams.get("v");
      if (v && YT_ID.test(v)) return v;
      const parts = u.pathname.split("/").filter(Boolean);
      const idx = parts.findIndex((p) => p === "embed" || p === "shorts" || p === "live");
      if (idx >= 0 && parts[idx + 1] && YT_ID.test(parts[idx + 1]!)) {
        return parts[idx + 1]!;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

function pathOnHost(
  raw: string,
  hosts: string[],
  minSegs = 2,
): { host: string; path: string } | null {
  try {
    const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const u = new URL(href);
    const host = u.hostname.replace(/^www\./, "").toLowerCase();
    if (!hosts.includes(host)) return null;
    const segs = u.pathname.split("/").filter(Boolean);
    if (segs.length < minSegs) return null;
    if (/^(search|you|tags|discover|explore)$/i.test(segs[0]!)) return null;
    return { host, path: segs.slice(0, 2).join("/") };
  } catch {
    return null;
  }
}

/** Distinctive player URL we already store — never an artist-name query. */
export function mixesdbPlayerQuery(
  url: string | null | undefined,
): MixesdbPlayerQuery | null {
  const raw = String(url || "").trim();
  if (!raw) return null;

  const yt = youtubeId(raw);
  if (yt) {
    return {
      host: "youtube",
      search: `youtube.com/watch?v=${yt}`,
      insource: yt,
    };
  }

  const sc = pathOnHost(raw, ["soundcloud.com", "m.soundcloud.com", "on.soundcloud.com"]);
  if (sc) {
    return {
      host: "soundcloud",
      search: `soundcloud.com/${sc.path}`,
      insource: `soundcloud.com/${sc.path}`,
    };
  }

  const ht = pathOnHost(raw, ["hearthis.at"]);
  if (ht) {
    return {
      host: "hearthis",
      search: `hearthis.at/${ht.path}`,
      insource: `hearthis.at/${ht.path}`,
    };
  }

  const mc = pathOnHost(raw, ["mixcloud.com"]);
  if (mc) {
    return {
      host: "mixcloud",
      search: `mixcloud.com/${mc.path}`,
      insource: `mixcloud.com/${mc.path}`,
    };
  }

  return null;
}

/** MixesDB Special:Search with `go=Go` — browser JS may jump to the mix page. */
export function searchMixesdbByPlayerUrl(
  url: string | null | undefined,
): string | null {
  const q = mixesdbPlayerQuery(url);
  if (!q) return null;
  return (
    "https://www.mixesdb.com/w/index.php?title=Special:Search&go=Go&search=" +
    encodeURIComponent(q.search)
  );
}
