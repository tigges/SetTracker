/**
 * MusicBrainz recording lookup — fills sparse label / releaseDate / duration.
 * Respects MB rate limits via caller sleep; requires a descriptive User-Agent.
 */

const UA =
  "SetRadar/0.2.7 (https://setradar.ai; track metadata; contact via github.com/tigges/SetTracker)";

export type MusicBrainzTrackMeta = {
  durationSec?: number | null;
  releaseDate?: string | null; // ISO date yyyy-mm-dd
  labelName?: string | null;
};

type MbRecording = {
  title?: string;
  length?: number; // ms
  releases?: {
    date?: string;
    title?: string;
    "label-info"?: { label?: { name?: string } }[];
  }[];
  "artist-credit"?: { name?: string; artist?: { name?: string } }[];
};

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function nameClose(a: string, b: string): boolean {
  const na = norm(a);
  const nb = norm(b);
  return na === nb || na.includes(nb) || nb.includes(na);
}

export async function resolveTrackMetaMusicBrainz(
  title: string,
  artistName: string,
): Promise<MusicBrainzTrackMeta | null> {
  const primary =
    artistName.split(/[,&]| b2b | x /i)[0]?.trim() || artistName;
  const q = encodeURIComponent(
    `recording:"${title.replace(/"/g, "")}" AND artist:"${primary.replace(/"/g, "")}"`,
  );
  const url = `https://musicbrainz.org/ws/2/recording/?query=${q}&fmt=json&limit=5`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { recordings?: MbRecording[] };
    const rows = json.recordings ?? [];
    for (const row of rows) {
      if (!row.title || !nameClose(row.title, title)) continue;
      const credit =
        row["artist-credit"]?.[0]?.name ??
        row["artist-credit"]?.[0]?.artist?.name ??
        "";
      if (credit && !nameClose(credit, primary) && !nameClose(credit, artistName)) {
        continue;
      }

      const release = row.releases?.[0];
      const labelName =
        release?.["label-info"]?.find((li) => li.label?.name)?.label?.name ??
        null;
      const durationSec =
        typeof row.length === "number" && row.length > 0
          ? Math.round(row.length / 1000)
          : null;
      const releaseDate = release?.date && /^\d{4}/.test(release.date)
        ? release.date.length === 4
          ? `${release.date}-01-01`
          : release.date.length === 7
            ? `${release.date}-01`
            : release.date
        : null;

      if (!durationSec && !releaseDate && !labelName) continue;
      return { durationSec, releaseDate, labelName };
    }
  } catch {
    /* ignore */
  }
  return null;
}
