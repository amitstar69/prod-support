
import React from 'react';
import { Button } from '../ui/button';
import { RefreshCw, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmptyTicketStateProps {
  tickets: any[];
  isAuthenticated: boolean;
  onRefresh: () => void;
  dataSource?: string;
}

const EmptyTicketState: React.FC<EmptyTicketStateProps> = ({ 
  tickets,
  isAuthenticated,
  onRefresh,
  dataSource = 'database'
}) => {
  const navigate = useNavigate();
  
  if (dataSource === 'sample' && !isAuthenticated) {
    return (
      <div className="bg-white p-8 rounded-lg border border-border/40 text-center">
        <div className="h-12 w-12 mx-auto text-muted-foreground mb-4">🎓</div>
        <h3 className="text-xl font-medium mb-2">No matching sample tickets</h3>
        <p className="text-muted-foreground mb-6">
          {tickets.length > 0 
            ? "There are no sample tickets matching your current filters. Try adjusting your filters."
            : "No sample tickets available with the current filters."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={onRefresh}
            variant="outline"
            className="px-4 py-2 text-sm rounded-md transition-colors flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset Filters
          </Button>
          <Button 
            onClick={() => navigate('/login', { state: { returnTo: '/developer-dashboard' } })}
            className="px-4 py-2 text-sm rounded-md transition-colors flex items-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            Sign In to See Real Tickets
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-8 rounded-lg border border-border/40 text-center">
      <div className="h-12 w-12 mx-auto text-muted-foreground mb-4">📋</div>
      <h3 className="text-xl font-medium mb-2">No help requests found</h3>
      <p className="text-muted-foreground mb-4">
        {tickets.length > 0 
          ? "There are no tickets matching your current filters. Try adjusting your filters."
          : isAuthenticated 
            ? "There are no active help requests in the database at the moment. Check back later."
            : "No tickets found. Sign in to see real help requests."}
      </p>
      <Button 
        onClick={onRefresh}
        variant="outline"
        className="px-4 py-2 text-sm rounded-md transition-colors flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Refresh Requests
      </Button>
    </div>
  );
};

export default EmptyTicketState;
