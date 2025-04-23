
import React from 'react';

interface TicketSummaryProps {
  filteredCount: number;
  totalCount: number;
  dataSource?: string;
  categoryTitle?: string;
  isApplication?: boolean;
}

const TicketSummary: React.FC<TicketSummaryProps> = ({ 
  filteredCount, 
  totalCount,
  dataSource = 'database',
  categoryTitle = 'Available Help Requests',
  isApplication = false
}) => {
  // Ensure the displayed counts match the actual data
  const displayedFilteredCount = filteredCount || 0;
  const displayedTotalCount = totalCount || 0;

  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">
        {categoryTitle}
        {dataSource === 'sample' && !isApplication && (
          <span className="ml-2 text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
            Sample Data
          </span>
        )}
      </h2>
      <div className="text-sm text-muted-foreground">
        Showing {displayedFilteredCount} of {displayedTotalCount} {isApplication ? 'applications' : 'help requests'}
        {dataSource === 'sample' && !isApplication && (
          <span className="ml-1 text-amber-500">(sample tickets)</span>
        )}
        {dataSource === 'localStorage' && !isApplication && (
          <span className="ml-1 text-amber-500">(from local storage)</span>
        )}
      </div>
    </div>
  );
};

export default TicketSummary;
