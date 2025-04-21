
import { useState, useEffect } from 'react';
import { HelpRequest } from '../../types/helpRequest';

export const useRecommendedTickets = (tickets: HelpRequest[], isAuthenticated: boolean, userId: string | null) => {
  const [recommendedTickets, setRecommendedTickets] = useState<HelpRequest[]>([]);

  useEffect(() => {
    if (!tickets || !isAuthenticated || !userId) {
      setRecommendedTickets([]);
      return;
    }

    const recommended = tickets.filter(ticket =>
      ticket.status === 'open' || ticket.status === 'claimed'
    );
    setRecommendedTickets(recommended);
  }, [tickets, isAuthenticated, userId]);

  return recommendedTickets;
};
