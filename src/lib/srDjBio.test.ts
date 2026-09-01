import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { linkifyBioText, quotedTitles, srDjBio } from "./srDjBio";

describe("srDjBio", () => {
  it("leads with Best known for and links catalog names", () => {
    const stored =
      "Bringing techno to the mainstage. Charlotte de Witte seemingly reached the techno stratosphere in 2025. At Tomorrowland in July, she became the first artist ever to open and close the MainStage on the same day. Debut LP on KNTXT.";
    const catalog = [
      { kind: "event" as const, slug: "tomorrowland", name: "Tomorrowland" },
      { kind: "label" as const, slug: "kntxt", name: "KNTXT" },
      { kind: "dj" as const, slug: "charlotte-de-witte", name: "Charlotte de Witte" },
    ];
    const out = srDjBio(stored, catalog, { skipSlugs: ["charlotte-de-witte"] });
    assert.ok(out);
    assert.match(out.parts.map((p) => p.text).join(""), /^Bringing techno to the mainstage/);
    assert.ok(out.parts.some((p) => p.href === "/labels/kntxt"));
    const linked = linkifyBioText("Tomorrowland MainStage", catalog, {
      skipSlugs: ["charlotte-de-witte"],
    });
    assert.equal(linked[0]?.href, "/events/tomorrowland");
    assert.deepEqual(quotedTitles("the punchy ‘blackberries’ and ‘Lucky’"), [
      "blackberries",
      "Lucky",
    ]);
  });

  it("does not invent a second sentence when nothing names a catalog row", () => {
    const out = srDjBio(
      "Two Ibiza residencies and chart domination. He still makes music every single day.",
      [],
    );
    assert.ok(out);
    assert.equal(
      out.parts.map((p) => p.text).join(""),
      "Two Ibiza residencies and chart domination.",
    );
  });
});
