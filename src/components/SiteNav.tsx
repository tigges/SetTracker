"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { isPrimaryNavActive } from "@/lib/siteNav";

const PRIMARY = [
  { href: "/sets", label: "Sets" },
  { href: "/djs", label: "DJs" },
  { href: "/events", label: "Events" },
  { href: "/atlas", label: "Atlas" },
] as const;

const MORE = [
  { href: "/tracks", label: "Tracks" },
  { href: "/labels", label: "Labels" },
  { href: "/wishlist", label: "Wishlist" },
] as const;

function linkClass(active: boolean) {
  return `flex-none rounded-md px-2 py-1.5 transition-colors sm:px-2.5 ${
    active ? "bg-panel text-ink" : "text-muted hover:bg-panel hover:text-ink"
  }`;
}

export function SiteNav() {
  const pathname = usePathname() || "/";
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const moreActive = MORE.some((link) => isPrimaryNavActive(pathname, link.href));

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!moreOpen) return;
    function onPointer(e: PointerEvent) {
      if (!moreRef.current?.contains(e.target as Node)) setMoreOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [moreOpen]);

  return (
    <nav
      aria-label="Primary"
      className="flex min-w-0 flex-1 items-center gap-0.5 text-[13px] sm:gap-1"
    >
      {PRIMARY.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={linkClass(isPrimaryNavActive(pathname, link.href))}
        >
          {link.label}
        </Link>
      ))}
      <div className="hidden items-center gap-0.5 sm:flex sm:gap-1">
        {MORE.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={linkClass(isPrimaryNavActive(pathname, link.href))}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="relative sm:hidden" ref={moreRef}>
        <button
          type="button"
          aria-expanded={moreOpen}
          aria-haspopup="menu"
          onClick={() => setMoreOpen((v) => !v)}
          className={linkClass(moreActive || moreOpen)}
        >
          More
        </button>
        {moreOpen ? (
          <div
            role="menu"
            className="absolute left-0 top-full z-40 mt-1 min-w-[8.5rem] rounded-lg border border-line bg-panel py-1 shadow-lg shadow-black/40"
          >
            {MORE.map((link) => (
              <Link
                key={link.href}
                role="menuitem"
                href={link.href}
                className={`block px-3 py-2 ${
                  isPrimaryNavActive(pathname, link.href)
                    ? "text-ink"
                    : "text-muted hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </nav>
  );
}
