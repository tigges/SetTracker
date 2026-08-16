"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ATLAS_QUERY_EVENT } from "@/lib/atlas/searchItems";
import { mediaUrl } from "@/lib/mediaUrl";
import type { SearchIndexItem } from "@/lib/searchIndex";

const KIND_LABEL: Record<SearchIndexItem["kind"], string> = {
  set: "Set",
  dj: "DJ",
  venue: "Event",
  label: "Label",
  track: "Track",
  atlas: "Atlas",
  series: "Series",
};

const HEADER_KIND_FILTERS: Array<"all" | SearchIndexItem["kind"]> = [
  "all",
  "set",
  "dj",
  "venue",
  "atlas",
  "label",
  "track",
];

const PAGE_KIND_FILTERS: Array<"all" | SearchIndexItem["kind"]> = [
  "all",
  "set",
  "dj",
  "venue",
  "atlas",
  "label",
  "track",
  "series",
];

function score(item: SearchIndexItem, q: string): number {
  const query = q.toLowerCase().trim();
  if (!query) return 0;
  const hay = `${item.title} ${item.subtitle ?? ""} ${item.keywords ?? ""}`.toLowerCase();
  if (hay === query) return 100;
  if (item.title.toLowerCase().startsWith(query)) return 90;
  if (hay.startsWith(query)) return 80;
  if (item.title.toLowerCase().includes(query)) return 70;
  if (hay.includes(query)) return 50;
  const tokens = query.split(/\s+/).filter(Boolean);
  if (tokens.every((t) => hay.includes(t))) return 40;
  return 0;
}

let cachedIndex: SearchIndexItem[] | null = null;
let indexPromise: Promise<SearchIndexItem[]> | null = null;

async function loadSearchIndex(): Promise<SearchIndexItem[]> {
  if (cachedIndex) return cachedIndex;
  if (!indexPromise) {
    indexPromise = fetch(mediaUrl("/search-index.json") ?? "/search-index.json")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: SearchIndexItem[]) => {
        cachedIndex = Array.isArray(data) ? data : [];
        return cachedIndex;
      })
      .catch(() => {
        indexPromise = null;
        return [] as SearchIndexItem[];
      });
  }
  return indexPromise;
}

export function GlobalSearch({
  initialQuery = "",
  embedded = false,
}: {
  initialQuery?: string;
  /** Full-width results for /search — no dropdown chrome. */
  embedded?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const onAtlas = pathname === "/atlas" || pathname.startsWith("/atlas/");
  const kindFilters = embedded ? PAGE_KIND_FILTERS : HEADER_KIND_FILTERS;
  const [q, setQ] = useState(initialQuery);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [kind, setKind] = useState<"all" | SearchIndexItem["kind"]>("all");
  const [items, setItems] = useState<SearchIndexItem[]>(cachedIndex ?? []);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void loadSearchIndex().then(setItems);
  }, []);

  const results = useMemo(() => {
    const query = q.trim();
    if (query.length < 2) return [];
    return items
      .filter((item) => kind === "all" || item.kind === kind)
      .map((item) => {
        let s = score(item, query);
        if (onAtlas && item.kind === "atlas") s += 20;
        return { item, s };
      })
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || a.item.title.localeCompare(b.item.title))
      .slice(0, embedded ? 40 : 12)
      .map((x) => x.item);
  }, [items, q, kind, embedded, onAtlas]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
        setOpen(true);
        void loadSearchIndex().then(setItems);
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

  const box = (
    <>
      <label className="sr-only" htmlFor={embedded ? "page-search" : "global-search"}>
        Search sets, DJs, events, tracks
      </label>
      <input
        ref={input}
        id={embedded ? "page-search" : "global-search"}
        type="search"
        value={q}
        placeholder="Search…"
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => {
          const next = e.target.value;
          setQ(next);
          setActive(0);
          setOpen(true);
          if (onAtlas && typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent(ATLAS_QUERY_EVENT, { detail: next }),
            );
          }
        }}
        onFocus={() => {
          setOpen(true);
          void loadSearchIndex().then(setItems);
        }}
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
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (results[active]) {
              router.push(results[active].href);
              setOpen(false);
              if (!embedded) setQ("");
            } else if (q.trim().length >= 2 && !embedded) {
              router.push(`/search?q=${encodeURIComponent(q.trim())}`);
              setOpen(false);
            }
          }
        }}
        className={
          embedded
            ? "w-full rounded-lg border border-line bg-panel px-4 py-2.5 text-[15px] text-ink outline-none transition-colors placeholder:text-muted2 focus:border-brand"
            : "w-full rounded-md border border-line bg-panel px-3 py-1.5 text-[13px] text-ink outline-none transition-colors placeholder:text-muted2 focus:border-brand"
        }
      />
    </>
  );

  const filters = (
    <div className={`flex flex-wrap gap-1 ${embedded ? "mb-3" : "border-b border-line px-2 py-1.5"}`}>
      {kindFilters.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => {
            setKind(k);
            setActive(0);
          }}
          className={`rounded-md px-1.5 py-0.5 text-[10px] uppercase tracking-wide transition-colors ${
            kind === k ? "bg-bg2 text-brand" : "text-muted2 hover:text-ink"
          }`}
        >
          {k === "all" ? "All" : KIND_LABEL[k]}
        </button>
      ))}
    </div>
  );

  const list = (
    <ul className={embedded ? "divide-y divide-linesoft rounded-2xl border border-line bg-panel" : "max-h-[22rem] overflow-auto py-1"}>
      {results.map((r, i) => (
        <li key={`${r.kind}:${r.href}:${r.title}`}>
          <Link
            href={r.href}
            onClick={() => {
              setOpen(false);
              if (!embedded) setQ("");
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
              <span className="block truncate text-[13px] text-ink">{r.title}</span>
              {r.subtitle && (
                <span className="block truncate text-[11px] text-muted2">{r.subtitle}</span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );

  if (embedded) {
    return (
      <div ref={root}>
        <div className="mb-4">{box}</div>
        {q.trim().length >= 2 ? (
          <>
            {filters}
            {results.length === 0 ? (
              <p className="py-10 text-center text-[14px] text-muted2">No matches</p>
            ) : (
              list
            )}
          </>
        ) : (
          <p className="text-[13px] text-muted2">Type at least two characters.</p>
        )}
      </div>
    );
  }

  return (
    <div ref={root} className="relative w-[8.75rem] sm:w-[16rem]">
      {box}
      <span className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 mono text-[10px] text-muted2 sm:inline">
        ⌘K
      </span>

      {open && q.trim().length >= 2 && (
        <div className="absolute right-0 z-40 mt-1.5 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-lg border border-line bg-panel shadow-lg shadow-black/40">
          {filters}
          {results.length === 0 ? (
            <p className="px-3 py-3 text-[12px] text-muted2">No matches</p>
          ) : (
            list
          )}
          <Link
            href={`/search?q=${encodeURIComponent(q.trim())}`}
            onClick={() => setOpen(false)}
            className="block border-t border-line px-3 py-2 text-[11px] text-muted2 hover:text-ink"
          >
            All results →
          </Link>
        </div>
      )}
    </div>
  );
}
