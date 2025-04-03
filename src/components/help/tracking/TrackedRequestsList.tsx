
import React from 'react';
import { HelpRequest } from '../../../types/helpRequest';
import TrackedRequest from './TrackedRequest';

interface TrackedRequestsListProps {
  helpRequests: HelpRequest[];
  statusColors: Record<string, string>;
  statusIcons: Record<string, JSX.Element>;
  statusLabels: Record<string, string>;
  formatDate: (dateString: string) => string;
  onViewDetails: (requestId: string) => void;
}

const TrackedRequestsList: React.FC<TrackedRequestsListProps> = ({
  helpRequests,
  statusColors,
  statusIcons,
  statusLabels,
  formatDate,
  onViewDetails,
}) => {
  if (helpRequests.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-border/40 text-center">
        <h3 className="text-lg font-medium mb-2">No help requests yet</h3>
        <p className="text-muted-foreground mb-4">
          You haven't submitted any help requests. Create one to get assistance from our developers.
        </p>
        <button
          onClick={() => window.location.href = '/get-help'}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Create Your First Request
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {helpRequests.map((request) => (
        <TrackedRequest
          key={request.id || `temp-${Math.random()}`}
          request={request}
          statusColors={statusColors}
          statusIcons={statusIcons}
          statusLabels={statusLabels}
          formatDate={formatDate}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default TrackedRequestsList;
