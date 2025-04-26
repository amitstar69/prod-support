
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

type SortOption = 'newest' | 'oldest' | 'rating';

interface SortDropdownProps {
  value: SortOption;
  onValueChange: (value: SortOption) => void;
}

export const SortDropdown = ({ value, onValueChange }: SortDropdownProps) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest First</SelectItem>
        <SelectItem value="oldest">Oldest First</SelectItem>
        <SelectItem value="rating">By Rating</SelectItem>
      </SelectContent>
    </Select>
  );
};
