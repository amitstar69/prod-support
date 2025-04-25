
import { HelpRequest } from '../../types/helpRequest';

export interface TicketWithScore extends HelpRequest {
  matchScore?: number;
}

export interface UseTicketRecommendationsResult {
  recommendedTickets: TicketWithScore[];
  availableTickets: HelpRequest[];
}
