"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  planBeatportLaunch,
  planRekordboxLaunch,
  planSpotifyLaunch,
  type ExportLaunchPlan,
} from "@/lib/exportLaunch";
import {
  buildTracklistCsv,
  buildTracklistPlain,
  exportablePlays,
  slugifyFilename,
  type ExportPlay,
  type ExportSetMeta,
} from "@/lib/playlistExport";
import { placeRightAlignedPopover } from "@/lib/popoverPlace";

function downloadText(filename: string, body: string, mime: string) {
  const blob = new Blob([body], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function copyText(text: string): Promise<boolean> {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Open the desktop URI (if any) and the https destination in a new tab. */
function openExportDestination(plan: ExportLaunchPlan) {
  if (plan.protocolHref && typeof document !== "undefined") {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("hidden", "");
    iframe.setAttribute("aria-hidden", "true");
    iframe.src = plan.protocolHref;
    document.body.appendChild(iframe);
    window.setTimeout(() => iframe.remove(), 2000);
  }
  if (plan.openHref) {
    window.open(plan.openHref, "_blank", "noopener,noreferrer");
  }
}

const MENU_WIDTH = 300;

const itemClass =
  "flex w-full flex-col items-stretch rounded-md px-2.5 py-1.5 text-left transition-colors hover:bg-panel2 disabled:cursor-not-allowed disabled:opacity-40";

type ExportStatus = "idle" | "copied" | "saved" | "opened";

/**
 * Destination-named set exports. Web hosts open immediately; DJ apps
 * download an M3U8 (browsers cannot write Rekordbox / Serato).
 */
export function SetExport({
  plays,
  meta,
}: {
  plays: ExportPlay[];
  meta: ExportSetMeta;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [statusLabel, setStatusLabel] = useState("Export");
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const rows = useMemo(() => exportablePlays(plays), [plays]);
  const rekordbox = useMemo(
    () => planRekordboxLaunch(plays, meta),
    [plays, meta],
  );
  const spotify = useMemo(() => planSpotifyLaunch(plays, meta), [plays, meta]);
  const beatport = useMemo(() => planBeatportLaunch(plays), [plays]);
  const base = slugifyFilename(meta.title || meta.slug);
  const disabled = rows.length === 0;

  function flash(next: ExportStatus, label: string) {
    setStatus(next);
    setStatusLabel(label);
    window.setTimeout(() => {
      setStatus("idle");
      setStatusLabel("Export");
    }, 1800);
  }

  function placeMenu() {
    const el = root.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos(
      placeRightAlignedPopover({
        trigger: { bottom: rect.bottom, right: rect.right },
        menuWidth: MENU_WIDTH,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      }),
    );
  }

  function toggle() {
    if (disabled) return;
    if (open) {
      setOpen(false);
      return;
    }
    placeMenu();
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function onMove() {
      placeMenu();
    }
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  async function runLaunch(plan: ExportLaunchPlan, openedLabel: string) {
    if (plan.disabled) return;
    const copied = await copyText(plan.clipboard);
    if (!copied && plan.clipboard && !plan.download) {
      downloadText(
        `${base}-${plan.id}.txt`,
        plan.clipboard,
        "text/plain;charset=utf-8",
      );
    }
    if (plan.download) {
      downloadText(
        plan.download.filename,
        plan.download.body,
        plan.download.mime,
      );
      flash("saved", "Saved");
    } else {
      openExportDestination(plan);
      flash("opened", openedLabel);
    }
    setOpen(false);
  }

  async function copyPlain() {
    const text = buildTracklistPlain(plays);
    const ok = await copyText(text);
    if (!ok) downloadText(`${base}.txt`, text, "text/plain;charset=utf-8");
    flash("copied", "Copied");
    setOpen(false);
  }

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Export tracklist"
        disabled={disabled}
        onClick={toggle}
        className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-[12px] text-muted transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span>
          {status === "idle" ? "Export" : statusLabel}
        </span>
        <span aria-hidden className="text-[10px] text-muted2">
          {open ? "▴" : "▾"}
        </span>
      </button>

      {open && pos ? (
        <div
          role="menu"
          style={{
            top: pos.top,
            left: pos.left,
            width: pos.width,
            maxHeight: pos.maxHeight,
          }}
          className="fixed z-30 overflow-y-auto rounded-xl border border-line bg-panel p-1.5 shadow-lg shadow-black/40 scroll-thin"
        >
          <p className="px-2.5 py-1.5 text-[11px] text-muted2">
            Identified rows
            {rows.length > 0 ? ` · ${rows.length} tracks` : ""}
          </p>
          <LaunchItem
            plan={rekordbox}
            onClick={() => void runLaunch(rekordbox, "Saved")}
          />
          <LaunchItem
            plan={spotify}
            onClick={() => void runLaunch(spotify, "Opened Spotify")}
          />
          <LaunchItem
            plan={beatport}
            onClick={() => void runLaunch(beatport, "Opened Beatport")}
          />
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            title="Cue, mix, ISRC, and canonical store URLs"
            onClick={() => {
              downloadText(
                `${base}.csv`,
                buildTracklistCsv(plays, meta),
                "text/csv;charset=utf-8",
              );
              flash("saved", "Saved");
              setOpen(false);
            }}
          >
            <span className="text-[13px] text-ink">CSV</span>
            <span className="text-[11px] text-muted2">
              Spreadsheet · cues and store URLs
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            className={itemClass}
            onClick={() => void copyPlain()}
          >
            <span className="text-[13px] text-ink">Copy tracklist</span>
            <span className="text-[11px] text-muted2">
              Artist – Title text
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

function LaunchItem({
  plan,
  onClick,
}: {
  plan: ExportLaunchPlan;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className={itemClass}
      disabled={plan.disabled}
      title={plan.disabledReason ?? plan.hint}
      onClick={onClick}
    >
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-[13px] text-ink">{plan.label}</span>
        <span className="shrink-0 text-[11px] text-brand">
          {plan.actionLabel}
        </span>
      </span>
      <span className="text-[11px] text-muted2">{plan.hint}</span>
    </button>
  );
}
