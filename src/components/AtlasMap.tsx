"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { EntityThumb } from "@/components/EntityThumb";
import { WORLD_LAND_PATH } from "@/lib/atlas/worldLandPath";
import {
  atlasCities,
  atlasCountries,
  chartKicker,
  filterAtlasPins,
  type AtlasFilter,
  type AtlasPin,
  type AtlasTypeFilter,
} from "@/lib/atlas/mapMath";

const INITIAL_VIEW = { cx: 500, cy: 430, span: 900 };

type View = { cx: number; cy: number; span: number };

function subscribeHash(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  return () => window.removeEventListener("hashchange", onStoreChange);
}

function getHash() {
  return window.location.hash.replace(/^#/, "");
}

function getServerHash() {
  return "";
}

function pinMatchesHash(p: AtlasPin, hash: string): boolean {
  return p.slug === hash || p.chartSlug === hash || p.id === hash;
}

type SvgWithView = SVGSVGElement & { __applyView?: () => void };

function flyToPin(
  svg: SvgWithView | null,
  view: View,
  p: { x: number; y: number },
  span = 80,
) {
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const from = { ...view };
  const to = { cx: p.x, cy: p.y, span };
  if (reduce) {
    Object.assign(view, to);
    svg?.__applyView?.();
    return;
  }
  const t0 = performance.now();
  const dur = 520;
  const step = (now: number) => {
    const k = Math.min(1, (now - t0) / dur);
    const e = 1 - Math.pow(1 - k, 3);
    view.cx = from.cx + (to.cx - from.cx) * e;
    view.cy = from.cy + (to.cy - from.cy) * e;
    view.span = from.span + (to.span - from.span) * e;
    svg?.__applyView?.();
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function AtlasMap({
  pins,
  year,
}: {
  pins: AtlasPin[];
  year: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const viewRef = useRef<View>({ ...INITIAL_VIEW });
  const flewHash = useRef(false);
  const hash = useSyncExternalStore(subscribeHash, getHash, getServerHash);
  const [filter, setFilter] = useState<AtlasFilter>({
    type: "both",
    q: "",
    country: "",
    city: "",
  });
  const [clickedId, setClickedId] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(true);

  const hits = useMemo(() => filterAtlasPins(pins, filter), [pins, filter]);
  const selected =
    pins.find((p) => p.id === clickedId) ??
    pins.find((p) => hash !== "" && pinMatchesHash(p, hash)) ??
    null;
  const selectedId = selected?.id ?? null;
  const countries = useMemo(
    () => atlasCountries(filterAtlasPins(pins, { ...filter, country: "", city: "" })),
    [pins, filter],
  );
  const cities = useMemo(
    () =>
      atlasCities(
        filterAtlasPins(pins, { ...filter, city: "" }),
        filter.country,
      ),
    [pins, filter],
  );

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const view = viewRef.current;
    let raf: number | null = null;
    let drag: {
      x: number;
      y: number;
      cx: number;
      cy: number;
    } | null = null;

    function size() {
      const r = svg!.getBoundingClientRect();
      return { w: Math.max(1, r.width), h: Math.max(1, r.height) };
    }

    function applyView() {
      const { w, h } = size();
      view.span = Math.max(2.2, Math.min(1400, view.span));
      const spanY = view.span * (h / w);
      const vb = [
        view.cx - view.span / 2,
        view.cy - spanY / 2,
        view.span,
        spanY,
      ];
      if (vb.every(Number.isFinite)) {
        svg!.setAttribute("viewBox", vb.map((n) => n.toFixed(2)).join(" "));
      }
      const r = Math.max(1.8, view.span * 0.0065);
      svg!.querySelectorAll<SVGCircleElement>(".atlas-pin").forEach((c) => {
        c.setAttribute("r", r.toFixed(2));
      });
      const halo = svg!.querySelector(".atlas-halo");
      if (halo) halo.setAttribute("r", (r * 2.6).toFixed(2));
    }

    function scheduleView() {
      if (raf != null) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        applyView();
      });
    }

    applyView();
    const ro = new ResizeObserver(applyView);
    ro.observe(svg);

    function onDown(e: PointerEvent) {
      drag = { x: e.clientX, y: e.clientY, cx: view.cx, cy: view.cy };
      svg!.setPointerCapture(e.pointerId);
      svg!.classList.add("cursor-grabbing");
    }
    function onMove(e: PointerEvent) {
      if (!drag) return;
      const { w } = size();
      const k = view.span / w;
      view.cx = drag.cx - (e.clientX - drag.x) * k;
      view.cy = drag.cy - (e.clientY - drag.y) * k;
      scheduleView();
    }
    function onUp() {
      drag = null;
      svg!.classList.remove("cursor-grabbing");
    }
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const { w, h } = size();
      const box = svg!.getBoundingClientRect();
      const k = view.span / w;
      const px = view.cx + (e.clientX - box.left - w / 2) * k;
      const py = view.cy + (e.clientY - box.top - h / 2) * k;
      const next = view.span * (e.deltaY > 0 ? 1.12 : 0.89);
      const span = Math.max(2.2, Math.min(1400, next));
      const k2 = span / w;
      view.cx = px - (e.clientX - box.left - w / 2) * k2;
      view.cy = py - (e.clientY - box.top - h / 2) * k2;
      view.span = span;
      scheduleView();
    }

    svg.addEventListener("pointerdown", onDown);
    svg.addEventListener("pointermove", onMove);
    svg.addEventListener("pointerup", onUp);
    svg.addEventListener("pointercancel", onUp);
    svg.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", applyView);

    (svg as SvgWithView).__applyView = applyView;

    return () => {
      ro.disconnect();
      svg.removeEventListener("pointerdown", onDown);
      svg.removeEventListener("pointermove", onMove);
      svg.removeEventListener("pointerup", onUp);
      svg.removeEventListener("pointercancel", onUp);
      svg.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", applyView);
    };
  }, []);

  useEffect(() => {
    const svg = svgRef.current as SvgWithView | null;
    svg?.__applyView?.();
  }, [hits, selectedId]);

  useEffect(() => {
    if (flewHash.current || !hash) return;
    const match = pins.find((p) => pinMatchesHash(p, hash));
    if (!match) return;
    flewHash.current = true;
    flyToPin(svgRef.current as SvgWithView | null, viewRef.current, match);
  }, [hash, pins]);

  function fitHits() {
    if (!hits.length) return;
    const svg = svgRef.current;
    if (!svg) return;
    const xs = hits.map((d) => d.x);
    const ys = hits.map((d) => d.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const r = svg.getBoundingClientRect();
    const w = r.width || 1;
    const h = r.height || 1;
    const span = Math.max(
      (maxX - minX) * 1.45,
      (maxY - minY) * 1.45 * (w / h),
      6,
    );
    const view = viewRef.current;
    view.cx = (minX + maxX) / 2;
    view.cy = (minY + maxY) / 2;
    view.span = span;
    (svg as SvgWithView).__applyView?.();
  }

  function resetView() {
    Object.assign(viewRef.current, INITIAL_VIEW);
    (svgRef.current as SvgWithView | null)?.__applyView?.();
    setFilter({ type: "both", q: "", country: "", city: "" });
    setClickedId(null);
    if (typeof window !== "undefined" && window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  }

  function selectPin(p: AtlasPin) {
    setClickedId(p.id);
    if (typeof window !== "undefined") {
      history.replaceState(null, "", `#${p.slug}`);
    }
    flyToPin(svgRef.current as SvgWithView | null, viewRef.current, p);
  }

  function setType(type: AtlasTypeFilter) {
    setFilter((f) => ({ ...f, type }));
  }

  return (
    <div className="atlas-shell">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">DJ Mag reader polls</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
            Top 100 Atlas{" "}
            <span className="text-muted2">/ {year}</span>
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] text-muted">
            Every club and festival on the 2026 charts, mapped — linked to
            setradar sets when the catalog has them.
          </p>
        </div>
        <div className="flex gap-4 text-[12px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block h-2.5 w-2.5 rounded-full bg-amber" />
            Festivals
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block h-2.5 w-2.5 rounded-full bg-teal" />
            Clubs
          </span>
        </div>
      </div>

      <div className="grid min-h-[min(70vh,720px)] overflow-hidden rounded-xl border border-line bg-panel lg:grid-cols-[minmax(240px,300px)_1fr]">
        <aside
          className={`flex min-h-0 flex-col border-line lg:border-r ${
            listOpen ? "" : "hidden lg:flex"
          }`}
        >
          <div className="grid gap-3 border-b border-line p-3">
            <div className="flex overflow-hidden rounded-lg border border-line">
              {(
                [
                  ["both", "Both"],
                  ["festival", "Festivals"],
                  ["club", "Clubs"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={filter.type === value}
                  onClick={() => setType(value)}
                  className={`flex-1 px-2 py-1.5 text-[12px] font-medium ${
                    filter.type === value
                      ? "bg-panel2 text-ink"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="grid gap-1">
              <span className="eyebrow">Search</span>
              <input
                value={filter.q}
                onChange={(e) =>
                  setFilter((f) => ({ ...f, q: e.target.value }))
                }
                placeholder="Name or place"
                className="rounded-md border border-line bg-bg px-2.5 py-1.5 text-[13px] text-ink"
              />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="grid gap-1">
                <span className="eyebrow">Country</span>
                <select
                  value={filter.country}
                  onChange={(e) =>
                    setFilter((f) => ({
                      ...f,
                      country: e.target.value,
                      city: "",
                    }))
                  }
                  className="rounded-md border border-line bg-bg px-2 py-1.5 text-[13px] text-ink"
                >
                  <option value="">All</option>
                  {countries.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1">
                <span className="eyebrow">City</span>
                <select
                  value={filter.city}
                  disabled={!filter.country}
                  onChange={(e) =>
                    setFilter((f) => ({ ...f, city: e.target.value }))
                  }
                  className="rounded-md border border-line bg-bg px-2 py-1.5 text-[13px] text-ink disabled:opacity-40"
                >
                  <option value="">All</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-muted">
              <strong className="mono font-medium text-ink">
                {hits.length}
              </strong>
              of {pins.length}
              <span className="flex-1" />
              <button
                type="button"
                onClick={fitHits}
                className="underline decoration-line underline-offset-2 hover:text-ink"
              >
                Zoom
              </button>
              <button
                type="button"
                onClick={resetView}
                className="underline decoration-line underline-offset-2 hover:text-ink"
              >
                Reset
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto scroll-thin py-1">
            {hits.length === 0 ? (
              <p className="px-4 py-8 text-[13px] text-muted">
                No venues match those filters.
              </p>
            ) : (
              hits
                .slice()
                .sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name))
                .map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    data-on={selectedId === p.id ? "true" : undefined}
                    onClick={() => selectPin(p)}
                    className={`grid w-full grid-cols-[36px_1fr] items-center gap-2 border-l-2 px-3 py-2 text-left ${
                      selectedId === p.id
                        ? "border-[color:var(--pin)] bg-panel2"
                        : "border-transparent hover:bg-panel2"
                    }`}
                    style={
                      {
                        "--pin":
                          p.kind === "festival"
                            ? "var(--amber)"
                            : "var(--teal)",
                      } as CSSProperties
                    }
                  >
                    <span
                      className="mono text-right text-[12px]"
                      style={{ color: "var(--pin)" }}
                    >
                      {p.rank}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-ink">
                        {p.name}
                      </span>
                      <span className="block truncate text-[11px] text-muted2">
                        {p.city}, {p.country}
                        {p.setCount ? ` · ${p.setCount} sets` : ""}
                      </span>
                      <span className="mt-1 block h-0.5 overflow-hidden rounded-sm bg-line">
                        <i
                          className="block h-full"
                          style={{
                            width: `${101 - p.rank}%`,
                            background: "var(--pin)",
                          }}
                        />
                      </span>
                    </span>
                  </button>
                ))
            )}
          </div>
        </aside>

        <div className="relative h-[min(70vh,720px)] min-h-[480px] bg-[#07090d]">
          <button
            type="button"
            className="absolute top-3 left-3 z-10 rounded-md border border-line bg-panel/90 px-2 py-1 text-[12px] text-muted lg:hidden"
            onClick={() => setListOpen((v) => !v)}
          >
            {listOpen ? "Hide list" : "Show list"}
          </button>
          <svg
            ref={svgRef}
            role="img"
            aria-label={`Map of DJ Mag Top 100 clubs and festivals ${year}`}
            viewBox="50 80 900 560"
            preserveAspectRatio="xMidYMid slice"
            className="atlas-map absolute inset-0 h-full w-full cursor-grab touch-none"
          >
            <rect width="1000" height="1000" x="-200" y="-200" fill="#07090d" />
            <path d={WORLD_LAND_PATH} className="atlas-land" />
            {hits.map((p) => (
              <circle
                key={p.id}
                className={`atlas-pin ${p.kind === "festival" ? "atlas-pin-festival" : "atlas-pin-club"}`}
                cx={p.x}
                cy={p.y}
                r={4}
                data-on={selectedId === p.id ? "true" : undefined}
                onClick={(e) => {
                  e.stopPropagation();
                  selectPin(p);
                }}
              />
            ))}
            {selected && hits.some((h) => h.id === selected.id) ? (
              <circle
                className={`atlas-halo ${selected.kind === "festival" ? "atlas-pin-festival" : "atlas-pin-club"}`}
                cx={selected.x}
                cy={selected.y}
                r={10}
                fill="none"
              />
            ) : null}
          </svg>

          {selected ? (
            <div className="absolute right-3 bottom-3 left-3 max-w-md rounded-xl border border-line bg-panel/95 p-3 shadow-lg shadow-black/40 sm:left-auto sm:w-80">
              <div className="flex gap-3">
                <EntityThumb
                  src={selected.imageUrl}
                  label={selected.name}
                  accent={
                    selected.kind === "festival"
                      ? "var(--amber)"
                      : "var(--teal)"
                  }
                  size={56}
                  radius={10}
                  monogram={
                    selected.name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase() ||
                    "#"
                  }
                />
                <div className="min-w-0 flex-1">
                  <p className="eyebrow" style={{ color: selected.kind === "festival" ? "var(--amber)" : "var(--teal)" }}>
                    {chartKicker(selected.kind, selected.rank)}
                  </p>
                  <h2 className="mt-0.5 truncate text-[16px] font-semibold text-ink">
                    {selected.name}
                  </h2>
                  <p className="truncate text-[12px] text-muted">{selected.loc}</p>
                  <p className="mt-1 text-[12px] text-muted2">
                    {selected.change} vs {year - 1}
                    {selected.approx ? " · approximate pin" : ""}
                    {selected.setCount
                      ? ` · ${selected.setCount} sets`
                      : " · no sets yet"}
                  </p>
                  {selected.href ? (
                    <Link
                      href={selected.href}
                      className="mt-2 inline-block text-[12px] text-brand hover:text-brandstrong"
                    >
                      Open event →
                    </Link>
                  ) : (
                    <p className="mt-2 text-[12px] text-muted2">
                      Not in the catalog yet — appears after a deep ingest.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
