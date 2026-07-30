import Link from "next/link";

/**
 * Site lockup — setradar.ai wordmark (no tile mark; saves header space).
 */
export function BrandMark({
  compact = false,
}: {
  /** Slightly tighter lockup for constrained headers. */
  compact?: boolean;
}) {
  const word = compact ? "text-[16px]" : "text-[18px]";

  return (
    <Link
      href="/"
      className="group flex flex-none items-center"
      aria-label="setradar.ai home"
    >
      <span className={`${word} font-extrabold tracking-tight`}>
        SET<span className="text-brand">RADAR</span>
        <span className="text-muted2">.ai</span>
      </span>
    </Link>
  );
}
