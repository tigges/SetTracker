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
import { ATLAS_QUERY_EVENT } from "@/lib/atlas/searchItems";
import { WORLD_LAND_PATH } from "@/lib/atlas/worldLandPath";
import {
  atlasAccent,
  atlasCities,
  atlasClusterRadius,
  atlasCountries,
  atlasPinClass,
  atlasPinIdFromTarget,
  atlasPinsNear,
  atlasTapMoved,
  ATLAS_KINDS,
  chartKicker,
  filterAtlasPins,
  ATLAS_INITIAL_VIEW,
  atlasViewBox,
  flyToSpan,
  toggleAtlasKind,
  type AtlasFilter,
  type AtlasKind,
  type AtlasPin,
} from "@/lib/atlas/mapMath";

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

function subscribeSearch(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);
  return () => window.removeEventListener("popstate", onStoreChange);
}

function getSearchQ() {
  return new URLSearchParams(window.location.search).get("q") ?? "";
}

function getServerSearchQ() {
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

function placeLine(p: AtlasPin): string {
  const place = p.city ? `${p.city}, ${p.country}` : p.country;
  return p.setCount ? `${place} · ${p.setCount} sets` : place;
}

function cardMeta(p: AtlasPin): string {
  const rank = chartKicker(p.kind, p.rank, p.year);
  if (p.kind === "dj") {
    if (p.nomap && !p.setCount) return `${rank} · list only · no playback yet`;
    if (p.nomap) return `${rank} · list only`;
    const sets = p.setCount ? `${p.setCount} sets` : "no playback yet";
    return `${rank} · ${sets}`;
  }
  const yoy = p.change ? `${p.change} vs ${p.year - 1}` : null;
  const sets = p.setCount ? `${p.setCount} sets` : "no sets yet";
  return [rank, yoy, sets].filter(Boolean).join(" · ");
}

export function AtlasMap({
  pins,
}: {
  pins: AtlasPin[];
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const viewRef = useRef<View>({ ...ATLAS_INITIAL_VIEW });
  const flewHash = useRef(false);
  const hash = useSyncExternalStore(subscribeHash, getHash, getServerHash);
  const urlQ = useSyncExternalStore(subscribeSearch, getSearchQ, getServerSearchQ);
  const [filter, setFilter] = useState<AtlasFilter>({
    kinds: [...ATLAS_KINDS],
    q: "",
    country: "",
    city: "",
  });
  const [clickedId, setClickedId] = useState<string | null>(null);
  const [cluster, setCluster] = useState<AtlasPin[]>([]);
  const [listOpen, setListOpen] = useState(false);
  const selectByIdRef = useRef<(id: string) => void>(() => {});
  const clearSelectRef = useRef<() => void>(() => {});
  const skipFit = useRef(true);

  const activeFilter = {
    ...filter,
    q: filter.q || urlQ,
  };
  const hits = useMemo(
    () => filterAtlasPins(pins, { ...filter, q: filter.q || urlQ }),
    [pins, filter, urlQ],
  );
  const mappedHits = useMemo(() => hits.filter((p) => !p.nomap), [hits]);
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
      pinId: string | null;
      moved: boolean;
    } | null = null;

    function size() {
      const pane = svg!.parentElement ?? svg!;
      const r = pane.getBoundingClientRect();
      return { w: Math.max(1, r.width), h: Math.max(1, r.height) };
    }

    function applyView() {
      const { w, h } = size();
      const vb = atlasViewBox(view, w, h);
      view.span = vb[2];
      if (vb.every(Number.isFinite)) {
        svg!.setAttribute("viewBox", vb.map((n) => n.toFixed(2)).join(" "));
      }
      const r = Math.max(0.9, view.span * 0.0052);
      const hit = Math.max(r * 2.8, view.span * 0.012);
      svg!.querySelectorAll<SVGCircleElement>(".atlas-pin").forEach((c) => {
        c.setAttribute("r", r.toFixed(2));
      });
      svg!.querySelectorAll<SVGCircleElement>(".atlas-hit").forEach((c) => {
        c.setAttribute("r", hit.toFixed(2));
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
    if (svg.parentElement) ro.observe(svg.parentElement);

    function onDown(e: PointerEvent) {
      if (e.button !== 0) return;
      drag = {
        x: e.clientX,
        y: e.clientY,
        cx: view.cx,
        cy: view.cy,
        pinId: atlasPinIdFromTarget(e.target),
        moved: false,
      };
      svg!.setPointerCapture(e.pointerId);
      if (!drag.pinId) svg!.classList.add("cursor-grabbing");
    }
    function onMove(e: PointerEvent) {
      if (!drag) return;
      if (
        !drag.moved &&
        atlasTapMoved({ x: drag.x, y: drag.y }, { x: e.clientX, y: e.clientY })
      ) {
        drag.moved = true;
        svg!.classList.add("cursor-grabbing");
      }
      if (drag.pinId && !drag.moved) return;
      const { w } = size();
      const k = view.span / w;
      view.cx = drag.cx - (e.clientX - drag.x) * k;
      view.cy = drag.cy - (e.clientY - drag.y) * k;
      scheduleView();
    }
    function onUp() {
      if (drag?.pinId && !drag.moved) {
        selectByIdRef.current(drag.pinId);
      } else if (!drag?.pinId && !drag?.moved) {
        clearSelectRef.current();
      }
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
    function onQuery(e: Event) {
      const q = (e as CustomEvent<string>).detail ?? "";
      setFilter((f) => ({ ...f, q }));
    }
    window.addEventListener(ATLAS_QUERY_EVENT, onQuery);
    return () => window.removeEventListener(ATLAS_QUERY_EVENT, onQuery);
  }, []);

  useEffect(() => {
    if (flewHash.current || !hash) return;
    const match = pins.find((p) => pinMatchesHash(p, hash));
    if (!match) return;
    flewHash.current = true;
    if (!match.nomap) {
      flyToPin(
        svgRef.current as SvgWithView | null,
        viewRef.current,
        match,
        flyToSpan(match),
      );
    }
  }, [hash, pins]);

  useEffect(() => {
    if (!selectedId) return;
    const row = document.querySelector(
      `[data-atlas-row="${CSS.escape(selectedId)}"]`,
    );
    row?.scrollIntoView({ block: "nearest" });
  }, [selectedId, listOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") clearSelectRef.current();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function fitHits() {
    if (!mappedHits.length) return;
    const svg = svgRef.current;
    if (!svg) return;
    const xs = mappedHits.map((d) => d.x);
    const ys = mappedHits.map((d) => d.y);
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

  useEffect(() => {
    if (skipFit.current) {
      skipFit.current = false;
      return;
    }
    fitHits();
    // kinds/country/city are the layer + place filters we auto-frame.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.kinds, filter.country, filter.city]);

  function resetView() {
    Object.assign(viewRef.current, ATLAS_INITIAL_VIEW);
    (svgRef.current as SvgWithView | null)?.__applyView?.();
    setFilter((f) => ({ kinds: [...ATLAS_KINDS], q: f.q, country: "", city: "" }));
    setClickedId(null);
    setCluster([]);
    if (typeof window !== "undefined" && window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  }

  function zoomBy(factor: number) {
    const view = viewRef.current;
    view.span = Math.max(2.2, Math.min(1400, view.span * factor));
    (svgRef.current as SvgWithView | null)?.__applyView?.();
  }

  function clearSelection() {
    setClickedId(null);
    setCluster([]);
    if (typeof window !== "undefined" && window.location.hash) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
  }

  function selectPin(p: AtlasPin, opts?: { keepCluster?: boolean }) {
    setClickedId(p.id);
    if (!opts?.keepCluster) {
      const nearby = atlasPinsNear(
        mappedHits,
        p,
        atlasClusterRadius(viewRef.current.span),
      );
      setCluster(nearby.length > 1 ? nearby : []);
    }
    if (typeof window !== "undefined") {
      const next = `${window.location.pathname}${window.location.search}#${p.slug}`;
      history.replaceState(null, "", next);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
    if (!p.nomap) {
      flyToPin(
        svgRef.current as SvgWithView | null,
        viewRef.current,
        p,
        flyToSpan(p),
      );
    }
  }

  useEffect(() => {
    selectByIdRef.current = (id: string) => {
      const p = pins.find((row) => row.id === id);
      if (p) selectPin(p);
    };
    clearSelectRef.current = clearSelection;
  });

  function toggleKind(kind: AtlasKind) {
    setFilter((f) => ({
      ...f,
      kinds: toggleAtlasKind(f.kinds ?? [...ATLAS_KINDS], kind),
    }));
  }

  function setAllKinds() {
    setFilter((f) => ({ ...f, kinds: [...ATLAS_KINDS] }));
  }

  const listRows = hits
    .slice()
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        a.kind.localeCompare(b.kind) ||
        a.name.localeCompare(b.name),
    );

  return (
    <div className="atlas-bleed">
      <div className="hidden items-end justify-between gap-3 px-5 pb-3 pt-5 lg:flex">
        <div>
          <p className="eyebrow">DJ Mag reader polls</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
            Top 100 Atlas
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] text-muted">
            Clubs &amp; festivals 2026, DJs 2025 — search from the header.
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
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-block h-2.5 w-2.5 rounded-full bg-violet" />
            DJs
          </span>
        </div>
      </div>

      <div className="atlas-stage relative min-h-0 overflow-hidden bg-panel lg:mx-5 lg:mb-5 lg:grid lg:h-[min(70vh,720px)] lg:grid-cols-[minmax(240px,300px)_minmax(0,1fr)] lg:rounded-xl lg:border lg:border-line">
        <div className="relative order-1 h-[calc(100dvh-4rem)] min-h-[320px] overflow-hidden bg-[#07090d] lg:order-2 lg:h-full lg:min-h-0">
          <h1 className="pointer-events-none absolute top-3 left-1/2 z-10 -translate-x-1/2 text-[13px] font-semibold text-ink/90 lg:hidden">
            Top 100 Atlas
          </h1>
          <div className="absolute top-3 left-3 z-10 flex max-w-[min(100%-5.5rem,22rem)] flex-col gap-2">
            <button
              type="button"
              className="w-fit rounded-md border border-line bg-panel/90 px-2 py-1 text-[12px] text-muted lg:hidden"
              onClick={() => setListOpen((v) => !v)}
            >
              {listOpen ? "Hide ranks" : "Show ranks"}
            </button>
            <TypeBar
              kinds={filter.kinds ?? [...ATLAS_KINDS]}
              onToggle={toggleKind}
              onAll={setAllKinds}
            />
          </div>
          <div className="absolute top-3 right-3 z-10 grid gap-1.5">
            <button
              type="button"
              aria-label="Zoom in"
              onClick={() => zoomBy(1 / 1.6)}
              className="grid h-8 w-8 place-items-center rounded-md border border-line bg-panel/90 text-[16px] text-ink hover:bg-panel2"
            >
              +
            </button>
            <button
              type="button"
              aria-label="Zoom out"
              onClick={() => zoomBy(1.6)}
              className="grid h-8 w-8 place-items-center rounded-md border border-line bg-panel/90 text-[16px] text-ink hover:bg-panel2"
            >
              −
            </button>
          </div>
          <svg
            ref={svgRef}
            role="img"
            aria-label="Map of DJ Mag Top 100 clubs, festivals, and DJs"
            viewBox="50 80 900 560"
            preserveAspectRatio="xMidYMid slice"
            className="atlas-map absolute inset-0 h-full w-full cursor-grab touch-none"
          >
            <rect width="1000" height="1000" x="-200" y="-200" fill="#07090d" />
            <path d={WORLD_LAND_PATH} className="atlas-land" />
            {mappedHits.map((p) => (
              <g key={p.id} data-atlas-pin={p.id}>
                <circle
                  className="atlas-hit"
                  data-atlas-pin={p.id}
                  cx={p.x}
                  cy={p.y}
                  r={10}
                />
                <circle
                  className={`atlas-pin ${atlasPinClass(p.kind)}`}
                  cx={p.x}
                  cy={p.y}
                  r={4}
                  data-on={selectedId === p.id ? "true" : undefined}
                />
              </g>
            ))}
            {selected && mappedHits.some((h) => h.id === selected.id) ? (
              <circle
                className={`atlas-halo ${atlasPinClass(selected.kind)}`}
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
                  accent={atlasAccent(selected.kind)}
                  size={56}
                  radius={10}
                  monogram={
                    selected.name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase() ||
                    "#"
                  }
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="truncate text-[16px] font-semibold text-ink">
                      {selected.name}
                    </h2>
                    <button
                      type="button"
                      aria-label="Close pin"
                      onClick={clearSelection}
                      className="grid h-6 w-6 flex-none place-items-center rounded-md text-[14px] text-muted hover:bg-panel2 hover:text-ink"
                    >
                      ×
                    </button>
                  </div>
                  <p className="mt-0.5 text-[12px] text-muted">
                    {cardMeta(selected)}
                  </p>
                  {selected.loc ? (
                    <p className="truncate text-[12px] text-muted2">{selected.loc}</p>
                  ) : null}
                  {selected.href ? (
                    <Link
                      href={selected.href}
                      className="mt-2 inline-block text-[12px] text-brand hover:text-brandstrong"
                    >
                      {selected.kind === "dj" ? "Open DJ →" : "Open event →"}
                    </Link>
                  ) : (
                    <p className="mt-2 text-[12px] text-muted2">
                      Not in the catalog yet.
                    </p>
                  )}
                  {selected.kind === "dj" &&
                  (selected.instagram ||
                    selected.soundcloud ||
                    selected.youtube) ? (
                    <p className="mt-2 flex flex-wrap gap-2 text-[11px]">
                      {selected.instagram ? (
                        <a
                          href={selected.instagram}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted hover:text-ink"
                        >
                          Instagram
                        </a>
                      ) : null}
                      {selected.soundcloud ? (
                        <a
                          href={selected.soundcloud}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted hover:text-ink"
                        >
                          SoundCloud
                        </a>
                      ) : null}
                      {selected.youtube ? (
                        <a
                          href={selected.youtube}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted hover:text-ink"
                        >
                          YouTube
                        </a>
                      ) : null}
                    </p>
                  ) : null}
                  {cluster.length > 1 ? (
                    <ul className="mt-3 max-h-28 space-y-1 overflow-y-auto border-t border-line pt-2">
                      {cluster.map((p) => (
                        <li key={p.id}>
                          <button
                            type="button"
                            onClick={() => selectPin(p, { keepCluster: true })}
                            className={`block w-full truncate text-left text-[12px] ${
                              p.id === selected.id
                                ? "font-semibold text-ink"
                                : "text-muted hover:text-ink"
                            }`}
                          >
                            {p.name}
                            <span className="mono ml-1 text-[10px] text-muted2">
                              {chartKicker(p.kind, p.rank, p.year)}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <aside
          className={`z-20 flex min-h-0 flex-col border-line bg-panel lg:order-1 lg:h-full lg:border-r ${
            listOpen
              ? "absolute inset-x-0 bottom-0 max-h-[55dvh] rounded-t-xl border-t shadow-lg shadow-black/40 lg:static lg:max-h-full lg:rounded-none lg:border-t-0 lg:shadow-none"
              : "hidden lg:flex"
          }`}
        >
          <div className="grid gap-3 border-b border-line p-3">
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
              <strong className="mono font-medium text-ink">{hits.length}</strong>
              of {pins.length}
              {activeFilter.q ? (
                <span className="truncate text-muted2">· “{activeFilter.q}”</span>
              ) : null}
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
            {listRows.length === 0 ? (
              <p className="px-4 py-8 text-[13px] text-muted">
                No venues match those filters.
              </p>
            ) : (
              listRows.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  data-atlas-row={p.id}
                  data-on={selectedId === p.id ? "true" : undefined}
                  onClick={() => selectPin(p)}
                  className={`grid w-full grid-cols-[36px_1fr] items-center gap-2 border-l-2 px-3 py-2 text-left ${
                    selectedId === p.id
                      ? "border-[color:var(--pin)] bg-panel2"
                      : "border-transparent hover:bg-panel2"
                  }`}
                  style={
                    {
                      "--pin": atlasAccent(p.kind),
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
                      {placeLine(p)}
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
      </div>
    </div>
  );
}

function TypeBar({
  kinds,
  onToggle,
  onAll,
}: {
  kinds: AtlasKind[];
  onToggle: (kind: AtlasKind) => void;
  onAll: () => void;
}) {
  const allOn = ATLAS_KINDS.every((k) => kinds.includes(k));
  return (
    <div
      className="flex overflow-hidden rounded-lg border border-line bg-panel/90 shadow-sm shadow-black/30"
      role="group"
      aria-label="Map layers"
    >
      <button
        type="button"
        aria-pressed={allOn}
        onClick={onAll}
        className={`flex-1 px-1.5 py-1.5 text-[11px] font-medium ${
          allOn ? "bg-panel2 text-ink" : "text-muted hover:text-ink"
        }`}
      >
        All
      </button>
      {(
        [
          ["festival", "Fests", "bg-amber"],
          ["club", "Clubs", "bg-teal"],
          ["dj", "DJs", "bg-violet"],
        ] as const
      ).map(([value, label, swatch]) => (
        <button
          key={value}
          type="button"
          aria-pressed={kinds.includes(value)}
          onClick={() => onToggle(value)}
          className={`flex flex-1 items-center justify-center gap-1 px-1.5 py-1.5 text-[11px] font-medium ${
            kinds.includes(value) ? "bg-panel2 text-ink" : "text-muted hover:text-ink"
          }`}
        >
          <i className={`inline-block h-2 w-2 rounded-full ${swatch}`} />
          {label}
        </button>
      ))}
    </div>
  );
}
