
import React from 'react';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { communicationOptions } from '../../../types/helpRequest';
import { Label } from '../../ui/label';

const CommunicationSection: React.FC = () => {
  const { formData, handleMultiSelectChange } = useHelpRequest();

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium text-slate-800 block">
        Preferred Communication Methods <span className="text-red-500">*</span>
      </Label>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Communication preferences">
        {communicationOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => handleMultiSelectChange('communication_preference', option)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
              formData.communication_preference.includes(option)
                ? 'bg-primary text-white shadow-sm'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
            aria-pressed={formData.communication_preference.includes(option)}
          >
            {option}
          </button>
        ))}
      </div>
      {formData.communication_preference.length === 0 && (
        <p className="text-sm text-amber-600">Please select at least one communication method</p>
      )}
    </div>
  );
};

export default CommunicationSection;
