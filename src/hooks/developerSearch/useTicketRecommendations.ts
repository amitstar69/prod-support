
import { useState, useEffect, useCallback } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { Developer } from '../../types/product';
import { HELP_REQUEST_STATUSES } from '../../utils/constants/statusConstants';

const calculateMatchScore = (ticket: HelpRequest, developerProfile: Developer): number => {
  let score = 0;
  const maxScore = 100;

  // Match technical areas with developer skills
  if (ticket.technical_area && developerProfile.skills) {
    const matchingSkills = ticket.technical_area.filter(area => 
      developerProfile.skills?.includes(area)
    );
    score += (matchingSkills.length / ticket.technical_area.length) * 40; // Skills worth 40%
  }

  // Match experience level preferences
  if (ticket.preferred_developer_experience === developerProfile.experience ||
      ticket.preferred_developer_experience === 'any') {
    score += 30; // Experience match worth 30%
  }

  // Location preference match
  if (ticket.preferred_developer_location === 'Global' || 
      ticket.preferred_developer_location === developerProfile.location) {
    score += 20; // Location match worth 20%
  }

  // Availability match
  if (developerProfile.availability) {
    score += 10; // Availability worth 10%
  }

  return Math.min(Math.round(score), maxScore);
};

export const useTicketRecommendations = (
  tickets: HelpRequest[],
  developerProfile: Developer | null
) => {
  const [recommendedTickets, setRecommendedTickets] = useState<(HelpRequest & { matchScore: number })[]>([]);
  const [availableTickets, setAvailableTickets] = useState<HelpRequest[]>([]);

  const processTickets = useCallback(() => {
    if (!developerProfile || !tickets.length) {
      setRecommendedTickets([]);
      setAvailableTickets([]);
      return;
    }

    // Filter for only submitted/open tickets
    const openTickets = tickets.filter(ticket => 
      ticket.status === HELP_REQUEST_STATUSES.SUBMITTED ||
      ticket.status === HELP_REQUEST_STATUSES.OPEN
    );

    // Calculate match scores for all open tickets
    const scoredTickets = openTickets.map(ticket => ({
      ...ticket,
      matchScore: calculateMatchScore(ticket, developerProfile)
    }));

    // Sort by match score and split into recommended (>=70%) and available
    const recommended = scoredTickets
      .filter(ticket => ticket.matchScore >= 70)
      .sort((a, b) => b.matchScore - a.matchScore);

    const available = openTickets.filter(ticket =>
      !recommended.some(rec => rec.id === ticket.id)
    );

    setRecommendedTickets(recommended);
    setAvailableTickets(available);
  }, [tickets, developerProfile]);

  useEffect(() => {
    processTickets();
  }, [processTickets]);

  return {
    recommendedTickets,
    availableTickets,
  };
};
