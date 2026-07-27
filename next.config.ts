import type { NextConfig } from "next";

// When building for GitHub Pages we emit a fully static site under a project
// subpath (https://<user>.github.io/<repo>/). All data is build-time seed data,
// so a static export pre-renders every page. Local dev / `next start` are
// unaffected (this branch only activates when GITHUB_PAGES=true).
//
// Do not set `distDir` here — with `output: "export"`, Next 16 writes the
// static site into `distDir` when customized, which breaks the Pages upload
// path (`out/`). Default: build cache → `.next`, export → `out/`.
const isPages = process.env.GITHUB_PAGES === "true";
const repo = process.env.PAGES_BASE_PATH ?? "/SetTracker";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  // Inlined for client <img> src of root-relative public/ assets.
  env: {
    NEXT_PUBLIC_BASE_PATH: isPages ? repo : "",
  },
  ...(isPages
    ? {
        output: "export",
        basePath: repo,
        assetPrefix: `${repo}/`,
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
