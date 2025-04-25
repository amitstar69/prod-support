
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { HelpRequest } from '../../types/helpRequest';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2 } from 'lucide-react';
import { 
  getAllowedTransitions,
  getNextRecommendedStatus,
  StatusTransition 
} from '../../utils/statusTransitions';
import { updateHelpRequest } from '../../integrations/supabase/helpRequestsCore/updateHelpRequest';
import { UserType } from '../../utils/helpRequestStatusUtils';

interface StatusActionCardProps {
  ticket: HelpRequest;
  userType: UserType;
  onStatusUpdated?: () => void;
}

/**
 * StatusActionCard - A revamped component that displays status update actions
 * with clear transition paths based on current status and user role
 */
const StatusActionCard: React.FC<StatusActionCardProps> = ({
  ticket,
  userType,
  onStatusUpdated
}) => {
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableTransitions, setAvailableTransitions] = useState<StatusTransition[]>([]);
  
  useEffect(() => {
    if (ticket && ticket.status) {
      // Get allowed transitions based on current status and user role
      const transitions = getAllowedTransitions(ticket.status, userType);
      console.log(`[StatusActionCard] Found ${transitions.length} transitions for ${userType} in status ${ticket.status}`);
      setAvailableTransitions(transitions);
    }
  }, [ticket, userType]);
  
  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setIsUpdating(newStatus);
      setError(null);
      
      // Normalize status formats for consistent comparison (handles both hyphen and underscore formats)
      const normalizedCurrentStatus = ticket.status?.replace(/[-_]/g, '_');
      const normalizedNewStatus = newStatus.replace(/[-_]/g, '_');
      
      // Prevent unnecessary updates
      if (normalizedCurrentStatus === normalizedNewStatus) {
        toast.info(`Status is already set to ${newStatus}`);
        setIsUpdating(null);
        return;
      }
      
      console.log(`[StatusActionCard] Updating status from ${ticket.status} to ${newStatus}`);
      
      const response = await updateHelpRequest(
        ticket.id!,
        { status: newStatus },
        userType
      );

      if (!response.success) {
        setError(response.error || `Failed to update status to ${newStatus}`);
        toast.error(response.error || 'Status update failed');
        return;
      }

      toast.success(`Status updated successfully`);
      if (onStatusUpdated) {
        onStatusUpdated();
      }
    } catch (error: any) {
      setError(error.message || `Failed to update status to ${newStatus}`);
      toast.error('Failed to update status');
      console.error('[StatusActionCard] Error updating status:', error);
    } finally {
      setIsUpdating(null);
    }
  };
  
  if (!ticket || !ticket.id) {
    return null;
  }
  
  // No actions available for this user type
  if (availableTransitions.length === 0) {
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Status Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No status actions available for {userType} at this stage.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{userType === 'client' ? 'Client Actions' : 'Developer Actions'}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-3">
          <div className="flex flex-col space-y-2">
            {availableTransitions.map((transition) => (
              <Button
                key={transition.to}
                onClick={() => handleStatusUpdate(transition.to)}
                disabled={!!isUpdating}
                variant={transition.buttonVariant || 'default'}
                className="w-full"
              >
                {isUpdating === transition.to && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {transition.buttonLabel || `Move to ${transition.to.replace(/_/g, ' ')}`}
              </Button>
            ))}
          </div>
          
          {availableTransitions.length > 0 && (
            <div className="pt-2 text-xs text-muted-foreground">
              <p>Current Status: <span className="font-medium">{ticket.status?.replace(/_/g, ' ')}</span></p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusActionCard;
