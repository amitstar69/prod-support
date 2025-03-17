
import React from 'react';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { budgetRangeOptions } from '../../../types/helpRequest';
import { Label } from '../../ui/label';
import { Select } from '../../ui/select';

const BudgetSection: React.FC = () => {
  const { formData, handleInputChange } = useHelpRequest();

  return (
    <div className="space-y-2">
      <Label htmlFor="budget_range" className="text-base font-medium text-slate-800">
        Budget Range
      </Label>
      <select
        id="budget_range"
        name="budget_range"
        value={formData.budget_range}
        onChange={handleInputChange}
        className="w-full px-4 py-3 border border-slate-300 rounded-md bg-white text-slate-900 shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
        aria-label="Select your budget range"
      >
        {budgetRangeOptions.map((range) => (
          <option key={range} value={range}>
            {range}
          </option>
        ))}
      </select>
      <p className="text-sm text-slate-600">Choose a budget range that matches your project needs</p>
    </div>
  );
};

export default BudgetSection;
