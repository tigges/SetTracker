/**
 * Curated press / announcement / tour-discovery URLs that surface artists.
 * Prefer an explicit artists[] list — page HTML is a bonus, not required.
 *
 * RA (ra.co) profiles are excellent **seeds** (artist + tour cohort signals)
 * but HTML fetch often 403s (DataDome). Mark those `skipFetch: true` and
 * rely on the artists[] list only — do not treat RA as a primary set crawl.
 */

export type PressSeed = {
  url: string;
  title: string;
  artists: string[];
  /** Optional project / alias names to also track */
  projects?: string[];
  weight?: number;
  /**
   * When true, do not GET the URL (DataDome / login walls).
   * Artists list is authoritative.
   */
  skipFetch?: boolean;
  /** Hint for logs / future evidence kinds */
  kind?: "press" | "tour" | "label";
};

export const PRESS_SEEDS: PressSeed[] = [
  {
    url: "https://www.beatportal.com/articles/1412031-david-guetta-and-marten-horger-launch-men-machine-with-self-titled-ep",
    title: "David Guetta and Marten Horger launch Men Machine",
    artists: ["David Guetta", "Marten Horger"],
    projects: ["Men Machine"],
    weight: 48,
    kind: "press",
  },

  // --- RA-style tour / profile seeds (discovery only; skip HTML) ---
  {
    url: "https://ra.co/dj/DavidGuetta/tour-dates",
    title: "David Guetta RA tour dates",
    artists: ["David Guetta"],
    weight: 34,
    skipFetch: true,
    kind: "tour",
  },
  {
    url: "https://ra.co/dj/FISHER/tour-dates",
    title: "FISHER RA tour dates",
    artists: ["FISHER"],
    weight: 36,
    skipFetch: true,
    kind: "tour",
  },
  {
    url: "https://ra.co/dj/Artbat/tour-dates",
    title: "ARTBAT RA tour dates",
    artists: ["ARTBAT"],
    weight: 36,
    skipFetch: true,
    kind: "tour",
  },
  {
    url: "https://ra.co/dj/Biscits/tour-dates",
    title: "BISCITS RA tour dates",
    artists: ["BISCITS"],
    weight: 36,
    skipFetch: true,
    kind: "tour",
  },
  {
    url: "https://ra.co/dj/JamesHype/tour-dates",
    title: "James Hype RA tour dates",
    artists: ["James Hype"],
    weight: 34,
    skipFetch: true,
    kind: "tour",
  },
  {
    url: "https://ra.co/dj/ChrisLake/tour-dates",
    title: "Chris Lake RA tour dates",
    artists: ["Chris Lake"],
    weight: 34,
    skipFetch: true,
    kind: "tour",
  },
  {
    url: "https://ra.co/dj/DomDolla/tour-dates",
    title: "Dom Dolla RA tour dates",
    artists: ["Dom Dolla"],
    weight: 34,
    skipFetch: true,
    kind: "tour",
  },
  {
    url: "https://ra.co/dj/VintageCulture/tour-dates",
    title: "Vintage Culture RA tour dates",
    artists: ["Vintage Culture"],
    weight: 32,
    skipFetch: true,
    kind: "tour",
  },
  {
    url: "https://ra.co/dj/Keinemusik/tour-dates",
    title: "Keinemusik RA tour dates",
    artists: ["Keinemusik"],
    weight: 32,
    skipFetch: true,
    kind: "tour",
  },
  {
    url: "https://ra.co/dj/BlackCoffee/tour-dates",
    title: "Black Coffee RA tour dates",
    artists: ["Black Coffee"],
    weight: 32,
    skipFetch: true,
    kind: "tour",
  },
  {
    url: "https://ra.co/dj/OliverHeldens/tour-dates",
    title: "Oliver Heldens RA tour dates",
    artists: ["Oliver Heldens"],
    weight: 32,
    skipFetch: true,
    kind: "tour",
  },
  {
    url: "https://ra.co/dj/korolova",
    title: "Korolova RA profile",
    artists: ["Korolova"],
    weight: 32,
    skipFetch: true,
    kind: "tour",
  },
  {
    url: "https://ra.co/dj/quintino",
    title: "Quintino RA profile",
    artists: ["Quintino"],
    weight: 32,
    skipFetch: true,
    kind: "tour",
  },
];
