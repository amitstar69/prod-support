
import React from 'react';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { budgetRangeOptions } from '../../../types/helpRequest';

const BudgetSection: React.FC = () => {
  const { formData, handleInputChange } = useHelpRequest();

  return (
    <div>
      <label htmlFor="budget_range" className="block text-sm font-medium mb-2">
        Budget Range
      </label>
      <select
        id="budget_range"
        name="budget_range"
        value={formData.budget_range}
        onChange={handleInputChange}
        className="w-full px-4 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
      >
        {budgetRangeOptions.map((range) => (
          <option key={range} value={range}>
            {range}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BudgetSection;
