import assert from "node:assert/strict";
import { extractOgImage } from "./ogImage";

const html = `
<html><head>
<meta property="og:image" content="https://ultramusicfestival.com/share.jpg" />
</head></html>`;
assert.equal(
  extractOgImage(html, "https://ultramusicfestival.com/"),
  "https://ultramusicfestival.com/share.jpg",
);

const rel = extractOgImage(
  `<meta content="/static/berghain/og-image.jpg" property="og:image">`,
  "https://www.berghain.berlin/en/",
);
assert.equal(rel, "https://www.berghain.berlin/static/berghain/og-image.jpg");

console.log("ogImage.test.ts ok");
