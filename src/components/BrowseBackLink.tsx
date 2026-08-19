"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  readBrowseBack,
  resolveBrowseBackTarget,
  sameOriginReferrerPath,
} from "@/lib/browseBack";

function subscribe(onChange: () => void) {
  window.addEventListener("pageshow", onChange);
  return () => window.removeEventListener("pageshow", onChange);
}

function getSnapshot() {
  const target = resolveBrowseBackTarget(
    readBrowseBack(),
    sameOriginReferrerPath(),
  );
  return target ? JSON.stringify(target) : "";
}

function getServerSnapshot() {
  return "";
}

export function BrowseBackLink() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const target = raw ? (JSON.parse(raw) as { href: string; label: string; useBack: boolean }) : null;

  if (!target) return null;

  const className =
    "mono cursor-pointer border-0 bg-transparent p-0 text-[12px] text-muted2 transition-colors hover:text-ink";

  if (target.useBack) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => window.history.back()}
      >
        ← {target.label}
      </button>
    );
  }

  return (
    <Link href={target.href} className={className}>
      ← {target.label}
    </Link>
  );
}
