import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StatusLegend } from "@/components/StatusBits";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SETGRAPH — bass house set database",
  description:
    "A database of bass house DJ sets: tracklists, IDs, provenance and source health.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-5">
            <Link href="/" className="flex items-center gap-2">
              <span
                className="grid h-6 w-6 place-items-center rounded-[6px] text-[13px] font-black text-bg"
                style={{ background: "var(--brand-strong)" }}
              >
                S
              </span>
              <span className="text-[15px] font-extrabold tracking-tight">
                SET<span className="text-brand">GRAPH</span>
              </span>
            </Link>
            <nav className="flex items-center gap-1 text-[13px]">
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
            </nav>
            <div className="ml-auto hidden lg:block">
              <StatusLegend />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>

        <footer className="mx-auto max-w-6xl px-5 pb-10 pt-4">
          <div className="border-t border-line pt-5 text-[12px] text-muted2">
            SETGRAPH · bass house set database (MVP) · seeded with mock data
          </div>
        </footer>
      </body>
    </html>
  );
}
