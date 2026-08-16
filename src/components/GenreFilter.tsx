"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  catalogGenresInFamily,
  familiesPresentInCatalog,
  familyFilterValue,
  genreFilterLabel,
} from "@/lib/genreFamilies";
import { placeRightAlignedPopover } from "@/lib/popoverPlace";

const MENU_WIDTH = 256;

function rowClass(active: boolean): string {
  return `flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors ${
    active
      ? "bg-[color:var(--brand)]/10 text-brand"
      : "text-muted hover:bg-panel2 hover:text-ink"
  }`;
}

export function GenreFilter({
  genres,
  value,
  onChange,
}: {
  genres: string[];
  value: string;
  onChange: (next: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const families = useMemo(() => familiesPresentInCatalog(genres), [genres]);

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

  if (genres.length === 0) return null;

  function pick(next: string) {
    onChange(next);
    setOpen(false);
  }

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Genre filter, ${genreFilterLabel(value)}`}
        onClick={toggle}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] transition-colors ${
          value === "all"
            ? "border-line text-muted hover:border-muted2 hover:text-ink"
            : "border-brand bg-[color:var(--brand)]/10 text-brand"
        }`}
      >
        <span className="mono text-[10px] uppercase tracking-[0.12em] text-muted2">
          Genre
        </span>
        <span>{genreFilterLabel(value)}</span>
        <span aria-hidden className="text-[10px] text-muted2">
          {open ? "▴" : "▾"}
        </span>
      </button>

      {open && pos ? (
        <div
          role="listbox"
          style={{
            top: pos.top,
            left: pos.left,
            width: pos.width,
            maxHeight: pos.maxHeight,
          }}
          className="fixed z-30 overflow-y-auto rounded-xl border border-line bg-panel p-1.5 shadow-lg shadow-black/40 scroll-thin"
        >
          <button
            type="button"
            role="option"
            aria-selected={value === "all"}
            onClick={() => pick("all")}
            className={rowClass(value === "all")}
          >
            All genres
          </button>
          {families.map((family) => {
            const children = catalogGenresInFamily(family.id, genres);
            const familyValue = familyFilterValue(family.id);
            const familyActive = value === familyValue;
            const showChildren = children.length > 1;
            return (
              <div key={family.id} className="mt-0.5">
                <button
                  type="button"
                  role="option"
                  aria-selected={familyActive}
                  onClick={() => pick(familyValue)}
                  className={rowClass(familyActive)}
                >
                  <span>{family.label}</span>
                  <span className="mono text-[11px] text-muted2">
                    {children.length}
                  </span>
                </button>
                {showChildren && (
                  <div className="mb-1 ml-2 border-l border-line pl-1.5">
                    {children.map((g) => (
                      <button
                        key={g}
                        type="button"
                        role="option"
                        aria-selected={value === g}
                        onClick={() => pick(g)}
                        className={`${rowClass(value === g)} py-1 text-[12px]`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
