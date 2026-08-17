import Link from "next/link";
import { ExpandableChipRow } from "@/components/ExpandableChipRow";
import type { LineupName } from "@/lib/lineupMatch";

const CHIP =
  "rounded-full border border-line px-3 py-1 text-[12px] transition-colors";
const CHIP_COMPACT =
  "rounded-full border border-line px-2 py-0.5 text-[11px] transition-colors";

export function LineupArtistChips({
  artists,
  previewCount = 8,
  compact = false,
}: {
  artists: LineupName[];
  previewCount?: number;
  compact?: boolean;
}) {
  if (artists.length === 0) return null;
  const chip = compact ? CHIP_COMPACT : CHIP;
  const items = artists.map((a, i) =>
    a.slug ? (
      <Link
        key={`${a.slug}-${i}`}
        href={`/djs/${a.slug}`}
        className={`${chip} bg-panel hover:border-brand`}
        style={{ color: a.accent || "var(--brand)" }}
        title="In catalog"
      >
        {a.name}
      </Link>
    ) : (
      <span
        key={`${a.name}-${i}`}
        className={`${chip} bg-panel2 text-muted`}
        title="On the bill"
      >
        {a.name}
      </span>
    ),
  );

  return (
    <ExpandableChipRow
      items={items}
      previewCount={previewCount}
      moreLabel="on the bill"
    />
  );
}
