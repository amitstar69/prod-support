
import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useApplicationStatuses } from '../../hooks/useApplicationStatuses';
import { Alert, AlertDescription } from '../ui/alert';

interface StatusDropdownProps {
  defaultStatusId?: string;
  onStatusChange: (statusId: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  defaultStatusId,
  onStatusChange,
  placeholder = "Select Status",
  required = false,
  disabled = false,
}) => {
  const { statuses, isLoading, error } = useApplicationStatuses();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading statuses...</span>
      </div>
    );
  }

  if (statuses.length === 0) {
    return (
      <Alert>
        <AlertDescription>No statuses available</AlertDescription>
      </Alert>
    );
  }

  return (
    <Select
      defaultValue={defaultStatusId}
      onValueChange={onStatusChange}
      disabled={disabled}
    >
      <SelectTrigger
        className="w-full"
        aria-label="Select application status"
        aria-required={required}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {statuses.map((status) => (
          <SelectItem
            key={status.id}
            value={status.id}
            className="flex items-center gap-2"
          >
            <span>{status.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default StatusDropdown;
