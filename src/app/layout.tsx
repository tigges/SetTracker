import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalSearch } from "@/components/GlobalSearch";
import { StatusLegend } from "@/components/StatusBits";
import { getSearchIndex } from "@/lib/searchIndex";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "setradar.ai — bass house set database",
  description:
    "setradar.ai — a database of bass house DJ sets: tracklists, IDs, provenance and source health.",
  applicationName: "setradar.ai",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const searchIndex = await getSearchIndex();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-5 sm:gap-6">
            <Link href="/" className="flex flex-none items-center gap-2">
              <span
                className="grid h-6 w-6 place-items-center rounded-[6px] text-[13px] font-black text-bg"
                style={{ background: "var(--brand-strong)" }}
              >
                R
              </span>
              <span className="text-[15px] font-extrabold tracking-tight">
                SET<span className="text-brand">RADAR</span>
                <span className="text-muted2">.ai</span>
              </span>
            </Link>
            <nav className="hidden items-center gap-1 text-[13px] md:flex">
              <Link
                href="/"
                className="rounded-md px-2.5 py-1.5 text-muted transition-colors hover:bg-panel hover:text-ink"
              >
                Sets
              </Link>
              <Link
                href="/djs"
                className="rounded-md px-2.5 py-1.5 text-muted transition-colors hover:bg-panel hover:text-ink"
              >
                DJs
              </Link>
              <Link
                href="/venues"
                className="rounded-md px-2.5 py-1.5 text-muted transition-colors hover:bg-panel hover:text-ink"
              >
                Venues
              </Link>
              <Link
                href="/labels"
                className="rounded-md px-2.5 py-1.5 text-muted transition-colors hover:bg-panel hover:text-ink"
              >
                Labels
              </Link>
              <Link
                href="/tracks"
                className="rounded-md px-2.5 py-1.5 text-muted transition-colors hover:bg-panel hover:text-ink"
              >
                Tracks
              </Link>
            </nav>
            <div className="ml-auto flex items-center gap-3">
              <GlobalSearch items={searchIndex} />
              <div className="hidden xl:block">
                <StatusLegend />
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>

        <footer className="mx-auto max-w-6xl px-5 pb-10 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-5 text-[12px] text-muted2">
            <span>
              setradar.ai · house set database · tracklists from SoundCloud,
              hearthis.at, YouTube + community IDs
            </span>
            <span className="mono text-[11px]" title="Build version">
              v{process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0"}
              {process.env.NEXT_PUBLIC_GIT_SHA
                ? ` · ${process.env.NEXT_PUBLIC_GIT_SHA.slice(0, 7)}`
                : ""}
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
