import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { parseIcsEvents } from "./ics";
import {
  parseAmnesiaHtml,
  parseBerghainHtml,
  parseBootshausHtml,
  parseDjticketsHtml,
  parseFabricHtml,
  parseJsonLdEvents,
  parsePachaHtml,
  parseSavayaHtml,
  parseVenueCalendarHtml,
  parseWarehouseProjectHtml,
} from "./parse";
import { VENUE_CALENDAR_SOURCES } from "./sources";

const FIX = join(
  process.cwd(),
  "src/lib/ingest/discovery/venueCalendars/fixtures",
);

function fixture(name: string): string {
  return readFileSync(join(FIX, name), "utf8");
}

describe("venue calendar sources", () => {
  it("ships a seed file with nights for every source", () => {
    for (const src of VENUE_CALENDAR_SOURCES) {
      const raw = JSON.parse(
        readFileSync(
          join(process.cwd(), "data/venue-calendars", src.seedFile),
          "utf8",
        ),
      ) as { nights?: unknown[] };
      assert.ok(
        (raw.nights?.length ?? 0) > 0,
        `expected nights in ${src.seedFile}`,
      );
    }
  });

  it("covers the confirmed official calendars", () => {
    const slugs = VENUE_CALENDAR_SOURCES.map((s) => s.venueSlug);
    assert.deepEqual(slugs, [
      "unvrs",
      "hi-ibiza",
      "amnesia-ibiza",
      "savaya",
      "warehouse-project",
      "pacha-ibiza",
      "fabric",
      "illuzion-phuket",
      "bootshaus",
      "berghain",
      "ushuaia-ibiza",
      "eden",
    ]);
    assert.ok(
      VENUE_CALENDAR_SOURCES.every((s) => s.calendarUrl.startsWith("https://")),
    );
  });
});

describe("jsonld (UNVRS / Hï)", () => {
  it("reads UNVRS MusicEvent nights and performers", () => {
    const nights = parseJsonLdEvents(
      fixture("unvrs.html"),
      "https://www.unvrs.com/events-calendar",
    );
    assert.ok(nights.length >= 2);
    const cox = nights.find((n) => /carl cox/i.test(n.title));
    assert.equal(cox?.startsAt, "2026-08-16");
    assert.ok(cox?.artists.some((a) => /carl cox/i.test(a)));
    assert.match(cox?.sourceUrl ?? "", /unvrs\.com\/events/);
  });

  it("reads Hï Ibiza MusicEvent nights", () => {
    const nights = parseJsonLdEvents(
      fixture("hi-ibiza.html"),
      "https://www.hiibiza.com/events-calendar",
    );
    assert.ok(nights.length >= 2);
    const camel = nights.find((n) => /camelphat/i.test(n.title));
    assert.equal(camel?.startsAt, "2026-08-16");
    assert.ok(camel?.artists.some((a) => /camelphat/i.test(a)));
  });
});

describe("amnesia", () => {
  it("reads dated nights, rooms, and in-order lineups", () => {
    const nights = parseAmnesiaHtml(
      fixture("amnesia.html"),
      "https://www.amnesia.es/en/calendar/ibiza/2026/all",
      2026,
    );
    assert.ok(nights.length >= 2);
    const pyramid = nights.find((n) => n.title === "Pyramid");
    assert.equal(pyramid?.startsAt, "2026-08-16");
    assert.ok(pyramid?.artists.some((a) => /ricardo villalobos/i.test(a)));
    assert.ok(pyramid?.artists.some((a) => /raresh/i.test(a)));
    assert.ok(pyramid?.rooms?.some((r) => /terraza/i.test(r.name)));
    assert.match(pyramid?.ticketsUrl ?? "", /ticketing\.cm\.com/);
    const resistance = nights.find((n) => /resistance/i.test(n.title));
    assert.ok(resistance?.artists.some((a) => /artbat/i.test(a)));
  });
});

describe("savaya", () => {
  it("reads the dated grid title and ticket URL year", () => {
    const nights = parseSavayaHtml(
      fixture("savaya.html"),
      "https://www.savaya.com/event-calendar",
      2026,
    );
    assert.ok(nights.length >= 1);
    const snake = nights.find((n) => /snakehips/i.test(n.title));
    assert.equal(snake?.startsAt, "2026-08-16");
    assert.ok(snake?.artists.some((a) => /snakehips/i.test(a)));
  });
});

describe("warehouse project", () => {
  it("reads season nights, rooms, and Ticketmaster links", () => {
    const nights = parseWarehouseProjectHtml(
      fixture("warehouse-project.html"),
      "https://thewarehouseproject.com/calendar/",
      2026,
    );
    assert.ok(nights.length >= 2);
    const kiki = nights.find((n) => /ki\/ki/i.test(n.title));
    assert.equal(kiki?.startsAt, "2026-09-18");
    assert.ok(kiki?.rooms?.some((r) => /depot mayfield/i.test(r.name)));
    assert.match(kiki?.ticketsUrl ?? "", /ticketmaster/);
  });
});

