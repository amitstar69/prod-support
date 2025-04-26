
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

interface FilterTabsProps {
  value: string;
  onValueChange: (value: string) => void;
}

const FilterTabs = ({ value, onValueChange }: FilterTabsProps) => {
  return (
    <Tabs value={value} onValueChange={onValueChange}>
      <TabsList>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="approved">Approved</TabsTrigger>
        <TabsTrigger value="rejected">Rejected</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default FilterTabs;
