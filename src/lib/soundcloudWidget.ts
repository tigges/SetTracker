/**
 * SoundCloud HTML5 Widget API loader.
 * Cue jumps use `seekTo` — the widget ignores `#t=` on the embed `url=` param.
 */

export type SoundCloudWidget = {
  bind: (event: string, listener: () => void) => void;
  seekTo: (ms: number) => void;
  play: () => void;
};

export type SoundCloudWidgetApi = {
  Widget: {
    (el: HTMLIFrameElement): SoundCloudWidget;
    Events: { READY: string; PLAY: string };
  };
};

declare global {
  interface Window {
    SC?: SoundCloudWidgetApi;
  }
}

const API_SRC = "https://w.soundcloud.com/player/api.js";

let loadPromise: Promise<SoundCloudWidgetApi> | null = null;

export function loadSoundCloudWidgetApi(): Promise<SoundCloudWidgetApi> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("SoundCloud widget API is browser-only"));
  }
  if (window.SC?.Widget) return Promise.resolve(window.SC);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const finish = () => {
      if (window.SC?.Widget) resolve(window.SC);
      else reject(new Error("SoundCloud widget API did not initialize"));
    };

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${API_SRC}"]`,
    );
    if (existing) {
      if (window.SC?.Widget) {
        finish();
        return;
      }
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("SoundCloud widget API failed to load")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = API_SRC;
    script.async = true;
    script.onload = finish;
    script.onerror = () =>
      reject(new Error("SoundCloud widget API failed to load"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

/** Seek the widget (ms) and optionally play. */
export function cueSoundCloudWidget(
  widget: SoundCloudWidget,
  startSec: number | null,
  play: boolean,
): void {
  widget.seekTo(Math.max(0, Math.floor(startSec ?? 0) * 1000));
  if (play) widget.play();
}
