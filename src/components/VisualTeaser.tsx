import Link from "next/link";
import { EntityThumb } from "@/components/EntityThumb";
import {
  CALENDAR_WEEKDAYS,
  monthGrid,
  monthTitle,
} from "@/lib/calendarGrid";

export type TeaserFace = {
  src?: string | null;
  label: string;
  accent?: string;
};

function ThumbStack({ faces }: { faces: TeaserFace[] }) {
  const shown = faces.slice(0, 3);
  if (shown.length === 0) return null;
  return (
    <div className="flex items-end pl-2">
      {shown.map((f, i) => (
        <div
          key={`${f.label}-${i}`}
          className="relative -ml-2 first:ml-0"
          style={{ zIndex: shown.length - i }}
        >
          <EntityThumb
            src={f.src}
            label={f.label}
            accent={f.accent ?? "var(--brand)"}
            size={i === 0 ? 56 : 44}
            radius={12}
            monogram={f.label.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase()}
          />
        </div>
      ))}
    </div>
  );
}

function AtlasDots() {
  return (
    <p className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-muted2">
      <i className="inline-block h-2 w-2 rounded-full bg-amber" />
      Fests
      <i className="inline-block h-2 w-2 rounded-full bg-teal" />
      Clubs
      <i className="inline-block h-2 w-2 rounded-full bg-violet" />
      DJs
    </p>
  );
}

function MiniMonth({
  marked,
  nowMs,
}: {
  marked: Set<string>;
  nowMs: number;
}) {
  const now = new Date(nowMs);
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const cells = monthGrid(year, month, nowMs);
  return (
    <div className="w-[7.5rem] flex-none" aria-hidden>
      <p className="mb-1 text-center text-[10px] font-medium text-muted2">
        {monthTitle(year, month)}
      </p>
      <div className="grid grid-cols-7 gap-px text-center text-[8px] text-muted2">
        {CALENDAR_WEEKDAYS.map((d) => (
          <span key={d}>{d[0]}</span>
        ))}
        {cells.map((c) => {
          const on = marked.has(c.iso);
          return (
            <span
              key={c.iso}
              className={`grid h-3.5 place-items-center rounded-[3px] ${
                !c.inMonth
                  ? "opacity-20"
                  : c.isToday
                    ? "bg-brand/30 text-ink"
                    : on
                      ? "bg-amber/80 text-bg"
                      : "text-muted2"
              }`}
            >
              {c.day}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function VisualTeaser({
  href,
  eyebrow,
  title,
  blurb,
  cta,
  faces,
  variant,
  markedDays,
  nowMs,
}: {
  href: string;
  eyebrow: string;
  title: string;
  blurb: string;
  cta: string;
  faces: TeaserFace[];
  variant: "atlas" | "calendar";
  markedDays?: Set<string>;
  nowMs?: number;
}) {
  return (
    <Link
      href={href}
      className="card flex min-h-[7.5rem] items-stretch gap-4 overflow-hidden p-4 transition-colors hover:border-[color:var(--muted2)]"
    >
      <div className="flex w-[8.5rem] flex-none flex-col justify-center border-r border-line pr-4">
        {variant === "calendar" && nowMs != null ? (
          <MiniMonth marked={markedDays ?? new Set()} nowMs={nowMs} />
        ) : (
          <>
            <ThumbStack faces={faces} />
            <AtlasDots />
          </>
        )}
      </div>
      <span className="flex min-w-0 flex-1 flex-col justify-center">
        <span className="eyebrow">{eyebrow}</span>
        <span className="mt-1 block text-[16px] font-semibold text-ink">
          {title}
        </span>
        <span className="mt-0.5 block text-[13px] text-muted">{blurb}</span>
        {variant === "calendar" && faces.length > 0 ? (
          <span className="mt-2 hidden sm:block">
            <ThumbStack faces={faces} />
          </span>
        ) : null}
        <span className="mt-2 text-[13px] text-brand">{cta}</span>
      </span>
    </Link>
  );
}
