
import React from 'react';
import { Loader2 } from 'lucide-react';
import StatusDropdown from '../developer-actions/StatusDropdown';
import { useStatusUpdate } from '../../hooks/help-request/useStatusUpdate';
import StatusUpdateError from './status/StatusUpdateError';
import StatusInfo from './status/StatusInfo';

interface DeveloperStatusUpdateProps {
  ticketId: string;
  currentStatus: string;
  onStatusUpdated: () => void;
  matchStatus?: string | null;
}

const DeveloperStatusUpdate: React.FC<DeveloperStatusUpdateProps> = ({
  ticketId,
  currentStatus,
  onStatusUpdated,
  matchStatus
}) => {
  const {
    isUpdating,
    error,
    handleUpdateStatus
  } = useStatusUpdate(ticketId, currentStatus, onStatusUpdated);

  if (!ticketId || !currentStatus) {
    return <div className="text-sm text-muted-foreground">Invalid ticket information</div>;
  }

  return (
    <div className="space-y-4">
      <StatusUpdateError error={error || ''} />

      <div className="space-y-4">
        <StatusDropdown
          defaultStatusId={currentStatus}
          onStatusChange={handleUpdateStatus}
          placeholder="Select new status"
          required={true}
          userType="developer"
          disabled={isUpdating}
        />

        {isUpdating && (
          <div className="flex items-center justify-center p-2">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span>Updating status...</span>
          </div>
        )}
      </div>

      <StatusInfo 
        currentStatus={currentStatus}
        matchStatus={matchStatus}
      />
    </div>
  );
};

export default DeveloperStatusUpdate;
