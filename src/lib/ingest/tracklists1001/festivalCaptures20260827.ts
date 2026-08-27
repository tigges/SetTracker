import type { FingerprintSeedRow } from "../fingerprint/seeds";

/**
 * Joris Voorn @ Spectrum Radio 486 (Yard Stage, Balance Croatia Festival) 2026-08-10
 * https://www.1001tracklists.com/tracklist/17rlug81/joris-voorn-spectrum-radio-486-yard-stage-balance-croatia-festival-croatia-2026-08-10-2026-08-19.html
 * Wire: TRACKLIST_1001_BY_SOURCE_SLUG["yt-wlePVzVaMOY"]
 *       TRACKLIST_1001_BY_SOURCE_SLUG["sc-joris-voorn-spectrum-radio-486"]
 *
 * Three official hosts, all verified 200 on 2026-08-27:
 *   YouTube    https://youtu.be/wlePVzVaMOY — oEmbed channel "Spectrum"
 *              (@Spectrummusicnl), title "Spectrum Radio 486 Joris Voorn |
 *              Balance Croatia 2026"
 *   SoundCloud https://soundcloud.com/joris-voorn/spectrum-radio-486
 *   Mixcloud   .../JorisVoorn/joris-voorn-presents-spectrum-radio-486/
 * The paste wired the YouTube slug only. joris-voorn is not a curated
 * SoundCloud show or roster artist, so the SC slug shares this array so the
 * twin group keeps both hosts. Mixcloud stays a stored mirror in
 * SET_HOST_PINS — never a set slug.
 *
 * Billed as radio, recorded live at Balance Croatia's Yard Stage; type stays
 * "radio" with the event attached, as episode 485 does for Exit Brno.
 * Observed clocks: 18 cues over ~60min, gaps 104s–520s, longest near-uniform
 * run 2. Shares 2 tracks with episode 485 (Tomorrow remix, Matt Fax Blow);
 * 16 of 18 are unique, so these are distinct episodes.
 * Capture overlay used an invalid identifier (hyphens + space); constant renamed.
 * Captured 2026-08-27 — provenance 1001tl.
 */
export const TL_JORIS_VOORN_SPECTRUM_RADIO_486_BALANCE_CROATIA_2026: FingerprintSeedRow[] =
  [
    {
      at: "0:48",
      artist: "Joris Voorn",
      title: "Walk Thru Ruins (Melatonin Version)",
    },
    { at: "2:10", artist: "Nordfold", title: "Forever" },
    { at: "5:10", artist: "Luca Abayan", title: "Prisma" },
    { at: "8:40", artist: "Simon Vuarambon", title: "Stamina" },
    {
      at: "12:50",
      artist: "Joris Voorn",
      title: "Tomorrow (Sultan + Shepard Remix)",
    },
    { at: "17:35", artist: "Tali Muss & 84 Avenue", title: "Vortex" },
    { at: "20:50", artist: "AMTRAC", title: "Same Team" },
    { at: "29:30", artist: "Sideral", title: "Rhythmic Symphony" },
    { at: "32:50", artist: "Czerniak", title: "Teorema" },
    { at: "36:10", artist: "Marten Lou & Rivo", title: "Technicolor" },
    { at: "37:54", artist: "SRVD", title: "Elevate" },
    {
      at: "39:37",
      artist: "Ferry Corsten & Marsh",
      title: "Attraction (Marsh Remix)",
    },
    {
      at: "41:59",
      artist: "Etta James",
      title: "Something's Got A Hold On Me (Acappella)",
    },
    { at: "44:20", artist: "Mees Salomé & Robby East", title: "Mindstate" },
    { at: "48:08", artist: "Matt Fax", title: "Blow" },
    { at: "51:30", artist: "Fejká ft. Johanson", title: "Azur (Einmusik Remix)" },
    { at: "56:00", artist: "Solee", title: "Sternstunde (Joris Voorn Edit)" },
    {
      at: "59:30",
      artist: "Underground Sound Of Lisbon",
      title: "So Get Up (The End Of The Earth Acappella)",
    },
  ];
