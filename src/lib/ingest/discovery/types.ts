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
    | "manual";
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
