"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { EntityThumb } from "@/components/EntityThumb";
import { SuggestIdButton } from "@/components/SuggestId";
import {
  PROVENANCE_META,
  STATUS_META,
  fmtTimestamp,
  listenLinks,
  statusColor,
  statusLabel,
  type IdStatus,
  type Provenance,
} from "@/lib/status";
import type { PlayRow } from "@/lib/queries";

export function SetTimeline({
  plays,
  durationSec,
  accent,
  setSlug,
}: {
  plays: PlayRow[];
  durationSec: number;
  accent: string;
  setSlug: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(plays[0]?.id ?? null);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const spans = useMemo(() => {
    return plays.map((p, i) => {
      const end = i < plays.length - 1 ? plays[i + 1].timestamp : durationSec;
      return Math.max(end - p.timestamp, 1);
    });
  }, [plays, durationSec]);

  useEffect(() => {
    if (!flashId) return;
    const t = setTimeout(() => setFlashId(null), 1400);
    return () => clearTimeout(t);
  }, [flashId]);

  function focusRow(id: string) {
    setActiveId(id);
    const el = rowRefs.current[id];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    setFlashId(null);
    requestAnimationFrame(() => setFlashId(id));
  }

  const caption = plays.find((p) => p.id === (hoverId ?? activeId));

  return (
    <div className="space-y-6">
      {/* ------------------------------- SET STRIP ------------------------------- */}
      <div className="card p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="eyebrow">Set strip</span>
          <div className="flex items-center gap-3 text-[12px] text-muted2">
            <span className="mono">00:00</span>
            <span className="text-muted2/60">→</span>
            <span className="mono">{fmtTimestamp(durationSec)}</span>
          </div>
        </div>

        <div className="flex h-14 w-full gap-[2px]">
          {plays.map((p, i) => {
            const isActive = p.id === activeId;
            const isHover = p.id === hoverId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => focusRow(p.id)}
                onMouseEnter={() => setHoverId(p.id)}
                onMouseLeave={() => setHoverId(null)}
                aria-label={`${p.title} at ${fmtTimestamp(p.timestamp)}`}
                className="group relative h-full cursor-pointer rounded-[3px] transition-all duration-150"
                style={{
                  flexGrow: spans[i],
                  flexBasis: 0,
                  minWidth: 5,
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
              </button>
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

      {/* ------------------------------- TRACKLIST ------------------------------- */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="eyebrow">Tracklist</span>
          <span className="mono text-[12px] text-muted2">{plays.length} rows</span>
        </div>
        <ol>
          {plays.map((p) => {
            const isActive = p.id === activeId;
            const meta = STATUS_META[p.idStatus as IdStatus];
            const prov = PROVENANCE_META[p.provenance as Provenance];
            return (
              <li key={p.id}>
                <div
                  ref={(el) => {
                    rowRefs.current[p.id] = el;
                  }}
                  onClick={() => focusRow(p.id)}
                  className={`flex cursor-pointer items-center gap-3 border-b border-linesoft px-4 py-3 transition-colors last:border-b-0 ${
                    flashId === p.id ? "row-flash" : ""
                  }`}
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
                    size={32}
                    radius={6}
                  />
                  <span
                    className="dot"
                    title={meta?.label}
                    style={{ background: statusColor(p.idStatus) }}
                  />
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
                      {p.bpm && (
                        <span className="mono flex-none text-[11px] text-muted2">
                          {p.bpm} BPM
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 truncate text-[12px] text-muted">
                      {p.artistName && <span className="truncate">{p.artistName}</span>}
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
                      const links = listenLinks(p.title, p.artistName);
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
                            href={links.beatport}
                            target="_blank"
                            rel="noreferrer"
                            title="Find on Beatport"
                            className={`${pill} hidden sm:grid`}
                          >
                            BP
                          </a>
                          <a
                            href={links.soundcloud}
                            target="_blank"
                            rel="noreferrer"
                            title="Search on SoundCloud"
                            className={`${pill} hidden sm:grid`}
                          >
                            SC
                          </a>
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

                  <span
                    className="hidden flex-none rounded-md border border-line px-2 py-0.5 text-[11px] text-muted2 sm:inline"
                    title={`Provenance: ${prov?.label ?? p.provenance}`}
                  >
                    {prov?.short ?? p.provenance}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
