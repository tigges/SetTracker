export type CandidateStatus =
  | "queued"
  | "promoted"
  | "watching"
  | "rejected";

export type CandidateEvidence = {
  kind:
    | "set_collaborator"
    | "coplay"
    | "remixer"
    | "venue_title"
    | "tracklist_channel"
    | "manual"
    | "lineup"
    | "press"
    | "youtube_similar"
    | "youtube_spotlight";
  detail: string;
  sourceSlug?: string;
  weight: number;
};

export type ArtistCandidate = {
  name: string;
  slug: string;
  score: number;
  status: CandidateStatus;
  evidence: CandidateEvidence[];
  /** Optional resolved source hooks */
  youtubeHandle?: string;
  soundcloudPermalink?: string;
  bandcampUrl?: string;
  genre?: string;
  accent?: string;
  updatedAt: string;
  promotedAt?: string;
};

export type CandidateFile = {
  version: 1;
  updatedAt: string;
  candidates: ArtistCandidate[];
};

/** Soft graph edges for UI cross-links before shared sets exist. */
export type ArtistRelation = {
  a: string; // slug
  b: string; // slug
  reason: string;
  weight: number;
  source?: string;
};

export type RelationFile = {
  version: 1;
  updatedAt: string;
  relations: ArtistRelation[];
  /** venue slug → artist slugs seen on official lineups */
  venueArtists: Record<string, string[]>;
};
