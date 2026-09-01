"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  buildSuggestDjIssue,
  isSuggestDjReady,
  matchCatalogDj,
  suggestDjSlug,
} from "@/lib/suggestDj";
import { toggleStoredWishlist } from "@/lib/wishlistStore";

export function SuggestDjButton({
  catalog,
  wishlisted,
}: {
  catalog: ReadonlyArray<{ slug: string; name: string }>;
  wishlisted: readonly string[];
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [soundcloud, setSoundcloud] = useState("");
  const [youtube, setYoutube] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState(false);

  const draft = { name, soundcloud, youtube, note };
  const ready = isSuggestDjReady(draft);
  const match = useMemo(
    () => matchCatalogDj(name, catalog),
    [name, catalog],
  );
  const onList = match ? wishlisted.includes(match.slug) : false;
  const issue = ready && !match ? buildSuggestDjIssue(draft) : null;

  async function copyBody() {
    if (!issue) return;
    try {
      await navigator.clipboard.writeText(issue.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function close() {
    setOpen(false);
    setCopied(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-md border border-line px-2.5 py-1 text-[12px] font-bold text-ink hover:border-brand hover:text-brand"
      >
        Suggest a DJ
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-label="Close DJ suggestion"
            onClick={close}
            className="fixed inset-0 z-40 cursor-default bg-bg/70"
          />
          <div className="fixed inset-x-3 bottom-3 z-50 rounded-lg border border-line bg-panel p-3 shadow-lg sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-72 sm:-translate-x-1/2 sm:-translate-y-1/2">
            <p className="mb-2 text-[12px] text-muted">
              Name someone we do not have a page for. Opens a GitHub issue —
              we verify a first-party handle before they land in the catalog.
            </p>
            <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-muted2">
              Name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-0.5 w-full rounded-md border border-line bg-bg px-2 py-1 text-[13px] text-ink outline-none focus:border-brand"
                placeholder="John Summit"
                autoComplete="off"
              />
            </label>
            {match ? (
              <div className="mb-2 rounded-md border border-line bg-bg px-2 py-2 text-[12px] text-muted">
                Already in the catalog:{" "}
                <Link
                  href={`/djs/${match.slug}`}
                  className="font-semibold text-ink underline decoration-dotted underline-offset-2 hover:text-brand"
                >
                  {match.name}
                </Link>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={onList}
                    onClick={() => toggleStoredWishlist(match.slug)}
                    className={`rounded-md border px-2 py-1 text-[11px] font-bold ${
                      onList
                        ? "cursor-default border-brand bg-brand/10 text-brand"
                        : "border-line text-ink hover:border-brand hover:text-brand"
                    }`}
                  >
                    {onList ? "On wishlist" : "Add to wishlist"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-muted2">
                  SoundCloud
                  <input
                    value={soundcloud}
                    onChange={(e) => setSoundcloud(e.target.value)}
                    className="mt-0.5 w-full rounded-md border border-line bg-bg px-2 py-1 text-[12px] text-ink outline-none focus:border-brand"
                    placeholder="https://soundcloud.com/…"
                  />
                </label>
                <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-muted2">
                  YouTube
                  <input
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    className="mt-0.5 w-full rounded-md border border-line bg-bg px-2 py-1 text-[12px] text-ink outline-none focus:border-brand"
                    placeholder="https://youtube.com/@…"
                  />
                </label>
                <label className="mb-2 block text-[10px] uppercase tracking-wider text-muted2">
                  Why / where they play
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="mt-0.5 w-full rounded-md border border-line bg-bg px-2 py-1 text-[12px] text-ink outline-none focus:border-brand"
                    placeholder="Optional"
                  />
                </label>
                <div className="flex flex-col gap-1.5">
                  <a
                    href={issue?.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-disabled={!issue}
                    className={`rounded-md px-2 py-1 text-center text-[11px] font-semibold ${
                      issue
                        ? "bg-brand text-bg hover:opacity-90"
                        : "pointer-events-none bg-linesoft text-muted2"
                    }`}
                    onClick={(e) => {
                      if (!issue) {
                        e.preventDefault();
                        return;
                      }
                      const slug = suggestDjSlug(name);
                      if (!wishlisted.includes(slug)) {
                        toggleStoredWishlist(slug);
                      }
                    }}
                  >
                    Send for review
                  </a>
                  <button
                    type="button"
                    disabled={!issue}
                    onClick={() => void copyBody()}
                    className={`rounded-md border border-line px-2 py-1 text-center text-[11px] ${
                      issue
                        ? "text-ink hover:border-brand"
                        : "cursor-not-allowed text-muted2"
                    }`}
                  >
                    {copied ? "Copied note" : "Copy note"}
                  </button>
                </div>
              </>
            )}
            <button
              type="button"
              className="mt-2 text-[10px] text-muted hover:text-ink"
              onClick={close}
            >
              Close
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
