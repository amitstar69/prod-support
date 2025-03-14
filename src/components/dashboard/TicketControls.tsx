
import React from 'react';
import { Button } from '../ui/button';
import { RotateCw, ArrowDown } from 'lucide-react';

interface TicketControlsProps {
  onForceRefresh: () => void;
  showLoadMore: boolean;
}

const TicketControls: React.FC<TicketControlsProps> = ({
  onForceRefresh,
  showLoadMore
}) => {
  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onForceRefresh}
          className="flex items-center gap-1"
        >
          <RotateCw className="h-4 w-4" />
          Force Refresh
        </Button>
      </div>

      {showLoadMore && (
        <div className="flex justify-center mt-6">
          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowDown className="h-4 w-4" />
            Show more
          </button>
        </div>
      )}
    </>
  );
};

export default TicketControls;
