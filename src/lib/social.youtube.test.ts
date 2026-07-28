import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { djSocialsFromKnown, youtubeChannelUrl } from "./social";

describe("youtubeChannelUrl", () => {
  it("builds channel URLs from handles and cleans share links", () => {
    assert.equal(
      youtubeChannelUrl("@Biscits"),
      "https://www.youtube.com/@Biscits",
    );
    assert.equal(
      youtubeChannelUrl("Biscits"),
      "https://www.youtube.com/@Biscits",
    );
    assert.equal(
      youtubeChannelUrl("https://youtube.com/@biscits?si=aeKGVpCUZL59_4xs"),
      "https://www.youtube.com/@biscits",
    );
    assert.equal(youtubeChannelUrl(""), null);
    assert.equal(youtubeChannelUrl("https://soundcloud.com/biscits"), null);
  });

  it("djSocialsFromKnown prefers youtube handle", () => {
    const s = djSocialsFromKnown({
      name: "Biscits",
      youtubeHandle: "@Biscits",
      socials: ["https://www.youtube.com/@Biscits"],
    });
    assert.equal(s.youtube, "https://www.youtube.com/@Biscits");
  });
});
