
import React from 'react';

interface TicketSummaryProps {
  filteredCount: number;
  totalCount: number;
  dataSource?: string;
}

const TicketSummary: React.FC<TicketSummaryProps> = ({ 
  filteredCount, 
  totalCount,
  dataSource = 'database'
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">
        Available Help Requests
      </h2>
      <div className="text-sm text-muted-foreground">
        Showing {filteredCount} of {totalCount} help requests
        {dataSource === 'localStorage' && (
          <span className="ml-1 text-amber-500">(from local storage)</span>
        )}
      </div>
    </div>
  );
};

export default TicketSummary;
