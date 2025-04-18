
import React from 'react';
import { Columns, List } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';

interface TicketViewToggleProps {
  viewMode: 'grid' | 'list';
  onViewChange: (value: 'grid' | 'list') => void;
}

const TicketViewToggle: React.FC<TicketViewToggleProps> = ({ viewMode, onViewChange }) => {
  return (
    <ToggleGroup 
      type="single" 
      value={viewMode} 
      onValueChange={(value) => value && onViewChange(value as 'grid' | 'list')}
    >
      <ToggleGroupItem value="grid" size="sm" className="h-7 w-7">
        <Columns className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" size="sm" className="h-7 w-7">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default TicketViewToggle;
