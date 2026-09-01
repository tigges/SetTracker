import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  compareTrackChart,
  isChartJunkTrack,
  isTrackChartRow,
  rankTrackChart,
  type TrackChartAgg,
} from "./trackChart";

function row(partial: Partial<TrackChartAgg> & { trackId: string }): TrackChartAgg {
  return {
    playCount: 0,
    setCount: 0,
    djCount: 0,
    eventCount: 0,
    ...partial,
  };
}

describe("trackChart", () => {
  it("drops a radio ident that only one DJ mixed", () => {
    assert.equal(
      isTrackChartRow(
        row({
          trackId: "connect",
          playCount: 30,
          setCount: 30,
          djCount: 1,
          eventCount: 0,
        }),
      ),
      false,
    );
    assert.equal(
      isTrackChartRow(row({ trackId: "anthem", djCount: 2, setCount: 2 })),
      true,
    );
  });

  it("ranks spread DJs ahead of one host with more logged plays", () => {
    const ident = row({
      trackId: "connect",
      playCount: 30,
      setCount: 30,
      djCount: 1,
      eventCount: 0,
    });
    const crossing = row({
      trackId: "control",
      playCount: 8,
      setCount: 8,
      djCount: 6,
      eventCount: 4,
    });
    const twoDjs = row({
      trackId: "thin-cross",
      playCount: 40,
      setCount: 40,
      djCount: 2,
      eventCount: 1,
    });
    const ranked = rankTrackChart([ident, twoDjs, crossing], 10);
    assert.deepEqual(
      ranked.map((r) => r.trackId),
      ["control", "thin-cross"],
    );
    assert.ok(compareTrackChart(crossing, twoDjs) < 0);
  });

  it("drops weakest 2-DJ rows first when the export cap is tight", () => {
    const strong = row({
      trackId: "spread",
      djCount: 5,
      eventCount: 4,
      setCount: 6,
      playCount: 6,
    });
    const mid = row({
      trackId: "club-circuit",
      djCount: 2,
      eventCount: 2,
      setCount: 4,
      playCount: 4,
    });
    const tail = row({
      trackId: "thin-cross",
      djCount: 2,
      eventCount: 1,
      setCount: 2,
      playCount: 2,
    });
    const ident = row({
      trackId: "radio-ident",
      djCount: 1,
      eventCount: 0,
      setCount: 40,
      playCount: 40,
    });
    const ranked = rankTrackChart([tail, ident, mid, strong], 2);
    assert.deepEqual(
      ranked.map((r) => r.trackId),
      ["spread", "club-circuit"],
    );
  });

  it("drops set intros and ID placeholders from the chart", () => {
    assert.equal(
      isChartJunkTrack("Live at Tomorrowland Brasil 2024 (Mixed) - Intro", "Armin van Buuren"),
      true,
    );
    assert.equal(isChartJunkTrack("ID (ID Remix)", "ID"), true);
    assert.equal(isChartJunkTrack("Intro", "Armin van Buuren"), true);
    assert.equal(isChartJunkTrack("Show Intro", "Natte Visstick"), true);
    assert.equal(isChartJunkTrack("Unknown track", "ID"), true);
    assert.equal(isChartJunkTrack("Connect (Intro Edit)", "Ferry Corsten"), false);
    assert.equal(isChartJunkTrack("Offshore (Axwell Intro Mix)", "Chicane"), false);
    assert.equal(isChartJunkTrack("Levels (Radio Edit)", "Avicii"), false);
    const intro = row({
      trackId: "tml-intro",
      title: "Live at Tomorrowland Brasil 2024 (Mixed) - Intro",
      artistName: "Armin van Buuren",
      djCount: 17,
      setCount: 17,
    });
    const id = row({
      trackId: "id-row",
      title: "ID (ID Remix)",
      artistName: "ID",
      djCount: 8,
      setCount: 8,
    });
    const song = row({
      trackId: "levels",
      title: "Levels (Radio Edit)",
      artistName: "Avicii",
      djCount: 10,
      setCount: 11,
    });
    assert.deepEqual(
      rankTrackChart([intro, id, song], 10).map((r) => r.trackId),
      ["levels"],
    );
  });

  it("breaks DJ ties with venues, then sets", () => {
    const moreVenues = row({
      trackId: "festivals",
      djCount: 3,
      eventCount: 3,
      setCount: 3,
      playCount: 3,
    });
    const oneVenue = row({
      trackId: "same-club",
      djCount: 3,
      eventCount: 1,
      setCount: 8,
      playCount: 8,
    });
    const ranked = rankTrackChart([oneVenue, moreVenues], 10);
    assert.equal(ranked[0]?.trackId, "festivals");
  });
});
