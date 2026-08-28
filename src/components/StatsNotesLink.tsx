import Link from "next/link";

/** Operator handbook — static copy lives on /stats/notes, not the dashboard. */
export function StatsNotesLink({
  hash,
  children = "Notes",
}: {
  hash?: string;
  children?: string;
}) {
  return (
    <Link
      href={hash ? `/stats/notes#${hash}` : "/stats/notes"}
      className="text-[11px] text-muted underline-offset-2 hover:text-brand hover:underline"
    >
      {children}
    </Link>
  );
}
