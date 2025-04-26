
export interface ClientTicketCategories {
  activeTickets: any[];
  pendingApprovalTickets: any[];
  inProgressTickets: any[];
  completedTickets: any[];
}

export interface DeveloperTicketCategories {
  openTickets: any[];
  myTickets: any[];
  activeTickets: any[];
  completedTickets: any[];
}

// Type guard to check if the categorized tickets are client ticket categories
export function isClientCategories(
  categories: any
): categories is ClientTicketCategories {
  return (
    categories &&
    'activeTickets' in categories &&
    'pendingApprovalTickets' in categories &&
    'inProgressTickets' in categories &&
    'completedTickets' in categories
  );
}

// Type guard to check if the categorized tickets are developer ticket categories
export function isDeveloperCategories(
  categories: any
): categories is DeveloperTicketCategories {
  return (
    categories &&
    'openTickets' in categories &&
    'myTickets' in categories &&
    'activeTickets' in categories &&
    'completedTickets' in categories
  );
}
