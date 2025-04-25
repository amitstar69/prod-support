
import React from 'react';
import { getTicketStatusStyles } from '../../utils/ticketStatusUtils';
import { Badge } from '../ui/badge';
import { Star } from 'lucide-react';

interface TicketStatusProps {
  status: string;
  matchScore?: number;
}

const TicketStatus: React.FC<TicketStatusProps> = ({ status, matchScore }) => {
  return (
    <div className="flex items-center gap-2">
      <Badge className={getTicketStatusStyles(status)}>
        {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </Badge>
      
      {matchScore && matchScore >= 70 && (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 flex items-center gap-1">
          <Star className="h-3 w-3" />
          {matchScore}% Match
        </Badge>
      )}
    </div>
  );
};

export default TicketStatus;
