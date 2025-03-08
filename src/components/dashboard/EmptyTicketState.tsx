
import React from 'react';
import { Button } from '../ui/button';

interface EmptyTicketStateProps {
  tickets: any[];
  isAuthenticated: boolean;
  onRefresh: () => void;
}

const EmptyTicketState: React.FC<EmptyTicketStateProps> = ({ 
  tickets,
  isAuthenticated,
  onRefresh
}) => {
  return (
    <div className="bg-white p-8 rounded-lg border border-border/40 text-center">
      <div className="h-12 w-12 mx-auto text-muted-foreground mb-4">📋</div>
      <h3 className="text-xl font-medium mb-2">No help requests found</h3>
      <p className="text-muted-foreground mb-4">
        {tickets.length > 0 
          ? "There are no tickets matching your current filters. Try adjusting your filters."
          : isAuthenticated 
            ? "There are no active help requests at the moment. Check back later."
            : "No help requests are available right now. Check back later or sign in to see more."}
      </p>
      <Button 
        onClick={onRefresh}
        className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
      >
        Refresh Requests
      </Button>
    </div>
  );
};

export default EmptyTicketState;
