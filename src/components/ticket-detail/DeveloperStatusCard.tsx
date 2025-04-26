
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import StatusDropdown from '../developer-actions/StatusDropdown';
import { useStatusUpdate } from '../../hooks/help-request/useStatusUpdate';
import { Loader2 } from 'lucide-react';
import { getStatusLabel } from '../../utils/helpRequestStatusUtils';
import { Button } from '../ui/button';
import StatusQuickActions from '../help/status/StatusQuickActions';
import { getNextRecommendedStatus } from '../../utils/statusTransitions';
import StatusInfo from '../help/status/StatusInfo';

interface DeveloperStatusCardProps {
  ticketId: string;
  currentStatus: string;
  matchStatus?: string | null;
  onStatusUpdated: () => Promise<void>;
}

const DeveloperStatusCard: React.FC<DeveloperStatusCardProps> = ({
  ticketId,
  currentStatus,
  matchStatus,
  onStatusUpdated
}) => {
  const {
    isUpdating,
    error,
    handleUpdateStatus
  } = useStatusUpdate(ticketId, currentStatus, onStatusUpdated);

  // Get next recommended status for quick action button
  const nextRecommendedStatus = getNextRecommendedStatus(currentStatus, 'developer');

  // Ensure consistent status format for dropdown
  const normalizedStatus = currentStatus.replace(/[-_]/g, '_');

  // Quick update handler
  const handleQuickUpdate = async (newStatus: string) => {
    await handleUpdateStatus(newStatus);
  };

  if (!ticketId || !currentStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Developer Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Invalid ticket information</div>
        </CardContent>
      </Card>
    );
  }

  // If the developer's application hasn't been approved yet, show limited options
  if (matchStatus && matchStatus !== 'approved') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Developer Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertDescription>
              Your application status is <strong>{matchStatus}</strong>. You can view ticket details, but cannot modify its status.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Developer Actions</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <StatusDropdown
            defaultStatusId={normalizedStatus}
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

          {/* Quick action button for next recommended status */}
          {nextRecommendedStatus && (
            <div className="mt-4">
              <StatusQuickActions 
                nextStatus={nextRecommendedStatus}
                isUpdating={isUpdating}
                onQuickUpdate={handleQuickUpdate}
              />
            </div>
          )}
          
          <StatusInfo 
            currentStatus={currentStatus}
            matchStatus={matchStatus}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DeveloperStatusCard;
