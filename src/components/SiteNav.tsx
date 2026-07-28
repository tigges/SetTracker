"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Sets" },
  { href: "/djs", label: "DJs" },
  { href: "/venues", label: "Venues" },
  { href: "/tracks", label: "Tracks" },
  { href: "/stats", label: "Stats" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/" || pathname.startsWith("/sets");
  }
  // Labels live under the Venues page section; keep Venues lit on /labels.
  if (href === "/venues") {
    return (
      pathname === "/venues" ||
      pathname.startsWith("/venues/") ||
      pathname === "/labels" ||
      pathname.startsWith("/labels/")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav() {
  const pathname = usePathname() || "/";

  return (
    <nav
      aria-label="Primary"
      className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto scroll-thin text-[13px] sm:gap-1"
    >
      {LINKS.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex-none rounded-md px-2 py-1.5 transition-colors sm:px-2.5 ${
              active
                ? "bg-panel text-ink"
                : "text-muted hover:bg-panel hover:text-ink"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
