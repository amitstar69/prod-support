
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

const statuses = ['all', 'pending', 'approved', 'rejected'] as const;
type Status = (typeof statuses)[number];

interface FilterTabsProps {
  currentStatus: Status;
  onStatusChange: (status: Status) => void;
}

export const FilterTabs = ({ currentStatus, onStatusChange }: FilterTabsProps) => {
  return (
    <Tabs value={currentStatus} onValueChange={(value) => onStatusChange(value as Status)}>
      <TabsList>
        {statuses.map((status) => (
          <TabsTrigger key={status} value={status} className="capitalize">
            {status}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
