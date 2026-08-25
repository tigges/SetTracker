import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  classifySourceComment,
  collapseHostCommentTimes,
  extractQuotedTitle,
  isRadioTalkWindow,
  looksLikeLiveFestivalRadio,
  radioTalkRegions,
} from "./sourceComments";

describe("classifySourceComment", () => {
  it("keeps named lines and quoted shout-out titles", () => {
    assert.equal(classifySourceComment("Amelie Lens - Exhale"), "named");
    assert.equal(
      classifySourceComment(
        "Thank you for Supporting my Track 'Acid Is My Therapy' @kurairecords",
      ),
      "named",
    );
    assert.equal(extractQuotedTitle("Track 'Acid Is My Therapy'"), "Acid Is My Therapy");
  });

  it("keeps ID asks and drops chat", () => {
    assert.equal(classifySourceComment("What is this track! I fkn love it!"), "id-ask");
    assert.equal(classifySourceComment("id?"), "id-ask");
    assert.equal(classifySourceComment("Track id fakersssss!"), "id-ask");
    assert.equal(classifySourceComment("where's the Berlin set???"), "chat");
    assert.equal(classifySourceComment("Nein?"), "chat");
    assert.equal(
      classifySourceComment(
        "Is there a track listing for this set? The tunes are 🔥🔥🔥🔥",
      ),
      "chat",
    );
    assert.equal(classifySourceComment("Diabolical track!"), "chat");
  });
});

describe("collapseHostCommentTimes", () => {
  it("keeps the ID ask in a 12s pile-on", () => {
    const kept = collapseHostCommentTimes(
      [
        { timestamp: 792, body: "Nein?" },
        { timestamp: 804, body: "What is this track!" },
      ],
      (r) => classifySourceComment(r.body),
    );
    assert.equal(kept.length, 1);
    assert.equal(kept[0]!.body, "What is this track!");
  });
});

describe("radio talk windows", () => {
  it("treats weekly radio opens as talk and live-from-festival as a mix", () => {
    assert.equal(looksLikeLiveFestivalRadio("Exhale Radio 121 live from Tomorrowland"), true);
    assert.equal(looksLikeLiveFestivalRadio("Amelie Lens Radio Show 015"), false);
    assert.equal(
      isRadioTalkWindow(21, 3441, { type: "radio", title: "Amelie Lens Radio Show 015" }),
      true,
    );
    assert.equal(
      isRadioTalkWindow(21, 3600, {
        type: "radio",
        title: "Exhale Radio 121 live from Tomorrowland",
      }),
      false,
    );
    const weekly = radioTalkRegions(3441, {
      type: "radio",
      title: "Amelie Lens Radio Show 015",
    });
    assert.deepEqual(weekly, [
      { startSec: 0, endSec: 150 },
      { startSec: 3441 - 75, endSec: 3441 },
    ]);
    assert.deepEqual(
      radioTalkRegions(3600, {
        type: "radio",
        title: "Exhale Radio 121 live from Tomorrowland",
      }),
      [],
    );
  });
});
