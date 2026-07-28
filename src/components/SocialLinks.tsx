import { SOCIAL_LABELS, SOCIAL_ORDER, SOCIAL_SHORT } from "@/lib/social";

export function SocialLinks({
  links,
}: {
  links: Record<string, string | null | undefined>;
}) {
  const orderedKeys = [
    ...SOCIAL_ORDER.filter((k) => !!links[k]),
    ...Object.keys(links).filter(
      (k) => !!links[k] && !(SOCIAL_ORDER as readonly string[]).includes(k),
    ),
  ];
  if (orderedKeys.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {orderedKeys.map((key) => {
        const url = links[key]!;
        return (
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
        );
      })}
    </div>
  );
}
