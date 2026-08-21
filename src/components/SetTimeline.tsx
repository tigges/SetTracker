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
  statusLabel,
  type IdStatus,
} from "@/lib/status";
import type { PlayRow } from "@/lib/queries";
import { beatportBuyability } from "@/lib/trackMeta";
import { useSetSeek } from "@/components/SetListen";
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
  children,
}: {
  plays: PlayRow[];
  durationSec: number;
  accent: string;
  setSlug: string;
  /** When set, per-track genre is only shown if it differs (avoids clutter). */
  setGenre?: string | null;
  /** Real upload URL — used for SC listen pill instead of search guesses. */
  setSourceUrl?: string | null;
  /** Rendered between the set strip and the tracklist (legend, export). */
  children?: ReactNode;
}) {
  const seek = useSetSeek();
  const [activeId, setActiveId] = useState<string | null>(plays[0]?.id ?? null);
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
    setActiveId(id);
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
                {statusLabel(caption.idStatus)}
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
            No tracklist parsed from the source yet. We only show tracks found in
            the upload description or timed comments — nothing invented.
          </p>
        ) : null}
        <ol>
          {plays.map((p) => {
            const isActive = p.id === activeId;
            const meta = STATUS_META[p.idStatus as IdStatus];
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
                      {p.mixName && !compact && (
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
                      {p.idNote && !p.artistName && (
                        <span className="truncate text-muted2 italic">{p.idNote}</span>
                      )}
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
                    />
                  )}

                  {(p.idStatus === "identified" ||
                    p.idStatus === "community_resolved") &&
                    (() => {
                      const links = listenLinks(p.title, p.artistName, {
                        beatportUrl: p.beatportUrl,
                        setSourceUrl,
                      });
                      const buyability = beatportBuyability({
                        idStatus: p.idStatus,
                        title: p.title,
                        artistName: p.artistName,
                        beatportUrl: p.beatportUrl,
                      });
                      const pill =
                        "grid h-6 place-items-center rounded-md border border-line px-1.5 text-[10px] text-muted2 transition-colors hover:border-brand hover:text-brand";
                      return (
                        <div
                          className="flex flex-none items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a
                            href={links.youtube}
                            target="_blank"
                            rel="noreferrer"
                            title="Play / search on YouTube"
                            className={`${pill} w-6`}
                            aria-label="Play on YouTube"
                          >
                            ▶
                          </a>
                          <a
                            href={links.spotify}
                            target="_blank"
                            rel="noreferrer"
                            title="Search on Spotify"
                            className={`${pill} hidden sm:grid`}
                          >
                            SP
                          </a>
                          {buyability !== "unavailable" && (
                            <a
                              href={links.beatport}
                              target="_blank"
                              rel="noreferrer"
                              title={
                                buyability === "buy"
                                  ? "Buy on Beatport"
                                  : "Search on Beatport"
                              }
                              className={`${pill} ${buyability === "buy" ? "" : "hidden sm:grid"}`}
                            >
                              BP
                            </a>
                          )}
                          {links.soundcloud && (
                            <a
                              href={links.soundcloud}
                              target="_blank"
                              rel="noreferrer"
                              title="Open set on SoundCloud"
                              className={pill}
                            >
                              SC
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
                        className="hidden flex-none items-center gap-1.5 rounded-full border border-line bg-bg2 py-0.5 pl-0.5 pr-2 text-[11px] text-muted transition-colors hover:border-brand hover:text-brand lg:inline-flex"
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
                      <span className="hidden flex-none items-center gap-1.5 rounded-full border border-line bg-bg2 py-0.5 pl-0.5 pr-2 text-[11px] text-muted lg:inline-flex">
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
