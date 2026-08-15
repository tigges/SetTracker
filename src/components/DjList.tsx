"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { EntityThumb } from "@/components/EntityThumb";
import { displayCity } from "@/lib/displayCity";
import type { DjListItem } from "@/lib/queries";

const FILTERS = [
  { id: "browse", label: "Browse" },
  { id: "all", label: "All stored" },
  { id: "no-sets", label: "No sets" },
  { id: "empty-sets", label: "Empty sets" },
  { id: "has-sets", label: "Has sets" },
  { id: "no-handle", label: "No handle" },
  { id: "has-handle", label: "Has handle" },
  { id: "no-thumb", label: "No thumb" },
  { id: "handle-no-sets", label: "Handle · 0 sets" },
  { id: "junk", label: "Junk names" },
] as const;

type FilterId = (typeof FILTERS)[number]["id"];

const chip = (active: boolean) =>
  `rounded-full border px-3 py-1 text-[12px] transition-colors ${
    active
      ? "border-brand bg-[color:var(--brand)]/10 text-brand"
      : "border-line text-muted hover:border-muted2 hover:text-ink"
  }`;

function matches(d: DjListItem, filter: FilterId): boolean {
  if (filter === "junk") return d.isJunk;
  if (filter === "browse") return d.isBrowseReady;
  // Hide aria-label / form-field junk from every other browse mode.
  if (d.isJunk) return false;
  switch (filter) {
    case "all":
      return true;
    case "no-sets":
      return d.setCount === 0;
    case "empty-sets":
      return d.setCount > 0 && d.playCount === 0;
    case "has-sets":
      return d.setCount > 0;
    case "no-handle":
      return !d.hasHandle;
    case "has-handle":
      return d.hasHandle;
    case "no-thumb":
      return !d.imageUrl;
    case "handle-no-sets":
      return d.hasHandle && d.setCount === 0;
    default:
      return true;
  }
}

function handleBits(d: DjListItem): string {
  const bits: string[] = [];
  if (d.soundcloud) bits.push("SC");
  if (d.youtube) bits.push("YT");
  if (d.instagram) bits.push("IG");
  if (d.twitter) bits.push("X");
  if (d.website) bits.push("Web");
  return bits.length ? bits.join(" · ") : "no handle";
}

/**
 * DJ directory defaults to browse-ready artists.
 * Catalog QA chips stay folded away until the stored catalog is cleaner.
 */
export function DjList({ djs }: { djs: DjListItem[] }) {
  const [filter, setFilter] = useState<FilterId>("browse");
  const [showQa, setShowQa] = useState(false);

  const filtered = useMemo(
    () => djs.filter((d) => matches(d, filter)),
    [djs, filter],
  );

  const counts = useMemo(() => {
    const c: Record<FilterId, number> = {
      browse: 0,
      all: 0,
      "no-sets": 0,
      "empty-sets": 0,
      "has-sets": 0,
      "no-handle": 0,
      "has-handle": 0,
      "no-thumb": 0,
      "handle-no-sets": 0,
      junk: 0,
    };
    for (const d of djs) {
      if (d.isBrowseReady) c.browse++;
      if (d.isJunk) {
        c.junk++;
        continue;
      }
      c.all++;
      if (d.setCount === 0) c["no-sets"]++;
      else c["has-sets"]++;
      if (d.setCount > 0 && d.playCount === 0) c["empty-sets"]++;
      if (!d.imageUrl) c["no-thumb"]++;
      if (d.hasHandle) {
        c["has-handle"]++;
        if (d.setCount === 0) c["handle-no-sets"]++;
      } else {
        c["no-handle"]++;
      }
    }
    return c;
  }, [djs]);

  return (
    <div>
      <div className="mb-6">
        <div className="mb-1.5 flex flex-wrap items-center gap-3">
          <p className="mono text-[10px] uppercase tracking-[0.14em] text-muted2">
            {showQa ? "Catalog QA" : "Directory"}
          </p>
          <button
            type="button"
            onClick={() => {
              setShowQa((v) => {
                if (v) setFilter("browse");
                return !v;
              });
            }}
            className="mono text-[11px] text-muted2 underline decoration-dotted underline-offset-2 hover:text-ink"
          >
            {showQa ? "Hide QA filters" : "Catalog QA"}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(showQa ? FILTERS : FILTERS.filter((f) => f.id === "browse")).map(
            (f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={chip(filter === f.id)}
              >
                {f.label}
                <span className="mono ml-1.5 text-[11px] opacity-70">
                  {counts[f.id]}
                </span>
              </button>
            ),
          )}
          <span className="mono ml-1 text-[12px] text-muted2">
            {filtered.length} shown
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-[14px] text-muted">No DJs match this filter.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((dj) => (
            <Link
              key={dj.id}
              href={`/djs/${dj.slug}`}
              className="card flex items-center gap-3 p-4 transition-colors hover:border-[color:var(--muted2)]"
            >
              <EntityThumb
                src={dj.imageUrl}
                label={dj.name}
                accent={dj.accent}
                size={44}
                radius={12}
              />
              <div className="min-w-0">
                <div className="truncate text-[15px] font-semibold text-ink">
                  {dj.name}
                </div>
                <div className="truncate text-[12px] text-muted2">
                  {(() => {
                    const city = displayCity(dj.homeCity);
                    return city ? `${city} · ` : "";
                  })()}
                  {dj.setCount} {dj.setCount === 1 ? "set" : "sets"}
                  {" · "}
                  {handleBits(dj)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
