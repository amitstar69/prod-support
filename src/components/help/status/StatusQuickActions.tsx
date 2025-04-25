
import { Button } from '../../ui/button';
import { Loader2 } from 'lucide-react';
import { HELP_REQUEST_STATUSES, STATUSES } from '../../../utils/constants/statusConstants';
import { getStatusLabel } from '../../../utils/helpRequestStatusUtils';

interface StatusQuickActionsProps {
  nextStatus: string | null;
  isUpdating: boolean;
  onQuickUpdate: (status: string) => Promise<void>;
}

const StatusQuickActions = ({ nextStatus, isUpdating, onQuickUpdate }: StatusQuickActionsProps) => {
  const getButtonVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    if (status === HELP_REQUEST_STATUSES.QA_FAIL) return "secondary";
    if (status === HELP_REQUEST_STATUSES.CANCELLED) return "destructive"; // Updated from CANCELLED_BY_CLIENT
    if (status === HELP_REQUEST_STATUSES.QA_PASS || status === HELP_REQUEST_STATUSES.RESOLVED) return "default";
    return "default";
  };

  const getNextStatusButtonText = (nextStatus: string | null): string => {
    if (!nextStatus) return 'Update Status';
    if (nextStatus === HELP_REQUEST_STATUSES.APPROVED) return 'Approve Developer';
    if (nextStatus === HELP_REQUEST_STATUSES.RESOLVED) return 'Mark as Complete';
    if (nextStatus === HELP_REQUEST_STATUSES.QA_FAIL) return 'Request Changes';
    if (nextStatus === HELP_REQUEST_STATUSES.QA_PASS) return 'Approve Work';
    if (nextStatus === HELP_REQUEST_STATUSES.READY_FOR_FINAL_ACTION) return 'Ready for Final Action';
    if (nextStatus === HELP_REQUEST_STATUSES.CANCELLED) return 'Cancel Request'; // Updated from CANCELLED_BY_CLIENT
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
