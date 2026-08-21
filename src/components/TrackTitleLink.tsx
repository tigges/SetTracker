import Link from "next/link";
import { trackPublicHref } from "@/lib/trackHref";

export function TrackTitleLink({
  slug,
  title,
  artistName,
  exportedSlugs,
  beatportUrl,
  className,
}: {
  slug: string;
  title: string;
  artistName: string;
  exportedSlugs: ReadonlySet<string> | readonly string[];
  beatportUrl?: string | null;
  className?: string;
}) {
  const href = trackPublicHref(slug, { exportedSlugs, beatportUrl });
  const cls =
    className ??
    "truncate text-[13px] text-ink transition-colors hover:text-brand";
  const label = (
    <>
      {title}
      <span className="text-muted"> — {artistName}</span>
    </>
  );
  if (href.kind === "page") {
    return (
      <Link href={href.href} className={cls}>
        {label}
      </Link>
    );
  }
  if (href.kind === "beatport") {
    return (
      <a
        href={href.href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        title="Open on Beatport"
      >
        {label}
      </a>
    );
  }
  return <span className={className ?? "truncate text-[13px] text-ink"}>{label}</span>;
}
