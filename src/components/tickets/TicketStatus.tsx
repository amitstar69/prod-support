
import React from 'react';
import { cn } from '../../lib/utils';

interface TicketStatusProps {
  status: string;
  className?: string;
}

const TicketStatus: React.FC<TicketStatusProps> = ({ status, className }) => {
  // Normalize the status by replacing hyphens with underscores
  const normalizedStatus = status.replace(/-/g, '_').toLowerCase();
  
  return (
    <span className={cn(
      'ticket-status',
      `status-${normalizedStatus}`,
      className
    )}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

export default TicketStatus;