describe("pacha", () => {
  it("reads escaped party JSON with start dates and artists", () => {
    const nights = parsePachaHtml(
      fixture("pacha.html"),
      "https://pacha.com/events",
    );
    assert.ok(nights.length >= 1);
    const solo = nights.find((n) => /solomun/i.test(n.title));
    assert.equal(solo?.startsAt, "2026-08-16");
    assert.ok(solo?.artists.some((a) => /solomun/i.test(a)));
    assert.ok(solo?.artists.some((a) => /gigola/i.test(a)));
  });
});

describe("fabric", () => {
  it("reads mix-date cards, billed artists, and RA tickets", () => {
    const nights = parseFabricHtml(
      fixture("fabric.html"),
      "https://fabriclondon.com/whats-on",
    );
    assert.ok(nights.length >= 1);
    const caya = nights.find((n) => /caya/i.test(n.title));
    assert.equal(caya?.startsAt, "2026-08-16");
    assert.ok(caya?.artists.some((a) => /wax material/i.test(a)));
    assert.match(caya?.ticketsUrl ?? "", /ra\.co/);
  });
});

describe("illuzion", () => {
  it("reads ICS vevents", () => {
    const nights = parseIcsEvents(
      fixture("illuzion.ics"),
      "https://www.illuzionphuket.com/events/",
    );
    assert.equal(nights.length, 2);
    assert.equal(nights[0]?.title, "SAM COLLINS");
    assert.equal(nights[0]?.startsAt, "2026-08-22");
    assert.match(nights[0]?.sourceUrl ?? "", /illuzionphuket\.com\/event/);
  });

  it("merges JSON-LD events from the listing page", () => {
    const src = VENUE_CALENDAR_SOURCES.find((s) => s.venueSlug === "illuzion-phuket")!;
    const nights = parseVenueCalendarHtml(src, fixture("illuzion.html"), {
      ics: fixture("illuzion.ics"),
    });
    assert.ok(nights.some((n) => /sam collins/i.test(n.title)));
    assert.ok(nights.some((n) => n.startsAt === "2026-08-22"));
  });
});

describe("bootshaus", () => {
  it("reads dated event-list cards", () => {
    const nights = parseBootshausHtml(
      fixture("bootshaus.html"),
      "https://bootshaus.tv/events",
      2026,
    );
    assert.ok(nights.length >= 2);
    const r3hab = nights.find((n) => /r3hab/i.test(n.title));
    assert.ok(r3hab);
    assert.match(r3hab?.sourceUrl ?? "", /bootshaus\.tv\/events/);
    const palma = nights.find((n) => /palma/i.test(n.title));
    assert.ok(palma);
  });
});

describe("berghain", () => {
  it("reads programme nights, rooms, and billed artists", () => {
    const nights = parseBerghainHtml(
      fixture("berghain.html"),
      "https://berghain.berlin/en/program/",
    );
    assert.ok(nights.length >= 2);
    const saule = nights.find((n) => /s[äa]ule/i.test(n.title));
    assert.equal(saule?.startsAt, "2026-08-20");
    assert.ok(saule?.artists.some((a) => /wave arising/i.test(a)));
    assert.ok(saule?.artists.some((a) => /marylou/i.test(a)));
    const reef = nights.find((n) => /reef/i.test(n.title));
    assert.ok(reef?.rooms?.some((r) => /berghain/i.test(r.name)));
    assert.ok(reef?.rooms?.some((r) => /panorama/i.test(r.name)));
    assert.ok(reef?.artists.some((a) => /alix perez/i.test(a)));
  });
});

describe("djtickets", () => {
  it("reads dated venue listing cards", () => {
    const nights = parseDjticketsHtml(
      fixture("djtickets.html"),
      "https://djtickets.com/venue/ushuaia-ibiza",
      2026,
    );
    assert.ok(nights.length >= 2);
    const shm = nights.find((n) => /swedish house mafia/i.test(n.title));
    assert.equal(shm?.startsAt, "2026-08-16");
    assert.ok(shm?.artists.some((a) => /swedish house mafia/i.test(a)));
    assert.match(shm?.sourceUrl ?? "", /djtickets\.com\/event\/swedish-house-mafia-5/);
    const cue = nights.find((n) => /cue week 8/i.test(n.title));
    assert.equal(cue?.startsAt, "2026-08-16");
    assert.match(cue?.sourceUrl ?? "", /djtickets\.com\/event\/cue-week-8/);
  });
});
