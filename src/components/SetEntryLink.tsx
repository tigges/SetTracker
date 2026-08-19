"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";
import { markBrowseBack } from "@/lib/browseBack";

/** Link to a set that remembers the current list as the set-page back target. */
export function SetEntryLink({
  href,
  label,
  className,
  children,
  onClick,
}: {
  href: string;
  label?: string;
  className?: string;
  children: ReactNode;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={(e) => {
        markBrowseBack(label);
        onClick?.(e);
      }}
    >
      {children}
    </Link>
  );
}
