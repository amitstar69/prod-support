
import React from 'react';

interface TicketSummaryProps {
  filteredCount: number;
  totalCount: number;
}

const TicketSummary: React.FC<TicketSummaryProps> = ({ 
  filteredCount, 
  totalCount 
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">
        Available Help Requests
      </h2>
      <div className="text-sm text-muted-foreground">
        Showing {filteredCount} of {totalCount} real help requests
      </div>
    </div>
  );
};

export default TicketSummary;
