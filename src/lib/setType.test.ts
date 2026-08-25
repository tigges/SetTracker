import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  inferSetType,
  isLiveFocusSet,
  isLiveVenueSet,
  isLivestreamSet,
  isWeeklyRadioSet,
  rematchSetType,
} from "./setType";

describe("inferSetType", () => {
  it("keeps live-from-festival radio as a festival graph", () => {
    assert.equal(
      inferSetType({
        title: "Amelie Lens live from Tomorrowland 2026",
        hintedType: "radio",
      }),
      "festival",
    );
  });

  it("uses Event.kind for club and livestream rooms", () => {
    assert.equal(
      inferSetType({
        title: "Robin Schulz DJ Set live @Pacha, Ibiza",
        eventKind: "club",
        hintedType: "festival",
      }),
      "club",
    );
    assert.equal(
      inferSetType({
        title: "Charlotte de Witte | Boiler Room",
        eventKind: "livestream",
        hintedType: "festival",
      }),
      "livestream",
    );
  });

  it("does not treat a club mix studio upload as a club night", () => {
    assert.equal(
      inferSetType({
        title: "Best Club Mix 2026",
        playbackHost: "soundcloud",
      }),
      "soundcloud",
    );
  });

  it("reads named club rooms from the title", () => {
    assert.equal(
      inferSetType({
        title: "Meduza live at Club Space Miami",
        hintedType: "soundcloud",
      }),
      "club",
    );
  });

  it("labels weekly radio last", () => {
    assert.equal(
      inferSetType({
        title: "Amelie Lens Radio Show 015",
        hintedType: "radio",
      }),
      "radio",
    );
    assert.equal(
      inferSetType({
        title: "Group Therapy 690 with Above & Beyond",
        hintedType: "livestream",
        eventKind: "livestream",
      }),
      "radio",
    );
  });

  it("defaults DJ-channel lives to livestream when no room is named", () => {
    assert.equal(
      inferSetType({
        title: "James Hype Live in London",
        hintedType: "livestream",
        playbackHost: "youtube",
      }),
      "livestream",
    );
  });
});

describe("live focus helpers", () => {
  it("treats club and festival as live venues", () => {
    assert.equal(isLiveVenueSet({ type: "club" }), true);
    assert.equal(isLiveVenueSet({ eventKind: "club", type: "soundcloud" }), true);
    assert.equal(isLivestreamSet({ type: "livestream" }), true);
    assert.equal(isLiveFocusSet({ type: "livestream" }), true);
    assert.equal(
      isWeeklyRadioSet({ type: "radio", title: "Exhale Radio 121" }),
      true,
    );
    assert.equal(
      isWeeklyRadioSet({
        type: "radio",
        title: "Live from Tomorrowland",
      }),
      false,
    );
    assert.equal(
      isWeeklyRadioSet({
        type: "radio",
        eventKind: "livestream",
        title: "Group Therapy 690",
      }),
      true,
    );
    assert.equal(
      isLivestreamSet({
        type: "radio",
        eventKind: "livestream",
        title: "Group Therapy 690",
      }),
      false,
    );
  });
});

describe("rematchSetType", () => {
  it("promotes a festival-typed Pacha night to club", () => {
    assert.equal(
      rematchSetType(
        "festival",
        "Robin Schulz DJ Set live @Pacha, Ibiza",
        "club",
      ),
      "club",
    );
  });

  it("does not downgrade a festival to radio", () => {
    assert.equal(
      rematchSetType("festival", "Hardwell On Air at Ultra Miami", "festival"),
      null,
    );
  });
});
