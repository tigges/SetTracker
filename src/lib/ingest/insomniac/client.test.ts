import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  mixcloudUrlFromHtml,
  publishedAtFromInsomniacHtml,
  youtubeWatchFromHtml,
} from "./client";

const DON_DIABLO_FIXTURE = `
<meta property="og:title" content="Don Diablo Brings All of the Feels on EDC Orlando 2018 Mix | Insomniac">
<meta property="og:image" content="https://d3vhc53cl8e8km.cloudfront.net/hello-staging/wp-content/uploads/2018/11/07224835/edcorlando2018_dondiablomix_1200.jpg"/>
<div class="page-header__meta">
  <span>Nov 07, 2018</span><span>Scott T. Sterling</span>
</div>
<div class="music-embed">
  <iframe data-lazy-src="https://www.mixcloud.com/widget/iframe/?hide_cover=1&#038;light=1&#038;feed=%2Finsomniacevents%2Fdon-diablo-edc-orlando-2018-mix%2F"></iframe>
</div>
<iframe src="https://www.youtube.com/embed/{{data.youtubeId}}?playsinline=1"></iframe>
<!--<iframe src="https://www.youtube.com/embed/Y-9zm3QnW3I?playsinline=1"></iframe>-->
`;

describe("insomniac client extractors", () => {
  it("reads Mixcloud feed from lazy-loaded music-embed widgets", () => {
    assert.equal(
      mixcloudUrlFromHtml(DON_DIABLO_FIXTURE),
      "https://www.mixcloud.com/insomniacevents/don-diablo-edc-orlando-2018-mix/",
    );
  });

  it("parses page-header article dates when meta published_time is missing", () => {
    const d = publishedAtFromInsomniacHtml(DON_DIABLO_FIXTURE);
    assert.ok(d);
    assert.equal(d!.getUTCFullYear(), 2018);
    assert.equal(d!.getUTCMonth(), 10); // Nov
    assert.equal(d!.getUTCDate(), 7);
  });

  it("does not treat site-chrome / commented YouTube trailers as mix audio", () => {
    assert.equal(youtubeWatchFromHtml(DON_DIABLO_FIXTURE), null);
  });

  it("accepts YouTube only inside music-embed", () => {
    const html = `
      <div class="music-embed">
        <iframe src="https://www.youtube.com/embed/abcdefghijk"></iframe>
      </div>
      <!--<iframe src="https://www.youtube.com/embed/Y-9zm3QnW3I"></iframe>-->
    `;
    assert.equal(
      youtubeWatchFromHtml(html),
      "https://www.youtube.com/watch?v=abcdefghijk",
    );
  });
});
