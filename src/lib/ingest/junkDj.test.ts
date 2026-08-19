import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { classifyJunkDj, inferJunkHostEvent } from "./junkDj";

describe("junkDj", () => {
  it("classifies stages, radios, shorts, and tutorials", () => {
    assert.equal(classifyJunkDj("Freedom Stage"), "stage");
    assert.equal(classifyJunkDj("Mainstage"), "stage");
    assert.equal(classifyJunkDj("One World Radio"), "radio");
    assert.equal(classifyJunkDj("Afro Inspirations Radio"), "radio");
    assert.equal(classifyJunkDj("DETUNED SESSIONS"), "radio");
    assert.equal(classifyJunkDj("Daybreak Sessions channel by One"), "radio");
    assert.equal(classifyJunkDj("One World Radio Shorts"), "nonset");
    assert.equal(classifyJunkDj("Mainstage Shorts"), "nonset");
    assert.equal(
      classifyJunkDj("Pegassi Makes A Trance Track From Scratch"),
      "nonset",
    );
    assert.equal(
      classifyJunkDj("Behind Cercle Odyssey I Chapter Four: Curtain"),
      "other",
    );
    assert.equal(classifyJunkDj("Live in Buenos Aires"), "other");
    assert.equal(classifyJunkDj("Rave UKraine"), "other");
    assert.equal(classifyJunkDj("Dom Dolla"), null);
    assert.equal(classifyJunkDj("Tape B"), null);
    assert.equal(classifyJunkDj("Tape B", "tape-b"), null);
    assert.equal(classifyJunkDj("House, Tech"), "other");
    assert.equal(classifyJunkDj("House, Tech & Minimal: 12.03.22"), "other");
    assert.equal(
      classifyJunkDj("House, Tech & Minimal: 12.03.22", "house-tech-minimal-12-03-22"),
      "other",
    );
    assert.equal(classifyJunkDj("Minimal"), "other");
    assert.equal(classifyJunkDj("Soweto Punk"), "other");
    assert.equal(classifyJunkDj("Soweto: Soweto Punk"), "other");
  });

  it("maps Freedom Stage and TML mainstage titles onto Tomorrowland", () => {
    assert.equal(inferJunkHostEvent("Freedom Stage")?.slug, "tomorrowland");
    assert.equal(
      inferJunkHostEvent("Mainstage", [
        "Artist | Mainstage Tomorrowland Weekend 2 Belgium",
      ])?.slug,
      "tomorrowland",
    );
    assert.equal(inferJunkHostEvent("Mainstage", ["Mainstage"])?.slug, undefined);
  });

  it("maps Cercle leftovers onto the Cercle event, not a DJ", () => {
    assert.equal(
      inferJunkHostEvent("Behind Cercle Odyssey I Chapter Four: Curtain")?.slug,
      "cercle",
    );
    assert.equal(
      inferJunkHostEvent("Behind Cercle Odyssey I Chapter Four: Curtain")
        ?.website,
      "https://www.cercle.io/",
    );
    assert.equal(inferJunkHostEvent("Live in Buenos Aires")?.slug, undefined);
  });

  it("maps radio hosts onto a radio / livestream event", () => {
    assert.equal(inferJunkHostEvent("One World Radio")?.slug, "one-world-radio");
    assert.equal(inferJunkHostEvent("One World Radio")?.kind, "radio");
    assert.equal(
      inferJunkHostEvent("Afro Inspirations Radio")?.kind,
      "radio",
    );
  });
});
