"use client";

import { useState } from "react";

const SHORT = 160;

export function DjBio({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const short = text.length <= SHORT;

  if (short) {
    return <p className="mt-4 max-w-2xl text-[14px] text-muted">{text}</p>;
  }

  return (
    <div className="mt-4 max-w-2xl">
      <p className={`text-[14px] text-muted ${open ? "" : "line-clamp-2"}`}>
        {text}
      </p>
      <button
        type="button"
        className="mt-0.5 text-[12px] font-medium text-brand hover:text-brandstrong"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Show less" : "Show more"}
      </button>
    </div>
  );
}
