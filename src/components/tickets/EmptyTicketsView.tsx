
import React from 'react';

interface EmptyTicketsViewProps {
  isApplication?: boolean;
  isRecommended?: boolean;
  customMessage?: string;
}

const EmptyTicketsView: React.FC<EmptyTicketsViewProps> = ({
  isApplication = false,
  isRecommended = false,
  customMessage
}) => {
  let message = customMessage;
  
  if (!message) {
    if (isApplication) {
      message = "You haven't applied to any tickets yet. Browse available tickets and start applying!";
    } else if (isRecommended) {
      message = "No recommended tickets found. We'll suggest tickets that match your skills as they become available.";
    } else {
      message = "There are no tickets matching your current filters. Try adjusting your filters or check back later.";
    }
  }

  return (
    <div className="bg-white p-8 rounded-lg border border-border/40 text-center">
      <div className="h-12 w-12 mx-auto text-muted-foreground mb-4">📋</div>
      <h3 className="text-xl font-medium mb-2">No tickets found</h3>
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};

export default EmptyTicketsView;
