"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { EntityThumb } from "@/components/EntityThumb";
import { SuggestIdButton } from "@/components/SuggestId";
import {
  STATUS_META,
  fmtTimestamp,
  listenLinks,
  statusColor,
  type IdStatus,
} from "@/lib/status";
import {
  COMMENT_LOW_CONFIDENCE,
  hasVendorDetectionCopy,
  publicStatusLabel,
} from "@/lib/publishPlays";
import type { PlayRow } from "@/lib/queries";
import { playablePlaybackUrl } from "@/lib/playback";
import { EDIT_KIND_LABEL, editKind } from "@/lib/trackMeta";
import { useSetListen, useSetSeek } from "@/components/SetListen";
import { nearestPlayByCue } from "@/lib/setCue";
import { cueIndexAtRatio, playSpans, stripIsDense } from "@/lib/setStrip";

const DENSITY_KEY = "setradar.tracklistDensity";
const densityListeners = new Set<() => void>();

function subscribeDensity(onChange: () => void) {
  densityListeners.add(onChange);
  return () => densityListeners.delete(onChange);
}

function getDensityCompact() {
  try {
    const stored = localStorage.getItem(DENSITY_KEY);
    if (stored === "compact") return true;
    if (stored === "comfortable") return false;
    return window.matchMedia("(max-width: 639px)").matches;
  } catch {
    return false;
  }
}

function setDensityCompact(compact: boolean) {
  try {
    localStorage.setItem(DENSITY_KEY, compact ? "compact" : "comfortable");
  } catch {
    /* ignore */
  }
  densityListeners.forEach((l) => l());
}

