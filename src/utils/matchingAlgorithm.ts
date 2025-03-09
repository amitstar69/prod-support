
import { Developer } from "../types/product";
import { HelpRequest } from "../types/helpRequest";
import { 
  DeveloperMatch, 
  MATCH_SCORE_THRESHOLDS, 
  TicketPriority, 
  TicketPriorityScore, 
  TicketWithMatches 
} from "../types/matching";

/**
 * Calculate priority score for a ticket based on urgency, complexity, and budget
 */
export const calculateTicketPriority = (ticket: HelpRequest): TicketPriorityScore => {
  let priorityScore = 0;
  
  // Factor 1: Urgency
  if (ticket.urgency === 'critical') {
    priorityScore += 40;
  } else if (ticket.urgency === 'high') {
    priorityScore += 30;
  } else if (ticket.urgency === 'medium') {
    priorityScore += 20;
  } else {
    priorityScore += 10; // low urgency
  }
  
  // Factor 2: Complexity (based on estimated duration)
  if (ticket.estimated_duration >= 120) {
    priorityScore += 25; // Very complex (2+ hours)
  } else if (ticket.estimated_duration >= 60) {
    priorityScore += 20; // Complex (1-2 hours)
  } else if (ticket.estimated_duration >= 30) {
    priorityScore += 15; // Moderate (30-60 min)
  } else {
    priorityScore += 10; // Simple (less than 30 min)
  }
  
  // Factor 3: Budget (higher budget = higher priority)
  if (ticket.budget_range === '$500+') {
    priorityScore += 35;
  } else if (ticket.budget_range === '$200 - $500') {
    priorityScore += 25;
  } else if (ticket.budget_range === '$100 - $200') {
    priorityScore += 15;
  } else if (ticket.budget_range === '$50 - $100') {
    priorityScore += 10;
  } else {
    priorityScore += 5; // Under $50
  }
  
  // Determine priority level based on score
  let priorityLevel: TicketPriority;
  if (priorityScore >= 85) {
    priorityLevel = TicketPriority.CRITICAL;
  } else if (priorityScore >= 65) {
    priorityLevel = TicketPriority.HIGH;
  } else if (priorityScore >= 45) {
    priorityLevel = TicketPriority.MEDIUM;
  } else {
    priorityLevel = TicketPriority.LOW;
  }
  
  return {
    ticket,
    priorityScore,
    priorityLevel
  };
};

/**
 * Calculate the skill match percentage between a developer and a ticket
 */
const calculateSkillMatch = (developer: Developer, ticket: HelpRequest): {
  percentage: number;
  matchingSkills: string[];
} => {
  if (!developer.skills || !ticket.technical_area || 
      developer.skills.length === 0 || ticket.technical_area.length === 0) {
    return { percentage: 0, matchingSkills: [] };
  }
  
  // Convert to lowercase for case-insensitive matching
  const devSkills = developer.skills.map(skill => skill.toLowerCase());
  const ticketSkills = ticket.technical_area.map(area => area.toLowerCase());
  
  // Find matching skills
  const matchingSkills = devSkills.filter(skill => 
    ticketSkills.some(area => area.includes(skill) || skill.includes(area))
  );
  
  // Calculate percentage based on ticket requirements that are matched
  const matchedRequirements = ticketSkills.filter(area => 
    devSkills.some(skill => area.includes(skill) || skill.includes(area))
  );
  
  const percentage = Math.min(
    100,
    Math.round((matchedRequirements.length / ticketSkills.length) * 100)
  );
  
  return {
    percentage,
    matchingSkills: matchingSkills
  };
};

/**
 * Calculate a score for developer availability
 */
const calculateAvailabilityScore = (developer: Developer): number => {
  if (!developer.availability) {
    return 0;
  }
  
  // If the developer is online, they get a perfect score
  if (developer.online) {
    return 100;
  }
  
  // If they're not online but generally available, they get a good score
  if (developer.availability) {
    return 70;
  }
  
  // Developer is neither online nor marked as available
  return 30;
};

/**
 * Calculate a score based on developer rating
 */
const calculateRatingScore = (developer: Developer): number => {
  if (!developer.rating) {
    return 50; // Default mid-range score for no ratings
  }
  
  // Convert 0-5 rating scale to 0-100 score
  return Math.min(100, Math.round(developer.rating * 20));
};

