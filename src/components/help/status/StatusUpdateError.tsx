
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../../ui/alert';

interface StatusUpdateErrorProps {
  error: string;
}

const StatusUpdateError = ({ error }: StatusUpdateErrorProps) => {
  if (!error) return null;

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};

export default StatusUpdateError;
