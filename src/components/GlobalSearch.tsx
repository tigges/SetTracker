"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SearchIndexItem } from "@/lib/searchIndex";

const KIND_LABEL: Record<SearchIndexItem["kind"], string> = {
  set: "Set",
  dj: "DJ",
  venue: "Venue",
  label: "Label",
  track: "Track",
};

function score(item: SearchIndexItem, q: string): number {
  const query = q.toLowerCase().trim();
  if (!query) return 0;
  const hay = `${item.title} ${item.subtitle ?? ""} ${item.keywords ?? ""}`.toLowerCase();
  if (hay === query) return 100;
  if (item.title.toLowerCase().startsWith(query)) return 90;
  if (hay.startsWith(query)) return 80;
  if (item.title.toLowerCase().includes(query)) return 70;
  if (hay.includes(query)) return 50;
  // token AND
  const tokens = query.split(/\s+/).filter(Boolean);
  if (tokens.every((t) => hay.includes(t))) return 40;
  return 0;
}

export function GlobalSearch({ items }: { items: SearchIndexItem[] }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const query = q.trim();
    if (query.length < 2) return [];
    return items
      .map((item) => ({ item, s: score(item, query) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || a.item.title.localeCompare(b.item.title))
      .slice(0, 12)
      .map((x) => x.item);
  }, [items, q]);

  useEffect(() => {
    setActive(0);
  }, [q]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") {
        setOpen(false);
        input.current?.blur();
      }
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={root} className="relative w-full max-w-[16rem] sm:max-w-[18rem]">
      <label className="sr-only" htmlFor="global-search">
        Search sets, DJs, venues, tracks
      </label>
      <input
        ref={input}
        id="global-search"
        type="search"
        value={q}
        placeholder="Search…"
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
            setOpen(true);
            return;
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => Math.min(i + 1, Math.max(results.length - 1, 0)));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
          } else if (e.key === "Enter" && results[active]) {
            e.preventDefault();
            window.location.href = results[active].href;
          }
        }}
        className="w-full rounded-md border border-line bg-panel px-3 py-1.5 text-[13px] text-ink outline-none transition-colors placeholder:text-muted2 focus:border-brand"
      />
      <span className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 mono text-[10px] text-muted2 sm:inline">
        ⌘K
      </span>

      {open && q.trim().length >= 2 && (
        <div className="absolute right-0 z-40 mt-1.5 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-lg border border-line bg-panel shadow-lg shadow-black/40">
          {results.length === 0 ? (
            <p className="px-3 py-3 text-[12px] text-muted2">No matches</p>
          ) : (
            <ul className="max-h-[22rem] overflow-auto py-1">
              {results.map((r, i) => (
                <li key={`${r.kind}:${r.href}:${r.title}`}>
                  <Link
                    href={r.href}
                    onClick={() => {
                      setOpen(false);
                      setQ("");
                    }}
                    className={`flex items-start gap-2 px-3 py-2 text-left transition-colors ${
                      i === active ? "bg-bg2" : "hover:bg-bg2"
                    }`}
                    onMouseEnter={() => setActive(i)}
                  >
                    <span className="mt-0.5 mono w-10 flex-none text-[10px] uppercase tracking-wide text-muted2">
                      {KIND_LABEL[r.kind]}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] text-ink">
                        {r.title}
                      </span>
                      {r.subtitle && (
                        <span className="block truncate text-[11px] text-muted2">
                          {r.subtitle}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
