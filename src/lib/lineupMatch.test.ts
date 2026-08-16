import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  catalogArtistIndex,
  matchLineupName,
  nightMentionsDj,
} from "./lineupMatch";

describe("lineupMatch", () => {
  const catalog = catalogArtistIndex([
    { slug: "chase-status", name: "Chase & Status" },
    { slug: "alesso", name: "Alesso" },
  ]);

  it("links bill names that slug-match a catalog DJ", () => {
    assert.deepEqual(matchLineupName("Chase & Status", catalog), {
      name: "Chase & Status",
      slug: "chase-status",
    });
    assert.deepEqual(matchLineupName("ALESSO", catalog), {
      name: "ALESSO",
      slug: "alesso",
    });
    assert.deepEqual(matchLineupName("Unknown Guest", catalog), {
      name: "Unknown Guest",
      slug: null,
    });
  });

  it("matches upcoming nights to a DJ by slug or name", () => {
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
  });
});
