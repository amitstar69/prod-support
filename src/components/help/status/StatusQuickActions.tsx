
import { Button } from '../../ui/button';
import { Loader2 } from 'lucide-react';
import { STATUSES, getStatusLabel } from '../../../utils/helpRequestStatusUtils';

interface StatusQuickActionsProps {
  nextStatus: string | null;
  isUpdating: boolean;
  onQuickUpdate: (status: string) => Promise<void>;
}

const StatusQuickActions = ({ nextStatus, isUpdating, onQuickUpdate }: StatusQuickActionsProps) => {
  const getButtonVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    if (status === STATUSES.QA_FAIL) return "secondary";
    if (status === STATUSES.CANCELLED_BY_CLIENT) return "destructive";
    if (status === STATUSES.QA_PASS || status === STATUSES.RESOLVED) return "default";
    return "default";
  };

  const getNextStatusButtonText = (nextStatus: string | null): string => {
    if (!nextStatus) return 'Update Status';
    if (nextStatus === STATUSES.APPROVED) return 'Approve Developer';
    if (nextStatus === STATUSES.RESOLVED) return 'Mark as Complete';
    if (nextStatus === STATUSES.QA_FAIL) return 'Request Changes';
    if (nextStatus === STATUSES.QA_PASS) return 'Approve Work';
    if (nextStatus === STATUSES.READY_FOR_FINAL_ACTION) return 'Ready for Final Action';
    if (nextStatus === STATUSES.CANCELLED_BY_CLIENT) return 'Cancel Request';
    return getStatusLabel(nextStatus);
  };

  if (!nextStatus) return null;

  return (
    <Button
      onClick={() => onQuickUpdate(nextStatus)}
      disabled={isUpdating}
      className="w-full"
      variant={getButtonVariant(nextStatus)}
    >
      {isUpdating ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : null}
      <span className="ml-2">{getNextStatusButtonText(nextStatus)}</span>
    </Button>
  );
};

export default StatusQuickActions;
