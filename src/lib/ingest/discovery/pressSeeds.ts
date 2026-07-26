/**
 * Curated press / announcement URLs that surface new artists, collabs, and projects.
 * Prefer an explicit artists[] list — page HTML is a bonus, not required.
 */

export type PressSeed = {
  url: string;
  title: string;
  artists: string[];
  /** Optional project / alias names to also track */
  projects?: string[];
  weight?: number;
};

export const PRESS_SEEDS: PressSeed[] = [
  {
    url: "https://www.beatportal.com/articles/1412031-david-guetta-and-marten-horger-launch-men-machine-with-self-titled-ep",
    title: "David Guetta and Marten Horger launch Men Machine",
    artists: ["David Guetta", "Marten Horger"],
    projects: ["Men Machine"],
    weight: 48,
  },
];
