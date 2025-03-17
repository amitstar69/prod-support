
import React from 'react';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { budgetRangeOptions } from '../../../types/helpRequest';
import { Label } from '../../ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../ui/select';

const BudgetSection: React.FC = () => {
  const { formData, handleInputChange } = useHelpRequest();

  const handleSelectChange = (value: string) => {
    // Create synthetic event to match handleInputChange expectations
    const syntheticEvent = {
      target: {
        name: 'budget_range',
        value
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    handleInputChange(syntheticEvent);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="budget_range" className="text-base font-medium text-foreground">
        Budget Range
      </Label>
      <Select 
        value={formData.budget_range} 
        onValueChange={handleSelectChange}
        name="budget_range"
      >
        <SelectTrigger id="budget_range" className="w-full bg-background">
          <SelectValue placeholder="Select your budget range" />
        </SelectTrigger>
        <SelectContent>
          {budgetRangeOptions.map((range) => (
            <SelectItem key={range} value={range}>
              {range}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-sm text-muted-foreground">Choose a budget range that matches your project needs</p>
    </div>
  );
};

export default BudgetSection;
