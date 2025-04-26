
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

interface FilterTabsProps {
  onFilterChange: (value: string) => void;
}

const FilterTabs = ({ onFilterChange }: FilterTabsProps) => {
  return (
    <Tabs onValueChange={onFilterChange}>
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

