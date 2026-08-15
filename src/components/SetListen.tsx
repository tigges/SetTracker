"use client";

import { createContext, useCallback, useContext, useState } from "react";

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

/**
 * Bridges the on-site player and the tracklist: cue / row clicks open
 * the embed and seek to that timestamp (YouTube `start=`, SoundCloud `#t=`).
 */
export function SetListen({ children }: { children: React.ReactNode }) {
  const [startSec, setStartSec] = useState<number | null>(null);
  const [seekNonce, setSeekNonce] = useState(0);

  const seek = useCallback((sec: number) => {
    setStartSec(Math.max(0, Math.floor(sec)));
    setSeekNonce((n) => n + 1);
  }, []);

  return (
    <SetListenContext.Provider value={{ seek, startSec, seekNonce }}>
      {children}
    </SetListenContext.Provider>
  );
}
