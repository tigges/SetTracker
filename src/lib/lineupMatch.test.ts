import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  catalogArtistIndex,
  lineupLookupKeys,
  matchLineupName,
  nightHeadliner,
  nightMentionsDj,
} from "./lineupMatch";

describe("lineupMatch", () => {
  const catalog = catalogArtistIndex([
    { slug: "chase-status", name: "Chase & Status", accent: "#fff" },
    { slug: "alesso", name: "Alesso" },
    {
      slug: "fisher",
      name: "FISHER",
      imageUrl: "https://example.com/fisher.jpg",
      accent: "#3dcea0",
    },
    { slug: "jamie-jones", name: "Jamie Jones" },
    { slug: "anyma", name: "Anyma" },
    { slug: "tiesto", name: "Tiësto" },
    { slug: "odd-mob", name: "Odd Mob" },
  ]);

  it("links bill names that slug-match a catalog DJ", () => {
    assert.deepEqual(matchLineupName("Chase & Status", catalog), {
      name: "Chase & Status",
      slug: "chase-status",
      imageUrl: null,
      accent: "#fff",
    });
    assert.deepEqual(matchLineupName("ALESSO", catalog), {
      name: "ALESSO",
      slug: "alesso",
      imageUrl: null,
      accent: null,
    });
    assert.deepEqual(matchLineupName("Unknown Guest", catalog), {
      name: "Unknown Guest",
      slug: null,
      imageUrl: null,
      accent: null,
    });
  });

  it("links ALL-CAPS catalog names like FISHER", () => {
    const hit = matchLineupName("FISHER", catalog);
    assert.equal(hit.slug, "fisher");
    assert.equal(hit.imageUrl, "https://example.com/fisher.jpg");
    assert.equal(hit.accent, "#3dcea0");
  });

  it("strips residency / presents titles to the billed DJ", () => {
    assert.equal(
      matchLineupName("Jamie Jones Presents Paradise", catalog).slug,
      "jamie-jones",
    );
    assert.equal(matchLineupName("Odd Mob Live", catalog).slug, "odd-mob");
    assert.ok(lineupLookupKeys("Jamie Jones Presents Paradise").includes("jamie-jones"));
  });

  it("folds diacritics and @-venue titles", () => {
    assert.equal(matchLineupName("Tiësto", catalog).slug, "tiesto");
    assert.equal(matchLineupName("ANYMA @ UNVRS", catalog).slug, "anyma");
  });

  it("picks the night title as headliner when it matches", () => {
    const artists = [
      matchLineupName("LUCIANO", catalog),
      matchLineupName("FISHER", catalog),
    ];
    const head = nightHeadliner("FISHER", artists, catalog);
    assert.equal(head?.slug, "fisher");
    assert.equal(head?.name, "FISHER");
  });

  it("matches upcoming nights to a DJ by slug, name, or title", () => {
    assert.equal(
      nightMentionsDj(["Chase & Status", "Netsky"], {
        slug: "chase-status",
        name: "Chase & Status",
      }),
      true,
    );
    assert.equal(
      nightMentionsDj(["Alesso"], { slug: "alesso", name: "Alesso" }),
      true,
    );
    assert.equal(
      nightMentionsDj(["Netsky"], { slug: "alesso", name: "Alesso" }),
      false,
    );
    assert.equal(
      nightMentionsDj(["LUCIANO"], { slug: "fisher", name: "FISHER" }, "FISHER"),
      true,
    );
    assert.equal(
      nightMentionsDj(
        ["GREEN VELVET"],
        { slug: "jamie-jones", name: "Jamie Jones" },
        "Jamie Jones Presents Paradise",
      ),
      true,
    );
  });
});
