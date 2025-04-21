
import React, { useState, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import StatusDropdown from '../developer-actions/StatusDropdown';
import { Button } from '../ui/button';
import { getAllowedStatusTransitions } from '../../utils/helpRequestStatusUtils';
import StatusUpdateError from './status/StatusUpdateError';
import StatusInfo from './status/StatusInfo';
import StatusQuickActions from './status/StatusQuickActions';
import { useClientStatusUpdate } from '../../hooks/help-request/useClientStatusUpdate';

interface ClientStatusUpdateProps {
  ticketId: string;
  currentStatus: string;
  onStatusUpdated: () => void;
}

const ClientStatusUpdate: React.FC<ClientStatusUpdateProps> = ({
  ticketId,
  currentStatus,
  onStatusUpdated,
}) => {
  const [nextStatus, setNextStatus] = useState<string | null>(null);
  const [availableStatuses, setAvailableStatuses] = useState<Array<{ value: string; label: string }>>([]);
  
  const {
    isUpdating,
    error,
    selectedStatus,
    setSelectedStatus,
    handleQuickUpdate,
    handleUpdateStatus
  } = useClientStatusUpdate(ticketId, currentStatus, onStatusUpdated);

  useEffect(() => {
    const transitions = getAllowedStatusTransitions(currentStatus, 'client');
    setAvailableStatuses(transitions.map(status => ({
      value: status,
      label: status
    })));
    setNextStatus(transitions.length ? transitions[0] : null);
  }, [currentStatus]);

  if (!availableStatuses.length) {
    return (
      <Alert>
        <AlertTitle>No Available Status Updates</AlertTitle>
        <AlertDescription>
          {currentStatus === 'ready_for_final_action'
            ? "Developer is performing final actions on your request."
            : currentStatus === 'resolved'
            ? "This ticket has been successfully resolved."
            : "No status transitions available at this time."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <StatusUpdateError error={error || ''} />

      <div className="flex flex-col sm:flex-row gap-2">
        <StatusQuickActions
          nextStatus={nextStatus}
          isUpdating={isUpdating}
          onQuickUpdate={handleQuickUpdate}
        />
      </div>

      {availableStatuses.length > 1 && (
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="w-full sm:w-2/3">
            <StatusDropdown
              defaultStatusId={selectedStatus}
              onStatusChange={setSelectedStatus}
              placeholder="Select status"
              required={true}
              userType="client"
              disabled={isUpdating}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => handleUpdateStatus(selectedStatus)}
            disabled={isUpdating || selectedStatus === currentStatus}
            className="w-full sm:w-1/3"
          >
            Update
          </Button>
        </div>
      )}

      <StatusInfo 
        currentStatus={currentStatus}
        matchStatus={null}
      />
    </div>
  );
};

export default ClientStatusUpdate;
