import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { parseLivesetsListingHtml } from "./client";

const fixture = `
<div class="paragraph paragraph--type--youtube">
  <script type="application/ld+json">
  {
    "@type": "VideoObject",
    "name": "Shimza Live From Camden Roundhouse, London",
    "description": "Sold-out London show",
    "embedUrl": "https://youtube.com/embed/-HyyZo8sXgE",
    "uploadDate": "2026-02-18T14:48:13+00:00",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://djmag.com/watch/shimza-live-camden-roundhouse-london"
    }
  }
  </script>
  <lite-youtube videoid="-HyyZo8sXgE" playlabel="Shimza Live From Camden Roundhouse, London"></lite-youtube>
</div>
<div class="paragraph paragraph--type--youtube">
  <a href="/watch/deborah-de-luca-techno-set-pyramid-amnesia-ibiza">watch</a>
  <lite-youtube videoid="IfFnvi7O2Po" playlabel="Deborah De Luca Techno Set From Pyramid at Amnesia Ibiza"></lite-youtube>
</div>
<div class="paragraph paragraph--type--youtube">
  <lite-youtube videoid="LZ2nM5yj2Q4" playlabel="HoneyLuv B2B TSHA House Set Live From ANTS at Ushuaïa Ibiza"></lite-youtube>
</div>
`;

const parsed = parseLivesetsListingHtml(fixture);
assert.equal(parsed.length, 3);
assert.equal(parsed[0]?.videoId, "-HyyZo8sXgE");
assert.equal(
  parsed[0]?.watchUrl,
  "https://djmag.com/watch/shimza-live-camden-roundhouse-london",
);
assert.equal(parsed[0]?.uploadDate, "2026-02-18T14:48:13+00:00");
assert.equal(parsed[1]?.videoId, "IfFnvi7O2Po");
assert.match(parsed[1]!.watchUrl, /deborah-de-luca/);
assert.equal(parsed[2]?.videoId, "LZ2nM5yj2Q4");
assert.match(parsed[2]!.title, /HoneyLuv/i);

const livePath = "/tmp/djmag-livesets-full.html";
if (existsSync(livePath)) {
  const liveParsed = parseLivesetsListingHtml(readFileSync(livePath, "utf8"));
  assert.ok(
    liveParsed.length >= 15,
    `expected ≥15 livesets on listing, got ${liveParsed.length}`,
  );
  assert.ok(liveParsed.every((r) => r.videoId.length === 11));
  assert.ok(liveParsed.every((r) => r.watchUrl.includes("/watch/")));
  console.log("djmag/client.test.ts ok", liveParsed.length, "(live fixture)");
} else {
  console.log("djmag/client.test.ts ok", parsed.length, "(fixture)");
}
