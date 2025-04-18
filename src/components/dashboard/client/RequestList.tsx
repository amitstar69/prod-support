
import React from 'react';
import { HelpRequest } from '../../../types/helpRequest';
import RequestCard from './RequestCard';
import { Notification } from '../../../integrations/supabase/notifications';
import { Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';

interface RequestListProps {
  requests: HelpRequest[];
  isLoading: boolean;
  viewMode: 'grid' | 'list';
  requestMatches: Record<string, any[]>;
  applicationNotifications: Notification[];
  selectedApplications: any[];
  onViewRequest: (requestId: string) => void;
  onEditRequest: (request: HelpRequest) => void;
  onViewHistory: (request: HelpRequest) => void;
  onCancelRequest: (request: HelpRequest) => void;
  onCreateRequest: () => void;
}

const RequestList: React.FC<RequestListProps> = ({
  requests,
  isLoading,
  viewMode,
  requestMatches,
  applicationNotifications,
  selectedApplications,
  onViewRequest,
  onEditRequest,
  onViewHistory,
  onCancelRequest,
  onCreateRequest
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading your requests...</span>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg border border-border/40 text-center">
        <div className="h-12 w-12 mx-auto text-muted-foreground mb-4">📋</div>
        <h3 className="text-xl font-medium mb-2">No active help requests</h3>
        <p className="text-muted-foreground mb-4">
          You don't have any active help requests at the moment.
        </p>
        <Button onClick={onCreateRequest}>
          Create New Help Request
        </Button>
      </div>
    );
  }

  return (
    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : ''}>
      {requests.map((request) => (
        <RequestCard
          key={request.id}
          request={request}
          applicationCount={requestMatches[request.id!]?.length || 0}
          hasNewApplications={applicationNotifications.some(n => {
            const appData = selectedApplications.find(app => app.id === n.related_entity_id);
            return appData && appData.request_id === request.id;
          })}
          onViewRequest={onViewRequest}
          onEditRequest={onEditRequest}
          onViewHistory={onViewHistory}
          onCancelRequest={onCancelRequest}
        />
      ))}
    </div>
  );
};

export default RequestList;
