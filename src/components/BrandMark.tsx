import Link from "next/link";

/**
 * Site lockup — SR tile + setradar wordmark.
 * Colors track CSS brand tokens so the mark sits with status chrome, not a neon outlier.
 */
export function BrandMark({
  compact = false,
}: {
  /** Slightly tighter lockup for constrained headers. */
  compact?: boolean;
}) {
  const tile = compact ? "h-9 w-9 text-[13px]" : "h-10 w-10 text-[14px]";
  const word = compact ? "text-[16px]" : "text-[18px]";

  return (
    <Link
      href="/"
      className="group flex flex-none items-center gap-2.5"
      aria-label="setradar.ai home"
    >
      <span
        className={`grid ${tile} place-items-center rounded-[10px] border font-black tracking-tight transition-colors`}
        style={{
          color: "var(--brand-strong)",
          background:
            "color-mix(in srgb, var(--brand) 14%, var(--panel))",
          borderColor: "color-mix(in srgb, var(--brand) 38%, var(--line))",
        }}
      >
        SR
      </span>
      <span className={`${word} font-extrabold tracking-tight`}>
        SET<span className="text-brand">RADAR</span>
        <span className="text-muted2">.ai</span>
      </span>
    </Link>
  );
}
