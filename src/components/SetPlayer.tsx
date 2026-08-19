"use client";

import { useEffect, useRef, useState } from "react";
import { useSetListen } from "@/components/SetListen";
import {
  hearthisPublicUrl,
  hearthisSeekUrl,
  resolvePlaybackTarget,
} from "@/lib/playback";
import {
  cueSoundCloudWidget,
  loadSoundCloudWidgetApi,
  type SoundCloudWidget,
} from "@/lib/soundcloudWidget";
import { fmtTimestamp } from "@/lib/status";

/**
 * Collapsed-by-default on-site player (SoundCloud / YouTube / Mixcloud).
 * hearthis.at is never embedded. No autoplay unless a timeline cue seeks.
 *
 * SoundCloud: keep one iframe and seek via the Widget API. Putting `#t=`
 * on the widget `url=` param does not move the playhead.
 * YouTube: remount the embed with `start=` + `autoplay`.
 */
export function SetPlayer({
  playbackUrl,
  sourceUrl,
}: {
  playbackUrl?: string | null;
  sourceUrl?: string | null;
}) {
  const listen = useSetListen();
  const startSec = listen?.startSec ?? null;
  const seekNonce = listen?.seekNonce ?? 0;
  const seeking = seekNonce > 0;
  const preview = resolvePlaybackTarget(playbackUrl, { sourceUrl });
  const isSoundCloud = preview?.host === "soundcloud";
  const target = resolvePlaybackTarget(playbackUrl, {
    sourceUrl,
    startSec: isSoundCloud ? null : startSec,
    autoplay: isSoundCloud ? false : seeking,
  });
  const openTarget = resolvePlaybackTarget(playbackUrl, {
    sourceUrl,
    startSec,
  });
  const [userOpen, setUserOpen] = useState(false);
  const [dismissedNonce, setDismissedNonce] = useState(0);
  const open = userOpen || (seeking && seekNonce !== dismissedNonce);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const widgetRef = useRef<SoundCloudWidget | null>(null);
  const cueRef = useRef({ startSec, seeking });
  cueRef.current = { startSec, seeking };

  useEffect(() => {
    if (!open || !isSoundCloud) {
      widgetRef.current = null;
      return;
    }
    if (!iframeRef.current) return;
    let cancelled = false;

    loadSoundCloudWidgetApi()
      .then((api) => {
        if (cancelled || !iframeRef.current) return;
        const widget = api.Widget(iframeRef.current);
        widgetRef.current = widget;
        const apply = () => {
          const cue = cueRef.current;
          if (cue.seeking) cueSoundCloudWidget(widget, cue.startSec, true);
        };
        widget.bind(api.Widget.Events.READY, apply);
        // seekTo before PLAY is often ignored; seek again once audio starts.
        widget.bind(api.Widget.Events.PLAY, () => {
          const cue = cueRef.current;
          if (!cue.seeking) return;
          widget.seekTo(Math.max(0, Math.floor(cue.startSec ?? 0) * 1000));
        });
        apply();
      })
      .catch(() => {
        /* widget API blocked — iframe still plays from 0 */
      });

    return () => {
      cancelled = true;
    };
  }, [open, isSoundCloud, target?.embedSrc]);

  useEffect(() => {
    if (!seeking || !widgetRef.current) return;
    cueSoundCloudWidget(widgetRef.current, startSec, true);
  }, [seekNonce, startSec, seeking]);

  if (!target) {
    const publicUrl = hearthisPublicUrl(playbackUrl, sourceUrl);
    if (!publicUrl) return null;
    const openUrl = hearthisSeekUrl(publicUrl, startSec);
    const cued = startSec != null && startSec > 0;
    return (
      <div className="mt-3 overflow-hidden rounded-xl border border-line bg-panel sm:mt-5">
        <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
          <a
            href={openUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-[12px] font-medium text-ink transition-colors hover:border-[color:var(--muted2)]"
          >
            <span aria-hidden>↗</span>
            {cued
              ? `Open hearthis.at at ${fmtTimestamp(startSec ?? 0)}`
              : "Open on hearthis.at"}
          </a>
          <span className="text-[12px] text-muted2">
            Cue clicks set a timestamp — hearthis is not embedded.
          </span>
        </div>
      </div>
    );
  }

  const iframeKey = isSoundCloud
    ? target.embedSrc
    : `${target.embedSrc}-${seekNonce}`;

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-line bg-panel sm:mt-5">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          onClick={() => {
            if (open) {
              setUserOpen(false);
              setDismissedNonce(seekNonce);
            } else {
              setUserOpen(true);
            }
          }}
          className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1 text-[12px] font-medium text-ink transition-colors hover:border-[color:var(--muted2)]"
        >
          <span aria-hidden>{open ? "▾" : "▶"}</span>
          {open ? "Hide player" : "Play on site"}
          <span className="text-muted2">· {target.label}</span>
        </button>
        {seeking && startSec != null ? (
          <span className="mono text-[12px] text-muted2">
            cue {fmtTimestamp(startSec)}
          </span>
        ) : null}
        <a
          href={openTarget?.openUrl ?? target.openUrl}
          target="_blank"
          rel="noreferrer"
          className="ml-auto text-[12px] text-muted underline decoration-dotted underline-offset-2 hover:text-ink"
        >
          Open on {target.label} ↗
        </a>
      </div>

      {open && (
        <div className="border-t border-line bg-bg/40 px-2 pb-2 pt-2 sm:px-3">
          <iframe
            key={iframeKey}
            ref={iframeRef}
            title={`${target.label} player`}
            src={target.embedSrc}
            width="100%"
            height={target.embedHeight}
            loading="eager"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full rounded-lg border-0"
          />
        </div>
      )}
    </div>
  );
}
