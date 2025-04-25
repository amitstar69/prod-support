
import { HelpRequest } from './helpRequest';

export type ClientTicketCategories = {
  activeTickets: HelpRequest[];
  pendingApprovalTickets: HelpRequest[];
  inProgressTickets: HelpRequest[];
  completedTickets: HelpRequest[];
};

export type DeveloperTicketCategories = {
  openTickets: HelpRequest[];
  myTickets: HelpRequest[];
  completedTickets: HelpRequest[];
  activeTickets: HelpRequest[];
};

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
