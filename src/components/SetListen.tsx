"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useSyncExternalStore,
} from "react";
import { cueSecondsFromLocation } from "@/lib/setCue";

type SetListenValue = {
  seek: (sec: number) => void;
  startSec: number | null;
  seekNonce: number;
};

const SetListenContext = createContext<SetListenValue | null>(null);

export function useSetListen(): SetListenValue | null {
  return useContext(SetListenContext);
}

export function useSetSeek(): ((sec: number) => void) | null {
  return useContext(SetListenContext)?.seek ?? null;
}

function subscribeLocation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener("hashchange", onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener("hashchange", onChange);
  };
}

function cueFromWindow(): number | null {
  return cueSecondsFromLocation(
    window.location.search,
    window.location.hash,
  );
}

/**
 * Bridges the on-site player and the tracklist: cue / row clicks open
 * the embed and seek to that timestamp (YouTube `start=`, SoundCloud `#t=`).
 * `?t=` / `#t=` from a track-page set link apply on first client paint.
 */
export function SetListen({ children }: { children: React.ReactNode }) {
  const urlCue = useSyncExternalStore(
    subscribeLocation,
    cueFromWindow,
    () => null,
  );
  const [userCue, setUserCue] = useState<{
    sec: number;
    nonce: number;
  } | null>(null);

  const startSec = userCue?.sec ?? urlCue;
  const seekNonce = userCue?.nonce ?? (urlCue != null ? 1 : 0);

  const seek = useCallback((sec: number) => {
    const next = Math.max(0, Math.floor(sec));
    setUserCue((prev) => ({
      sec: next,
      nonce: (prev?.nonce ?? (urlCue != null ? 1 : 0)) + 1,
    }));
  }, [urlCue]);

  return (
    <SetListenContext.Provider value={{ seek, startSec, seekNonce }}>
      {children}
    </SetListenContext.Provider>
  );
}
