import { SOCIAL_LABELS, SOCIAL_SHORT } from "@/lib/social";

export function SocialLinks({
  links,
}: {
  links: Record<string, string | null | undefined>;
}) {
  const entries = Object.entries(links).filter(([, url]) => !!url) as [
    string,
    string,
  ][];
  if (entries.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {entries.map(([key, url]) => (
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noreferrer"
          title={SOCIAL_LABELS[key] ?? key}
          className="grid h-7 place-items-center rounded-md border border-line px-2.5 text-[11px] text-muted transition-colors hover:border-brand hover:text-brand"
        >
          {SOCIAL_SHORT[key] ?? key}
        </a>
      ))}
    </div>
  );
}
