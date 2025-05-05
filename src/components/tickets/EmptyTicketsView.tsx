
import React from 'react';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

interface EmptyTicketsViewProps {
  customMessage?: string;
  onCreateNew?: () => void;
}

const EmptyTicketsView: React.FC<EmptyTicketsViewProps> = ({ 
  customMessage = "No tickets found",
  onCreateNew
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-border/30 text-center my-6">
      <div className="h-16 w-16 mx-auto text-muted-foreground mb-4 flex items-center justify-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="40" 
          height="40" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
          <line x1="16" x2="16" y1="2" y2="6"></line>
          <line x1="8" x2="8" y1="2" y2="6"></line>
          <line x1="3" x2="21" y1="10" y2="10"></line>
          <path d="M8 14h.01"></path>
          <path d="M12 14h.01"></path>
          <path d="M16 14h.01"></path>
          <path d="M8 18h.01"></path>
          <path d="M12 18h.01"></path>
          <path d="M16 18h.01"></path>
        </svg>
      </div>
      
      <h3 className="text-xl font-medium mb-2">No Tickets Available</h3>
      
      <p className="text-muted-foreground mb-6">
        {customMessage}
      </p>
      
      {onCreateNew && (
        <Button onClick={onCreateNew} className="gap-2">
          <Plus size={16} />
          Create New Help Request
        </Button>
      )}
    </div>
  );
};

export default EmptyTicketsView;
