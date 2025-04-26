
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface SortDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
}

const SortDropdown = ({ value, onValueChange }: SortDropdownProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="created_at">Most Recent</SelectItem>
        <SelectItem value="match_score">Match Score</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default SortDropdown;
