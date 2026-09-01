"use client";

import Link from "next/link";
import { useState } from "react";
import type { DjBioPart } from "@/lib/srDjBio";

export function DjBio({
  parts,
  full,
}: {
  parts: DjBioPart[];
  full?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const lede = parts.map((p) => p.text).join("");
  const canExpand = Boolean(full && full.length > lede.length + 24);

  return (
    <div className="mt-4 max-w-2xl">
      <p className="text-[14px] text-muted">
        {parts.map((part, i) =>
          part.href ? (
            <Link
              key={`${part.href}-${i}`}
              href={part.href}
              className="underline decoration-dotted underline-offset-2 hover:text-ink"
            >
              {part.text}
            </Link>
          ) : (
            <span key={`t-${i}`}>{part.text}</span>
          ),
        )}
      </p>
      {canExpand ? (
        <>
          <button
            type="button"
            className="mt-0.5 text-[12px] font-medium text-brand hover:text-brandstrong"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Show less" : "Show more"}
          </button>
          {open ? (
            <p className="mt-2 text-[13px] text-muted2">
              {full}
              <span className="mt-1 block text-[11px] uppercase tracking-[0.12em]">
                DJ Mag Top 100 DJs
              </span>
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