/**
 * Match a developer to a ticket and calculate match score
 */
export const matchDeveloperToTicket = (developer: Developer, ticket: HelpRequest): DeveloperMatch => {
  // Calculate skill match
  const { percentage: skillMatchPercent, matchingSkills } = calculateSkillMatch(developer, ticket);
  
  // Calculate availability score
  const availabilityScore = calculateAvailabilityScore(developer);
  
  // Calculate rating score
  const ratingScore = calculateRatingScore(developer);
  
  // Weight factors and calculate overall match score
  const weights = {
    skillMatch: 0.5,      // 50% weighting to skill match
    availability: 0.3,    // 30% weighting to availability
    rating: 0.2           // 20% weighting to rating
  };
  
  const matchScore = Math.round(
    (skillMatchPercent * weights.skillMatch) +
    (availabilityScore * weights.availability) +
    (ratingScore * weights.rating)
  );
  
  // Generate reasons for match
  const matchReason: string[] = [];
  
  if (skillMatchPercent >= 75) {
    matchReason.push(`Strong skills match (${skillMatchPercent}%)`);
  } else if (skillMatchPercent >= 50) {
    matchReason.push(`Good skills match (${skillMatchPercent}%)`);
  } else if (skillMatchPercent > 0) {
    matchReason.push(`Partial skills match (${skillMatchPercent}%)`);
  } else {
    matchReason.push('No direct skills match');
  }
  
  if (matchingSkills.length > 0) {
    matchReason.push(`Matching skills: ${matchingSkills.join(', ')}`);
  }
  
  if (developer.online) {
    matchReason.push('Developer is currently online');
  } else if (developer.availability) {
    matchReason.push('Developer is generally available');
  }
  
  if (developer.rating && developer.rating >= 4.5) {
    matchReason.push(`Highly rated (${developer.rating}★)`);
  } else if (developer.rating && developer.rating >= 4.0) {
    matchReason.push(`Well rated (${developer.rating}★)`);
  }
  
  return {
    developer,
    matchScore,
    matchReason,
    skillMatchPercent,
    availabilityScore,
    ratingScore
  };
};

/**
 * Find and rank the best developer matches for a ticket
 */
export const findBestDeveloperMatches = (
  ticket: HelpRequest,
  developers: Developer[],
  expandSearch: boolean = false
): TicketWithMatches => {
  // Calculate ticket priority first
  const { priorityScore, priorityLevel } = calculateTicketPriority(ticket);
  
  // Calculate match score for each developer
  let developerMatches = developers.map(developer => 
    matchDeveloperToTicket(developer, ticket)
  );
  
  // Filter out poor matches unless expandSearch is true
  if (!expandSearch) {
    developerMatches = developerMatches.filter(match => 
      match.matchScore >= MATCH_SCORE_THRESHOLDS.FAIR
    );
  }
  
  // Sort by match score (highest first)
  developerMatches.sort((a, b) => b.matchScore - a.matchScore);
  
  return {
    ticket,
    priorityScore,
    priorityLevel,
    matches: developerMatches
  };
};

/**
 * Process multiple tickets and find best developer matches for each
 */
export const processBatchMatching = (
  tickets: HelpRequest[],
  developers: Developer[]
): TicketWithMatches[] => {
  // First prioritize all tickets
  const prioritizedTickets = tickets.map(calculateTicketPriority);
  
  // Sort tickets by priority score (highest first)
  prioritizedTickets.sort((a, b) => b.priorityScore - a.priorityScore);
  
  // Find matches for each ticket
  const ticketsWithMatches = prioritizedTickets.map(({ ticket, priorityScore, priorityLevel }) => {
    const matches = developers.map(developer => matchDeveloperToTicket(developer, ticket));
    
    // Filter out poor matches and sort by match score
    const goodMatches = matches
      .filter(match => match.matchScore >= MATCH_SCORE_THRESHOLDS.FAIR)
      .sort((a, b) => b.matchScore - a.matchScore);
    
    // If no good matches, expand search criteria
    const finalMatches = goodMatches.length > 0 
      ? goodMatches 
      : matches.sort((a, b) => b.matchScore - a.matchScore);
    
    return {
      ticket,
      priorityScore,
      priorityLevel,
      matches: finalMatches
    };
  });
  
  return ticketsWithMatches;
};
