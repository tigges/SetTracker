import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BrandMark } from "@/components/BrandMark";
import { GlobalSearch } from "@/components/GlobalSearch";
import { SiteNav } from "@/components/SiteNav";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
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
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-panel focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-5 sm:gap-6">
            <BrandMark />
            <SiteNav />
            <div className="ml-auto flex flex-none items-center gap-2 sm:gap-3">
              <GlobalSearch />
            </div>
          </div>
        </header>

        <main id="main" className="mx-auto max-w-6xl px-5 py-8">
          {children}
        </main>

        <footer className="mx-auto max-w-6xl px-5 pb-10 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-5 text-[12px] text-muted2">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>
                {SITE_NAME} · {SITE_TAGLINE}
              </span>
              <span aria-hidden="true">·</span>
              <Link href="/about" className="underline decoration-dotted underline-offset-2 hover:text-ink">
                About
              </Link>
              <Link href="/atlas" className="underline decoration-dotted underline-offset-2 hover:text-ink">
                Atlas
              </Link>
              <Link href="/stats" className="underline decoration-dotted underline-offset-2 hover:text-ink">
                Stats
              </Link>
              <Link href="/search" className="underline decoration-dotted underline-offset-2 hover:text-ink">
                Search
              </Link>
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
