import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { collectRelatedVideos, collectSimilarChannels } from "./client";

describe("collectRelatedVideos", () => {
  it("pulls compact + end-screen video ids and shelf labels", () => {
    const root = {
      contents: {
        secondaryResults: {
          secondaryResultsRenderer: {
            results: [
              {
                richShelfRenderer: {
                  title: { simpleText: "Fans also like" },
                  contents: [
                    {
                      compactVideoRenderer: {
                        videoId: "AAAAAAAAAAA",
                        title: { simpleText: "Artist Live Set" },
                        shortBylineText: { simpleText: "Artist" },
                      },
                    },
                  ],
                },
              },
              {
                compactVideoRenderer: {
                  videoId: "BBBBBBBBBBB",
                  title: { simpleText: "Other Mix" },
                },
              },
              {
                endScreenVideoRenderer: {
                  videoId: "CCCCCCCCCCC",
                  title: { simpleText: "Closer" },
                },
              },
            ],
          },
        },
      },
    };

    const related = collectRelatedVideos(root);
    assert.equal(related.length, 3);
    const fans = related.find((r) => r.videoId === "AAAAAAAAAAA");
    assert.ok(fans);
    assert.match(fans!.shelf || "", /fans also like/i);
    assert.equal(fans!.title, "Artist Live Set");
    assert.ok(related.some((r) => r.videoId === "BBBBBBBBBBB"));
    assert.ok(related.some((r) => r.videoId === "CCCCCCCCCCC"));
  });

  it("captures spotlight shelf videos", () => {
    const root = {
      shelf: {
        title: { runs: [{ text: "Spotlight" }] },
        content: {
          gridVideoRenderer: {
            videoId: "SPOTLIGHT01",
            title: { simpleText: "Festival Mainstage" },
          },
        },
      },
    };
    const related = collectRelatedVideos(root);
    assert.equal(related.length, 1);
    assert.equal(related[0].videoId, "SPOTLIGHT01");
    assert.match(related[0].shelf || "", /spotlight/i);
  });
});

describe("collectSimilarChannels", () => {
  it("extracts @handles under Fans also like", () => {
    const root = {
      section: {
        title: { simpleText: "Fans also like" },
        items: [
          {
            channelRenderer: {
              title: { simpleText: "Neon Steve" },
              navigationEndpoint: {
                browseEndpoint: { canonicalBaseUrl: "/@NeonSteve" },
              },
            },
          },
          {
            gridChannelRenderer: {
              title: { simpleText: "AC Slater" },
              navigationEndpoint: {
                commandMetadata: {
                  webCommandMetadata: {
                    url: "/@acslater",
                  },
                },
              },
            },
          },
        ],
      },
    };
    const channels = collectSimilarChannels(root);
    assert.equal(channels.length, 2);
    assert.ok(channels.some((c) => c.handle === "@NeonSteve"));
    assert.ok(channels.some((c) => c.handle === "@acslater"));
  });
});
