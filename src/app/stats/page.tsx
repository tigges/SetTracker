import Link from "next/link";
import {
  getCatalogStats,
  type StatsDjRow,
  type StatsFingerprintTrack,
  type StatsSparseSet,
  type StatsUnresolvedId,
} from "@/lib/catalogStats";
import { STATUS_META, fmtDuration, type IdStatus } from "@/lib/status";

export const metadata = {
  title: "Stats — setradar.ai",
  description:
    "Catalog health: identification, ACRCloud fingerprints, handles, and gaps.",
};

function pct(part: number, whole: number): string {
  if (whole <= 0) return "—";
  return `${Math.round((part / whole) * 100)}%`;
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="border-b border-line py-3 pr-4">
      <div className="mono text-[11px] uppercase tracking-[0.12em] text-muted2">
        {label}
      </div>
      <div className="mt-1 text-2xl font-extrabold tracking-tight tabular-nums">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {hint ? (
        <div className="mt-0.5 mono text-[11px] text-muted2">{hint}</div>
      ) : null}
    </div>
  );
}

function BarRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color?: string;
}) {
  const width = total > 0 ? Math.max(2, Math.round((count / total) * 100)) : 0;
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-1.5">
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-2 text-[13px]">
          <span className="truncate text-ink">{label}</span>
          <span className="mono shrink-0 text-[12px] text-muted2">
            {count.toLocaleString()} · {pct(count, total)}
          </span>
        </div>
        <div className="mt-1 h-1 overflow-hidden rounded-sm bg-line">
          <div
            className="h-full rounded-sm"
            style={{
              width: `${width}%`,
              background: color ?? "var(--brand)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function FingerprintTrackList({ tracks }: { tracks: StatsFingerprintTrack[] }) {
  const shown = tracks.slice(0, 40);
  return (
    <div>
      <h3 className="mb-2 text-[13px] font-semibold text-ink">
        Tracks identified by ACRCloud
      </h3>
      <ul className="divide-y divide-line border-y border-line">
        {shown.map((t) => (
          <li key={t.id} className="py-2.5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
              <div className="min-w-0">
                <Link
                  href={`/tracks/${t.slug}`}
                  className="block truncate text-[14px] font-medium text-ink hover:text-brand"
                >
                  {t.artistName} — {t.title}
                </Link>
                {t.setSlug ? (
                  <Link
                    href={`/sets/${t.setSlug}`}
                    className="mono mt-0.5 block truncate text-[11px] text-muted2 hover:text-ink"
                  >
                    in {t.setTitle}
                  </Link>
                ) : null}
              </div>
              <span className="mono shrink-0 text-[12px] text-muted2">
                {t.playCount}×
              </span>
            </div>
          </li>
        ))}
      </ul>
      {tracks.length > shown.length ? (
        <p className="mt-2 mono text-[11px] text-muted2">
          Showing {shown.length} of {tracks.length}
        </p>
      ) : null}
    </div>
  );
}

function SparseSetList({ rows }: { rows: StatsSparseSet[] }) {
  const shown = rows.slice(0, 40);
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">
            Sparse sets · fingerprint queue
          </h2>
          <p className="mt-0.5 text-[13px] text-muted2">
            ≥30m with playback and &lt;7 logged plays — best ACRCloud /
            re-parse targets.
          </p>
        </div>
        <span className="mono text-[12px] text-muted2">{rows.length}</span>
      </div>
      {shown.length === 0 ? (
        <p className="text-[13px] text-muted2">No sparse long sets.</p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {shown.map((set) => (
            <li key={set.id}>
              <Link
                href={`/sets/${set.slug}`}
                className="flex items-baseline justify-between gap-3 py-2.5 text-[14px] transition-colors hover:text-brand"
              >
                <span className="min-w-0 truncate font-medium">{set.title}</span>
                <span className="mono shrink-0 text-[12px] text-muted2">
                  {set.playCount}tr · {fmtDuration(set.durationSec)}
                  {set.playbackHost ? ` · ${set.playbackHost}` : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {rows.length > shown.length ? (
        <p className="mt-2 mono text-[11px] text-muted2">
          Showing {shown.length} of {rows.length}
        </p>
      ) : null}
    </section>
  );
}

function UnresolvedIdList({ rows }: { rows: StatsUnresolvedId[] }) {
  const shown = rows.slice(0, 40);
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">
            Unresolved IDs · resolve queue
          </h2>
          <p className="mt-0.5 text-[13px] text-muted2">
            Hottest open ID labels — community Suggest ID →{" "}
            <span className="mono">data/resolutions.json</span>.
          </p>
        </div>
        <span className="mono text-[12px] text-muted2">{rows.length}</span>
      </div>
      {shown.length === 0 ? (
        <p className="text-[13px] text-muted2">No unresolved IDs.</p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {shown.map((row) => (
            <li key={row.id} className="py-2.5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
                <div className="min-w-0">
                  <span className="block truncate text-[14px] font-medium text-ink">
                    {row.label}
                  </span>
                  {row.setSlug ? (
                    <Link
                      href={`/sets/${row.setSlug}`}
                      className="mono mt-0.5 block truncate text-[11px] text-muted2 hover:text-ink"
                    >
                      {row.setTitle}
                    </Link>
                  ) : null}
                </div>
                <span className="mono shrink-0 text-[12px] text-muted2">
                  {row.playCount}×
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function DjGapList({
  title,
  blurb,
  rows,
  empty,
  meta,
}: {
  title: string;
  blurb: string;
  rows: StatsDjRow[];
  empty: string;
  meta: (d: StatsDjRow) => string;
}) {
  const shown = rows.slice(0, 40);
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          <p className="mt-0.5 text-[13px] text-muted2">{blurb}</p>
        </div>
        <span className="mono text-[12px] text-muted2">{rows.length}</span>
      </div>
      {shown.length === 0 ? (
        <p className="text-[13px] text-muted2">{empty}</p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {shown.map((d) => (
            <li key={d.id}>
              <Link
                href={`/djs/${d.slug}`}
                className="flex items-baseline justify-between gap-3 py-2.5 text-[14px] transition-colors hover:text-brand"
              >
                <span className="min-w-0 truncate font-medium">{d.name}</span>
                <span className="mono shrink-0 text-[12px] text-muted2">
                  {meta(d)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {rows.length > shown.length ? (
        <p className="mt-2 mono text-[11px] text-muted2">
          Showing {shown.length} of {rows.length}
        </p>
      ) : null}
    </section>
  );
}

export default async function StatsPage() {
  const s = await getCatalogStats();
  const playTotal = s.totals.plays;

  return (
    <div>
      <div className="mb-10">
        <p className="eyebrow">Catalog</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Stats</h1>
        <p className="mt-2 max-w-2xl text-[14px] text-muted">
          Public catalog health for now — counts, coverage, and the gap lists
          worth pinning next. Will move behind admin later.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="mb-1 text-lg font-bold tracking-tight">Totals</h2>
        <p className="mb-4 text-[13px] text-muted2">
          Everything stored, including thin DJ rows hidden from Browse.
        </p>
        <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Sets" value={s.totals.sets} />
          <Stat
            label="DJs"
            value={s.totals.djs}
            hint={`${s.djs.browseReady} browse-ready`}
          />
          <Stat label="Tracks" value={s.totals.tracks} />
          <Stat label="Plays" value={s.totals.plays} />
          <Stat label="Labels" value={s.totals.labels} />
          <Stat label="Venues" value={s.totals.venues} />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-1 text-lg font-bold tracking-tight">DJ coverage</h2>
        <p className="mb-4 text-[13px] text-muted2">
          Handle + set + tracklist signals that drive the Browse directory.
        </p>
        <div className="grid grid-cols-2 gap-x-6 sm:grid-cols-3 lg:grid-cols-4">
          <Stat
            label="Browse ready"
            value={s.djs.browseReady}
            hint={pct(s.djs.browseReady, s.totals.djs)}
          />
          <Stat
            label="Has handle"
            value={s.djs.withHandle}
            hint={`${s.djs.noHandle} missing`}
          />
          <Stat
            label="Has sets"
            value={s.djs.withSets}
            hint={`${s.djs.noSets} with 0`}
          />
          <Stat
            label="Empty tracklists"
            value={s.djs.emptyTracklists}
            hint="sets but 0 plays"
          />
          <Stat
            label="No thumbnail"
            value={s.djs.noThumb}
            hint={`${s.djs.noThumbWithSets.length} with sets`}
          />
          <Stat label="Junk names" value={s.djs.junk} />
          <Stat
            label="Sets w/ plays"
            value={s.sets.withPlays}
            hint={`${s.sets.empty} empty sets`}
          />
          <Stat
            label="Thin tracklists"
            value={s.density.thin + s.density.severe}
            hint={`${s.density.severe} severe · ${s.density.scanned} scanned ≥30m`}
          />
          <Stat
            label="Sparse ≥30m"
            value={s.sparseSets.length}
            hint="<7 plays · fingerprint targets"
          />
          <Stat
            label="No YouTube · sets"
            value={s.djs.missingYoutube}
            hint="description harvest / pins"
          />
          <Stat
            label="No SoundCloud · sets"
            value={s.djs.missingSoundcloud}
            hint="crosslink / pins"
          />
          <Stat
            label="ACRCloud IDs"
            value={s.fingerprint.identified}
            hint={`${s.fingerprint.uniqueTracks} tracks · ${s.fingerprint.setsTouched} sets`}
          />
          <Stat
            label="Tracks · Beatport"
            value={s.tracks.withBeatport}
            hint={pct(s.tracks.withBeatport, s.totals.tracks)}
          />
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              ACRCloud fingerprint
            </h2>
            <p className="mt-0.5 text-[13px] text-muted2">
              Timeline rows with provenance{" "}
              <span className="mono">fingerprint</span> from{" "}
              <span className="mono">npm run enrich:fingerprint</span>. Gap-fill
              only — never overwrites source tracklists.
            </p>
          </div>
          <span className="mono text-[12px] text-muted2">
            {s.fingerprint.plays} plays
          </span>
        </div>
        <div className="mb-6 grid grid-cols-2 gap-x-6 sm:grid-cols-4">
          <Stat
            label="Identified"
            value={s.fingerprint.identified}
            hint={pct(s.fingerprint.identified, Math.max(1, s.fingerprint.plays))}
          />
          <Stat
            label="Unresolved / weak"
            value={s.fingerprint.unresolved}
            hint="no match or low score"
          />
          <Stat
            label="Unique tracks"
            value={s.fingerprint.uniqueTracks}
          />
          <Stat
            label="Sets touched"
            value={s.fingerprint.setsTouched}
          />
        </div>
        {s.fingerprint.tracks.length === 0 ? (
          <p className="text-[13px] text-muted2">
            No ACRCloud-identified tracks yet. Enable{" "}
            <span className="mono">ACRCLOUD_*</span> secrets and run Catalog
            enrich.
          </p>
        ) : (
          <FingerprintTrackList tracks={s.fingerprint.tracks} />
        )}
      </section>

      <div className="mb-12 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="mb-1 text-lg font-bold tracking-tight">Play status</h2>
          <p className="mb-3 text-[13px] text-muted2">
            Identification health across all timeline rows.
          </p>
          <div>
            {s.plays.byStatus.map((row) => (
              <BarRow
                key={row.key}
                label={row.label}
                count={row.count}
                total={playTotal}
                color={STATUS_META[row.key as IdStatus]?.color}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-1 text-lg font-bold tracking-tight">Provenance</h2>
          <p className="mb-3 text-[13px] text-muted2">
            Where tracklist rows came from (ACRCloud = fingerprint).
          </p>
          <div>
            {s.plays.byProvenance.map((row) => (
              <BarRow
                key={row.key}
                label={row.label}
                count={row.count}
                total={playTotal}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-1 text-lg font-bold tracking-tight">Set sources</h2>
          <p className="mb-3 text-[13px] text-muted2">
            Host / discovery sourceName on Set rows.
          </p>
          <div>
            {s.sets.bySource.map((row) => (
              <BarRow
                key={row.key}
                label={row.label}
                count={row.count}
                total={s.totals.sets}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-1 text-lg font-bold tracking-tight">Set types</h2>
          <p className="mb-3 text-[13px] text-muted2">
            radio · festival · soundcloud · etc.
          </p>
          <div>
            {s.sets.byType.map((row) => (
              <BarRow
                key={row.key}
                label={row.label}
                count={row.count}
                total={s.totals.sets}
              />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-x-4">
            <Stat
              label="Set artwork"
              value={s.sets.withImage}
              hint={pct(s.sets.withImage, s.totals.sets)}
            />
            <Stat
              label="Playback URL"
              value={s.sets.withPlayback}
              hint={pct(s.sets.withPlayback, s.totals.sets)}
            />
            <Stat
              label="Track artwork"
              value={s.tracks.withImage}
              hint={pct(s.tracks.withImage, s.totals.tracks)}
            />
            <Stat
              label="Track BPM"
              value={s.tracks.withBpm}
              hint={pct(s.tracks.withBpm, s.totals.tracks)}
            />
          </div>
        </section>
      </div>

      <div className="space-y-12">
        <SparseSetList rows={s.sparseSets} />

        <UnresolvedIdList rows={s.topUnresolvedIds} />

        <DjGapList
          title="Missing handles · has sets"
          blurb="Priority pin work — profiles with catalog weight but no SC / IG / X / web."
          rows={s.djs.missingHandleWithSets}
          empty="Every DJ with sets already has a handle."
          meta={(d) =>
            `${d.setCount} ${d.setCount === 1 ? "set" : "sets"} · ${d.playCount} plays`
          }
        />

        <DjGapList
          title="Missing YouTube · has sets"
          blurb="SC bios often list YouTube as plain text — catalog-sc-socials / pins."
          rows={s.djs.missingYoutubeWithSets}
          empty="Every DJ with sets has a YouTube link."
          meta={(d) =>
            `${d.setCount} ${d.setCount === 1 ? "set" : "sets"} · ${d.playCount} plays`
          }
        />

        <DjGapList
          title="Missing SoundCloud · has sets"
          blurb="Crosslink from YT About, or pin the permalink."
          rows={s.djs.missingSoundcloudWithSets}
          empty="Every DJ with sets has a SoundCloud link."
          meta={(d) =>
            `${d.setCount} ${d.setCount === 1 ? "set" : "sets"} · ${d.playCount} plays`
          }
        />

        <DjGapList
          title="Empty tracklists"
          blurb="Linked sets exist, but nothing landed on the timeline yet."
          rows={s.djs.emptySetProfiles}
          empty="No empty-tracklist DJ profiles."
          meta={(d) =>
            `${d.setCount} ${d.setCount === 1 ? "set" : "sets"} · 0 plays`
          }
        />

        <DjGapList
          title="No thumbnail · has sets"
          blurb="Monogram fallbacks — thumbs job or curated art still needed."
          rows={s.djs.noThumbWithSets}
          empty="Every DJ with sets has artwork."
          meta={(d) =>
            `${d.setCount} ${d.setCount === 1 ? "set" : "sets"}${
              d.hasHandle ? "" : " · no handle"
            }`
          }
        />

        <DjGapList
          title="Handle · zero sets"
          blurb="Pinned socials waiting for ingest to attach sets."
          rows={s.djs.handleNoSets}
          empty="No handle-only shells."
          meta={() => "0 sets"}
        />

        <DjGapList
          title="Junk names"
          blurb="Title-parse crumbs and UI chrome still stored for cleanup."
          rows={s.djs.junkNames}
          empty="No junk DJ names in the catalog."
          meta={(d) =>
            `${d.setCount} ${d.setCount === 1 ? "set" : "sets"}`
          }
        />

        <section>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Thin tracklists
              </h2>
              <p className="mt-0.5 text-[13px] text-muted2">
                Duration vs logged plays — house/tech-house sets usually land
                ~8–15 tracks/hour. Avg ≥8m/play or &lt;7/h is thin; ≥10m or
                &lt;5/h is severe (incomplete parse, not a real 6-song hour).
              </p>
            </div>
            <span className="mono text-[12px] text-muted2">
              {s.density.thin + s.density.severe}
            </span>
          </div>
          {s.density.worst.length === 0 ? (
            <p className="text-[13px] text-muted2">
              No thin ≥30m sets in the catalog.
            </p>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {s.density.worst.slice(0, 40).map((row) => (
                <li key={row.id} className="py-2.5">
                  <Link
                    href={`/sets/${row.slug}`}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 hover:text-[color:var(--brand)]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-medium text-ink">
                        {row.title}
                      </span>
                      <span className="mono text-[11px] text-muted2">
                        {row.primaryDj ?? "—"}
                        {row.sourceName ? ` · ${row.sourceName}` : ""}
                        {" · "}
                        <span
                          style={{
                            color:
                              row.severity === "severe"
                                ? "var(--magenta)"
                                : "var(--amber)",
                          }}
                        >
                          {row.severity}
                        </span>
                      </span>
                    </span>
                    <span className="mono shrink-0 text-[12px] text-muted2">
                      {row.playCount}/{row.expectedPlays} ·{" "}
                      {fmtDuration(row.durationSec)} · {row.tracksPerHour}/h
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Empty sets</h2>
              <p className="mt-0.5 text-[13px] text-muted2">
                Set rows with zero plays — newest first.
              </p>
            </div>
            <span className="mono text-[12px] text-muted2">
              {s.sets.empty}
            </span>
          </div>
          {s.emptySets.length === 0 ? (
            <p className="text-[13px] text-muted2">No empty sets.</p>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {s.emptySets.map((set) => (
                <li key={set.id}>
                  <Link
                    href={`/sets/${set.slug}`}
                    className="flex items-baseline justify-between gap-3 py-2.5 text-[14px] transition-colors hover:text-brand"
                  >
                    <span className="min-w-0 truncate font-medium">
                      {set.title}
                    </span>
                    <span className="mono shrink-0 text-[12px] text-muted2">
                      {[set.sourceName, set.type].filter(Boolean).join(" · ")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
