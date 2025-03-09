
import { HelpRequest } from "./helpRequest";
import { Developer } from "./product";

// Score thresholds for matching
export const MATCH_SCORE_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 60,
  FAIR: 40,
  POOR: 20
};

// Priority levels for tickets
export enum TicketPriority {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low"
}

// Interface for ticket priority calculation
export interface TicketPriorityScore {
  ticket: HelpRequest;
  priorityScore: number;
  priorityLevel: TicketPriority;
}

// Interface for developer match result
export interface DeveloperMatch {
  developer: Developer;
  matchScore: number;
  matchReason: string[];
  skillMatchPercent: number;
  availabilityScore: number;
  responseTimeScore?: number;
  ratingScore: number;
}

// Interface for ticket with matched developers
export interface TicketWithMatches {
  ticket: HelpRequest;
  priorityScore: number;
  priorityLevel: TicketPriority;
  matches: DeveloperMatch[];
}
