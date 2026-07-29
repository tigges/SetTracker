import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BrandMark } from "@/components/BrandMark";
import { GlobalSearch } from "@/components/GlobalSearch";
import { SiteNav } from "@/components/SiteNav";
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
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5 sm:gap-6">
            <BrandMark />
            <SiteNav />
            <div className="ml-auto flex flex-none items-center gap-2 sm:gap-3">
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
