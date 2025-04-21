
import { getStatusLabel, getStatusDescription } from '../../../utils/helpRequestStatusUtils';

interface StatusInfoProps {
  currentStatus: string;
  matchStatus: string | null;
}

const StatusInfo = ({ currentStatus, matchStatus }: StatusInfoProps) => {
  return (
    <div className="mt-4 bg-muted p-3 rounded text-sm">
      <p className="font-medium">Current Status: {getStatusLabel(currentStatus)}</p>
      <p className="text-muted-foreground text-xs mt-1">{getStatusDescription(currentStatus)}</p>
      {matchStatus && matchStatus !== 'approved' && (
        <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded text-amber-800 text-xs">
          Your application status: <span className="font-medium capitalize">{matchStatus}</span>.
          {matchStatus === 'pending' ? ' Waiting for client approval.' : ' Not eligible for status changes.'}
        </div>
      )}
    </div>
  );
};

export default StatusInfo;
