
import { HelpRequest } from '../../types/helpRequest';
import { Developer } from '../../types/product';
import { TicketWithScore, UseTicketRecommendationsResult } from './types';

export const useTicketRecommendations = (
  tickets: HelpRequest[],
  developer?: Developer | null
): UseTicketRecommendationsResult => {
  if (!tickets?.length) {
    return { 
      recommendedTickets: [], 
      availableTickets: [] 
    };
  }

  // Make a copy of the tickets to avoid mutating the original
  const availableTickets = [...tickets];

  // If no developer profile, just return all tickets as available
  if (!developer) {
    console.log('[useTicketRecommendations] No developer profile, returning all tickets as available');
    return {
      recommendedTickets: [],
      availableTickets
    };
  }

  console.log('[useTicketRecommendations] Processing tickets for recommendations');

  // Calculate match scores for each ticket based on developer profile
  const ticketsWithScores: TicketWithScore[] = availableTickets.map(ticket => {
    let matchScore = 0;
    const maxScore = 100;

    // Check if the developer has the skills required for this ticket
    if (developer.skills && ticket.technical_area) {
      // Convert developer skills to lowercase for case-insensitive matching
      const devSkills = developer.skills.map(skill => skill.toLowerCase());
      
      // Count matching skills
      const matchingSkills = ticket.technical_area.filter(area => 
        devSkills.some(skill => skill.includes(area.toLowerCase()) || 
                              area.toLowerCase().includes(skill))
      );
      
      // Calculate score based on matching skills percentage
      if (ticket.technical_area.length > 0) {
        matchScore += (matchingSkills.length / ticket.technical_area.length) * 70; // Skills are 70% of the score
      }
    }

    // Add additional factors to the match score
    
    // Complexity match (if developer is experienced, favor complex tickets)
    // Parse experience string to determine experience level
    const experienceString = developer.experience || '';
    const experienceYears = parseInt(experienceString.match(/\d+/)?.[0] || '0');
    
    if (experienceYears > 5 && ticket.complexity_level === 'high') {
      matchScore += 15;
    } else if (experienceYears < 2 && ticket.complexity_level === 'low') {
      matchScore += 10;
    }

    // Location preference match
    if (ticket.preferred_developer_location && 
        developer.location && 
        (ticket.preferred_developer_location === 'Global' || 
         ticket.preferred_developer_location === developer.location)) {
      matchScore += 15;
    }

    // Ensure score doesn't exceed maximum
    matchScore = Math.min(matchScore, maxScore);
    
    return {
      ...ticket,
      matchScore
    };
  });

  // Sort by match score (highest first)
  ticketsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  
  // Split into recommended (score > 40) and other available tickets
  const recommendedTickets = ticketsWithScores
    .filter(ticket => (ticket.matchScore || 0) >= 40);
    
  console.log(`[useTicketRecommendations] Found ${recommendedTickets.length} recommended tickets`);

  // Return both recommended and all available tickets
  return {
    recommendedTickets,
    availableTickets
  };
};
