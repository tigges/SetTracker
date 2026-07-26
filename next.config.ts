import type { NextConfig } from "next";

// When building for GitHub Pages we emit a fully static site under a project
// subpath (https://<user>.github.io/<repo>/). All data is build-time seed data,
// so a static export pre-renders every page. Local dev / `next start` are
// unaffected (this branch only activates when GITHUB_PAGES=true).
const isPages = process.env.GITHUB_PAGES === "true";
const repo = process.env.PAGES_BASE_PATH ?? "/SetTracker";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  ...(isPages
    ? {
        output: "export",
        basePath: repo,
        assetPrefix: `${repo}/`,
        trailingSlash: true,
        // Keep the Next build cache out of `out/` — static export always
        // writes the site into `out/`, and uploading `out/` to Pages must
        // only contain HTML/assets (not the build cache).
        distDir: ".next-pages",
      }
    : {}),
};

export default nextConfig;
