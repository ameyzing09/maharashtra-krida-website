import { Timestamp } from "firebase/firestore";

export type ID = string;

export type Team = {
  id: ID;
  name: string;
  short?: string;
  logoUrl?: string;
  createdAt?: Timestamp | number;
  updatedAt?: Timestamp | number;
};

export type NewTeam = Omit<Team, "id">;

// Per-event overrides and metadata
export type EventTeam = {
  id: ID; // recommended format: `${eventId}__${teamId}` or auto id
  eventId: ID;
  teamId: ID;
  short?: string; // event-specific short code
  logoOverride?: string;
  seed?: number;
  group?: string;
};

export type NewEventTeam = Omit<EventTeam, "id">;

export type MatchStatus = "upcoming" | "live" | "completed" | "cancelled";

// Cricket
export type CricketTopBatter = { name: string; runs: number };
export type CricketBestBowler = { name: string; wickets: number; runsConceded?: number; overs?: number };
export type CricketSide = { runs: number; wickets: number; overs: number; topBatters?: CricketTopBatter[]; bestBowler?: CricketBestBowler };
export type CricketScore = { a: CricketSide; b: CricketSide; externalLiveUrl?: string };

// Football
export type FootballGoal = { minute: number; team: "A" | "B"; scorer: string; assist?: string };
export type FootballScore = { aGoals: number; bGoals: number; timeline?: FootballGoal[] };

// Volleyball
export type VolleyballSet = { a: number; b: number };
export type VolleyballScore = { sets: VolleyballSet[]; currentSet?: number };

// Others
export type OtherScore = { aScore?: number; bScore?: number; note?: string };

export type MatchScore =
  | { kind: "cricket"; data: CricketScore }
  | { kind: "football"; data: FootballScore }
  | { kind: "volleyball"; data: VolleyballScore }
  | { kind: "other"; data: OtherScore };

export type Match = {
  id: ID;
  eventId: ID;
  teamAId: ID;
  teamBId: ID;
  scheduledAt: number; // epoch ms for ordering
  venue?: string;
  status: MatchStatus;
  score?: MatchScore;
};

export type NewMatch = Omit<Match, "id">;

// Resolved team info for display
export type ResolvedTeam = {
  id: ID;
  name: string;
  short?: string;
  logoUrl?: string;
  seed?: number;
  group?: string;
};

export type ResolvedTeams = {
  teamA: ResolvedTeam;
  teamB: ResolvedTeam;
};

// Scorecard data for UI, derived from Match + Event + ResolvedTeams
export type ScoreCardBase = {
  matchId: ID;
  eventId: ID;
  tournamentTitle: string;
  scheduledAt: number;
  venue?: string;
  status: MatchStatus;
  teamA: ResolvedTeam;
  teamB: ResolvedTeam;
};

export type CricketScoreCard = ScoreCardBase & { kind: "cricket"; score?: CricketScore };
export type FootballScoreCard = ScoreCardBase & { kind: "football"; score?: FootballScore };
export type VolleyballScoreCard = ScoreCardBase & { kind: "volleyball"; score?: VolleyballScore };
export type OtherScoreCard = ScoreCardBase & { kind: "other"; score?: OtherScore };

export type ScoreCardData = CricketScoreCard | FootballScoreCard | VolleyballScoreCard | OtherScoreCard;