export function SetTimeline({
  plays,
  durationSec,
  accent,
  setSlug,
  setGenre,
  setSourceUrl,
  setPlaybackUrl,
  children,
}: {
  plays: PlayRow[];
  durationSec: number;
  accent: string;
  setSlug: string;
  /** When set, per-track genre is only shown if it differs (avoids clutter). */
  setGenre?: string | null;
  /** Provenance / upload URL — used with playback to decide on-site Play. */
  setSourceUrl?: string | null;
  /** Playable host URL when it differs from source (official YT vs SC upload). */
  setPlaybackUrl?: string | null;
  /** Rendered between the set strip and the tracklist (legend, export). */
  children?: ReactNode;
}) {
  const seek = useSetSeek();
  const listen = useSetListen();
  const canSeek = !!seek && !!playablePlaybackUrl(setPlaybackUrl, setSourceUrl);
  const [pickedId, setPickedId] = useState<string | null>(plays[0]?.id ?? null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const compact = useSyncExternalStore(
    subscribeDensity,
    getDensityCompact,
    () => false,
  );
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const stripRef = useRef<HTMLDivElement | null>(null);

  function toggleDensity() {
    setDensityCompact(!getDensityCompact());
  }

  const spans = useMemo(
    () => playSpans(
      plays.map((p) => p.timestamp),
      durationSec,
    ),
    [plays, durationSec],
  );
  const dense = stripIsDense(plays.length);

  useEffect(() => {
    if (!flashId) return;
    const t = setTimeout(() => setFlashId(null), 1400);
    return () => clearTimeout(t);
  }, [flashId]);

  const cueSec = listen?.startSec ?? null;
  const cueNonce = listen?.seekNonce ?? 0;
  const cuedPlayId =
    cueNonce > 0 && cueSec != null
      ? (nearestPlayByCue(plays, cueSec)?.id ?? null)
      : null;
  const activeId = cuedPlayId ?? pickedId;

  useEffect(() => {
    if (!cuedPlayId) return;
    const el = rowRefs.current[cuedPlayId];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [cuedPlayId, cueNonce]);

  function cueIdAtClientX(clientX: number): string | null {
    const el = stripRef.current;
    if (!el || plays.length === 0) return null;
    const { left, width } = el.getBoundingClientRect();
    if (width <= 0) return null;
    const i = cueIndexAtRatio((clientX - left) / width, spans);
    return plays[i]?.id ?? null;
  }

  function onStripClick(e: MouseEvent<HTMLDivElement>) {
    const id = cueIdAtClientX(e.clientX);
    if (id) focusRow(id);
  }

  function onStripMove(e: PointerEvent<HTMLDivElement>) {
    const id = cueIdAtClientX(e.clientX);
    if (id) setHoverId(id);
  }

  function focusRow(id: string) {
    setPickedId(id);
    const el = rowRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    setFlashId(null);
    requestAnimationFrame(() => setFlashId(id));
    const play = plays.find((p) => p.id === id);
    if (play && seek) seek(play.timestamp);
  }

  const caption = plays.find((p) => p.id === (hoverId ?? activeId));

  return (
    <div className="mt-4 space-y-4 sm:mt-6 sm:space-y-6">
      {/* ------------------------------- SET STRIP ------------------------------- */}
      <div className="card min-w-0 overflow-x-clip p-3 sm:p-4">
        <div className="mb-2 flex items-center justify-between gap-3 sm:mb-3">
          <div className="min-w-0">
            <span className="eyebrow">Set strip</span>
            <p className="mt-1 text-[11px] text-muted2">
              Tap a segment or row to play from that cue
            </p>
          </div>
          <div className="flex items-center gap-3 text-[12px] text-muted2 sm:ml-auto">
            <span className="mono">00:00</span>
            <span className="text-muted2">→</span>
            <span className="mono">{fmtTimestamp(durationSec)}</span>
          </div>
        </div>

        <div
          ref={stripRef}
          role="img"
          aria-label={`Set timeline, ${plays.length} cues. Click to play from a cue.`}
          className={`flex h-8 w-full min-w-0 cursor-pointer sm:h-14 ${
            dense ? "gap-px" : "gap-[2px]"
          }`}
          onClick={onStripClick}
          onPointerMove={onStripMove}
          onPointerLeave={() => setHoverId(null)}
        >
          {plays.map((p, i) => {
            const isActive = p.id === activeId;
            const isHover = p.id === hoverId;
            return (
              <div
                key={p.id}
                className="relative h-full min-w-0 rounded-[3px] transition-all duration-150"
                style={{
                  flex: `${spans[i]} 1 0%`,
                  background: statusColor(p.idStatus),
                  opacity: isActive ? 1 : isHover ? 0.92 : 0.72,
                  transform: isActive ? "scaleY(1.06)" : "scaleY(1)",
                  boxShadow: isActive
                    ? `0 0 0 1.5px var(--bg), 0 0 14px ${statusColor(p.idStatus)}`
                    : "none",
                }}
              >
                {isActive && (
                  <span
                    className="absolute -bottom-[7px] left-1/2 h-[6px] w-[6px] -translate-x-1/2 rotate-45"
                    style={{ background: statusColor(p.idStatus) }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* playhead caption */}
        <div className="mt-4 flex items-center gap-3">
          {caption && (
            <>
              <span
                className="dot"
                style={{ background: statusColor(caption.idStatus), width: 10, height: 10 }}
              />
              <span className="mono text-[12px] text-muted2">
                {fmtTimestamp(caption.timestamp)}
              </span>
              <span className="truncate text-[13px] text-ink">
                {caption.artistName ? `${caption.artistName} – ` : ""}
                {caption.title}
              </span>
              <span
                className="ml-auto rounded-full px-2 py-0.5 text-[11px]"
                style={{
                  color: statusColor(caption.idStatus),
                  background: `${statusColor(caption.idStatus)}1f`,
                }}
              >
                {publicStatusLabel(caption)}
              </span>
            </>
          )}
        </div>
      </div>

      {children}

      {/* ------------------------------- TRACKLIST ------------------------------- */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="eyebrow">Tracklist</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleDensity}
              className="mono text-[11px] text-muted2 transition-colors hover:text-ink"
              title="Toggle tracklist density"
            >
              {compact ? "Comfortable" : "Compact"}
            </button>
            <span className="mono text-[12px] text-muted2">{plays.length} rows</span>
          </div>
        </div>
        {plays.length === 0 ? (
          <p className="px-4 py-10 text-center text-[13px] text-muted2">
            <span className="mb-1 block text-[14px] font-medium text-ink">
              List pending
            </span>
            Official playback is up. The tracklist has not been parsed yet —
            we only show clocks from the upload or a timed overlay, never
            invented cues.
          </p>
        ) : null}
        <ol>
          {plays.map((p) => {
            const isActive = p.id === activeId;
            const meta = STATUS_META[p.idStatus as IdStatus];
            const kind = editKind(p.title, p.artistName);
            return (
              <li key={p.id}>
                <div
                  ref={(el) => {
                    rowRefs.current[p.id] = el;
                  }}
                  onClick={() => focusRow(p.id)}
                  title={`Play from ${fmtTimestamp(p.timestamp)}`}
                  className={`flex cursor-pointer items-center gap-3 border-b border-linesoft px-4 transition-colors last:border-b-0 ${
                    compact ? "py-1.5" : "py-3"
                  } ${flashId === p.id ? "row-flash" : ""}`}
                  style={{
                    background: isActive ? `${accent}12` : undefined,
                    boxShadow: isActive ? `inset 3px 0 0 ${accent}` : "inset 3px 0 0 transparent",
                  }}
                >
                  <span className="mono w-6 flex-none text-right text-[12px] text-muted2">
                    {p.position}
                  </span>
                  <span className="mono w-16 flex-none text-[12px] text-muted">
                    {fmtTimestamp(p.timestamp)}
                  </span>
                  <EntityThumb
                    src={p.imageUrl}
                    label={p.title}
                    accent={statusColor(p.idStatus)}
                    size={compact ? 24 : 32}
                    radius={6}
                  />
                  {!compact && (
                    <span
                      className="dot"
                      title={meta?.label}
                      style={{ background: statusColor(p.idStatus) }}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="truncate text-[14px] text-ink"
                        style={
                          p.idStatus === "unresolved_id"
                            ? { color: "var(--magenta)" }
                            : undefined
                        }
                      >
                        {p.title}
                      </span>
                      {kind ? (
                          <span
                            className="flex-none rounded-full border border-line px-1.5 py-0.5 text-[10px] text-muted2"
                            title="May not have a store page yet"
                          >
                            {EDIT_KIND_LABEL[kind]}
                          </span>
                      ) : null}
                      {p.hasTrackPage && p.trackSlug ? (
                        <Link
                          href={`/tracks/${p.trackSlug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="mono flex-none text-[10px] text-muted2 transition-colors hover:text-brand"
                          title="Open track page"
                        >
                          track
                        </Link>
                      ) : null}
                      {p.mixName && !compact && !kind && (
                        <span
                          className="hidden truncate text-[11px] text-muted2 sm:inline"
                          title={p.remixerName ? `Remixer: ${p.remixerName}` : p.mixName}
                        >
                          {p.mixName}
                        </span>
                      )}
                      {p.bpm != null && !compact && (
                        <span className="mono flex-none text-[11px] text-muted2">
                          {p.bpm} BPM
                        </span>
                      )}
                      {p.musicalKey && !compact && (
                        <span className="mono flex-none text-[11px] text-muted2">
                          {p.musicalKey}
                        </span>
                      )}
                      {p.trackDurationSec != null &&
                        p.trackDurationSec > 0 &&
                        !compact && (
                        <span className="mono flex-none text-[11px] text-muted2">
                          {fmtTimestamp(p.trackDurationSec)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 truncate text-[12px] text-muted">
                      {p.artistName && <span className="truncate">{p.artistName}</span>}
                      {p.genre &&
                        (!setGenre ||
                          p.genre.toLowerCase() !== setGenre.toLowerCase()) && (
                          <span className="flex-none text-[11px] text-muted2">
                            · {p.genre}
                          </span>
                        )}
                      {p.resolvedTitle && (
                        <span className="truncate text-teal">→ {p.resolvedTitle}</span>
                      )}
                      {p.detectionComment ? (
                        <span className="truncate text-muted2 italic">
                          {p.detectionComment}
                        </span>
                      ) : p.idNote &&
                        !p.artistName &&
                        !hasVendorDetectionCopy(p.idNote) ? (
                        <span className="truncate text-muted2 italic">{p.idNote}</span>
                      ) : null}
                    </div>
                  </div>

                  {(p.idStatus === "unresolved_id" ||
                    p.idStatus === "unparsed") && (
                    <SuggestIdButton
                      setSlug={setSlug}
                      position={p.position}
                      timestamp={p.timestamp}
                      currentLabel={
                        p.artistName ? `${p.artistName} – ${p.title}` : p.title
                      }
                      suggestedArtist={p.suggestedArtist ?? p.artistName}
                      suggestedTitle={p.suggestedTitle ?? (p.artistName ? p.title : null)}
                      confirmHint={Boolean(
                        p.suggestedTitle ||
                          p.detectionComment === COMMENT_LOW_CONFIDENCE,
                      )}
                    />
                  )}

                  {(() => {
                    const identified =
                      p.idStatus === "identified" ||
                      p.idStatus === "community_resolved";
                    const links = identified
                      ? listenLinks(p.title, p.artistName, {
                          beatportUrl: p.beatportUrl,
                          spotifyUrl: p.spotifyUrl,
                        })
                      : null;
                    if (!canSeek && !links) return null;
                    const pill =
                      "grid h-6 w-6 place-items-center rounded-md border border-line text-[10px] text-muted2 transition-colors hover:border-brand hover:text-brand";
                    return (
                      <div
                        className="flex flex-none items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {canSeek && (
                          <button
                            type="button"
                            onClick={() => focusRow(p.id)}
                            title={`Play from ${fmtTimestamp(p.timestamp)}`}
                            aria-label={`Play from ${fmtTimestamp(p.timestamp)}`}
                            className={pill}
                          >
                            ▶
                          </button>
                        )}
                        {links?.spotify && (
                          <a
                            href={links.spotify}
                            target="_blank"
                            rel="noreferrer"
                            title={
                              links.spotifyIsCanonical
                                ? "Play on Spotify"
                                : "Search on Spotify"
                            }
                            className={pill}
                          >
                            SP
                          </a>
                        )}
                        {links?.beatport && (
                          <a
                            href={links.beatport}
                            target="_blank"
                            rel="noreferrer"
                            title={
                              links.beatportIsCanonical
                                ? "Buy on Beatport"
                                : "Search on Beatport"
                            }
                            className={pill}
                          >
                            BP
                          </a>
                        )}
                      </div>
                    );
                  })()}

                  {p.labelName &&
                    (p.labelSlug ? (
                      <Link
                        href={`/labels/${p.labelSlug}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hidden flex-none items-center gap-1.5 rounded-full border border-line bg-bg2 py-0.5 pl-0.5 pr-2 text-[11px] text-muted transition-colors hover:border-brand hover:text-brand md:inline-flex"
                      >
                        <EntityThumb
                          src={p.labelImageUrl}
                          label={p.labelName}
                          accent={p.labelColor ?? "var(--brand)"}
                          size={16}
                          radius={999}
                          monogram={p.labelName.slice(0, 1)}
                        />
                        {p.labelName}
                      </Link>
                    ) : (
                      <span className="hidden flex-none items-center gap-1.5 rounded-full border border-line bg-bg2 py-0.5 pl-0.5 pr-2 text-[11px] text-muted md:inline-flex">
                        <EntityThumb
                          src={p.labelImageUrl}
                          label={p.labelName}
                          accent={p.labelColor ?? "var(--brand)"}
                          size={16}
                          radius={999}
                          monogram={p.labelName.slice(0, 1)}
                        />
                        {p.labelName}
                      </span>
                    ))}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
