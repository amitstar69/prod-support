
import { HelpRequest } from './helpRequest';

// Base interface for shared ticket category properties
interface BaseTicketCategories {
  completedTickets: HelpRequest[];
}

export interface ClientTicketCategories extends BaseTicketCategories {
  activeTickets: HelpRequest[];
  pendingApprovalTickets: HelpRequest[];
  inProgressTickets: HelpRequest[];
}

export interface DeveloperTicketCategories extends BaseTicketCategories {
  openTickets: HelpRequest[];
  myTickets: HelpRequest[];
  activeTickets: HelpRequest[];
}

export type TicketCategories = ClientTicketCategories | DeveloperTicketCategories;

// Type guard to check if the categories are client categories
export const isClientCategories = (
  categories: TicketCategories
): categories is ClientTicketCategories => {
  return 'pendingApprovalTickets' in categories && 'inProgressTickets' in categories;
};

// Type guard to check if the categories are developer categories
export const isDeveloperCategories = (
  categories: TicketCategories
): categories is DeveloperTicketCategories => {
  return 'openTickets' in categories && 'myTickets' in categories;
};
