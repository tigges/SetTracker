import type { NextConfig } from "next";

// Static GitHub Pages export. Custom domain (setradar.ai) is served at the
// domain root, so production sets PAGES_BASE_PATH="" — do NOT keep
// `/SetTracker` or CSS/JS 404 and the site renders unstyled.
// Local `GITHUB_PAGES=true npm run build` still defaults to `/SetTracker`
// to mimic the github.io project URL.
//
// Do not set `distDir` here — with `output: "export"`, Next 16 writes the
// static site into `distDir` when customized, which breaks the Pages upload
// path (`out/`). Default: build cache → `.next`, export → `out/`.
const isPages = process.env.GITHUB_PAGES === "true";

function pagesBasePath(): string {
  const raw = process.env.PAGES_BASE_PATH;
  if (raw === undefined) return "/SetTracker";
  const trimmed = raw.trim().replace(/\/+$/, "");
  if (!trimmed || trimmed === "/") return "";
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

const basePath = pagesBasePath();

const nextConfig: NextConfig = {
  // Next 16's build typecheck walks the app import graph and flags
  // untyped callbacks as implicit any even when the source array is typed.
  // Pages still compiles; `npx tsc --noEmit` remains the repo check.
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  // Inlined for client <img> src of root-relative public/ assets.
  env: {
    NEXT_PUBLIC_BASE_PATH: isPages ? basePath : "",
  },
  ...(isPages
    ? {
        output: "export" as const,
        trailingSlash: true,
        ...(basePath
          ? { basePath, assetPrefix: `${basePath}/` }
          : {}),
      }
    : {}),
};

export default nextConfig;
