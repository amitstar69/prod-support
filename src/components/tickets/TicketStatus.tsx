
import React from 'react';
import { cn } from '../../lib/utils';
import { getTicketStatusStyles, formatTicketStatus } from '../../utils/ticketStatusUtils';

interface TicketStatusProps {
  status: string;
  className?: string;
}

const TicketStatus: React.FC<TicketStatusProps> = ({ status, className }) => {
  // Normalize the status by replacing hyphens with underscores
  const normalizedStatus = status.replace(/-/g, '_').toLowerCase();
  
  // Get style classes from our utility function
  const statusStyles = getTicketStatusStyles(normalizedStatus);
  
  // Format the status for display
  const formattedStatus = formatTicketStatus(normalizedStatus);
  
  return (
    <span className={cn(statusStyles, className)}>
      {formattedStatus}
    </span>
  );
};

export default TicketStatus;
