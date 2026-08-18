import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { inferFilmSeriesName } from "./filmSeries";

describe("inferFilmSeriesName", () => {
  it("clusters Pirate Ship films as a series", () => {
    assert.equal(
      inferFilmSeriesName(
        "Hot Since 82 - Live From A Pirate Ship in Ibiza 2025",
      ),
      "Pirate Ship",
    );
    assert.equal(
      inferFilmSeriesName("Hot Since 82 - Live From A Pirate Ship in Ibiza 2.0"),
      "Pirate Ship",
    );
  });

  it("leaves one-off album films and club sets unclustered", () => {
    assert.equal(
      inferFilmSeriesName("Hot Since 82 - Recovery (Hot Air Balloon Set)"),
      undefined,
    );
    assert.equal(
      inferFilmSeriesName(
        "Hot Since 82 b2b Ben Rau (Live from House of Koko, London)",
      ),
      undefined,
    );
  });
});
