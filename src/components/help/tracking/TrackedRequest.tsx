
import React from 'react';
import { HelpRequest } from '../../../types/helpRequest';
import { ExternalLink } from 'lucide-react';

interface TrackedRequestProps {
  request: HelpRequest;
  statusColors: Record<string, string>;
  statusIcons: Record<string, JSX.Element>;
  statusLabels: Record<string, string>;
  formatDate: (dateString: string) => string;
  onViewDetails: (requestId: string) => void;
}

const TrackedRequest: React.FC<TrackedRequestProps> = ({
  request,
  statusColors,
  statusIcons,
  statusLabels,
  formatDate,
  onViewDetails,
}) => {
  return (
    <div
      key={request.id || `temp-${Math.random()}`}
      className="bg-white p-6 rounded-xl border border-border/40 hover:border-primary/40 transition-colors cursor-pointer"
      onClick={() => request.id && onViewDetails(request.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium">{request.title || 'Untitled Request'}</h3>
        <div className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${statusColors[request.status || 'pending']}`}>
          {statusIcons[request.status || 'pending']}
          <span>{statusLabels[request.status || 'pending']}</span>
        </div>
      </div>
      
      <p className="text-muted-foreground line-clamp-2 mb-3">{request.description || 'No description'}</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-3">
        <div>
          <span className="text-muted-foreground">Technical Area:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {request.technical_area && Array.isArray(request.technical_area) && request.technical_area.length > 0 ? (
              <>
                {request.technical_area.slice(0, 2).map((area, i) => (
                  <span key={i} className="bg-secondary/50 px-2 py-0.5 rounded text-xs">
                    {area}
                  </span>
                ))}
                {request.technical_area.length > 2 && (
                  <span className="bg-secondary/50 px-2 py-0.5 rounded text-xs">
                    +{request.technical_area.length - 2}
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs text-muted-foreground">Not specified</span>
            )}
          </div>
        </div>
        <div>
          <span className="text-muted-foreground">Budget:</span>
          <p>{request.budget_range || 'Not specified'}</p>
        </div>
        <div>
          <span className="text-muted-foreground">Created:</span>
          <p>{request.created_at ? formatDate(request.created_at) : 'N/A'}</p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            request.id && onViewDetails(request.id);
          }}
          className="text-primary flex items-center gap-1 text-sm hover:underline"
        >
          View Details <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};

export default TrackedRequest;
