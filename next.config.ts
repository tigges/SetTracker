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
        // Emit the static export to `out/` (also keeps it separate from `.next`,
        // so a running `next start`/dev server isn't disturbed by a Pages build).
        distDir: "out",
      }
    : {}),
};

export default nextConfig;
