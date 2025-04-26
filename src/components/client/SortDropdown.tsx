
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface SortDropdownProps {
  onSortChange: (value: string) => void;
}

const SortDropdown = ({ onSortChange }: SortDropdownProps) => {
  return (
    <Select onValueChange={onSortChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="match_score">Match Score</SelectItem>
        <SelectItem value="proposed_rate">Proposed Rate</SelectItem>
        <SelectItem value="proposed_duration">Proposed Duration</SelectItem>
        <SelectItem value="created_at">Created Date</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SortDropdown;
