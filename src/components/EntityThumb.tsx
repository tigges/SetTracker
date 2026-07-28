"use client";

import { useState } from "react";
import { mediaUrl } from "@/lib/mediaUrl";

/**
 * Shared avatar/cover tile. Shows a sourced image when available, otherwise a
 * monogram on the entity accent color. Broken remote URLs fall back to monogram.
 */
export function EntityThumb({
  src,
  label,
  accent = "var(--brand)",
  size = 48,
  radius = 12,
  monogram,
  className = "",
  onImageError,
}: {
  src?: string | null;
  /** Accessible name; used for alt text when an image is present. */
  label: string;
  accent?: string;
  size?: number;
  radius?: number;
  /** Fallback initials / letter. Defaults to first char of label. */
  monogram?: string;
  className?: string;
  /** Fired when a remote image fails (403 / 404) — callers may hide the card. */
  onImageError?: () => void;
}) {
  const [broken, setBroken] = useState(false);
  const letter =
    (monogram != null
      ? monogram.trim().slice(0, 2)
      : label.trim().slice(0, 1)) || "?";
  const style = {
    width: size,
    height: size,
    borderRadius: radius,
  } as const;
  const resolved = broken ? undefined : mediaUrl(src);

  if (resolved) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote Deezer CDN; static export
      <img
        src={resolved}
        alt={label}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className={`flex-none object-cover ${className}`}
        style={{
          ...style,
          border: "1px solid var(--line)",
          background: "var(--panel2)",
        }}
        onError={() => {
          setBroken(true);
          onImageError?.();
        }}
      />
    );
  }

  return (
    <span
      className={`grid flex-none place-items-center font-black ${className}`}
      style={{
        ...style,
        background: `${accent}22`,
        color: accent,
        border: `1px solid ${accent}44`,
        fontSize: Math.max(12, Math.round(size * 0.38)),
      }}
      aria-hidden
    >
      {letter}
    </span>
  );
}
