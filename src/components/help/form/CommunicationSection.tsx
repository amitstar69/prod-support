
import React from 'react';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { communicationOptions } from '../../../types/helpRequest';

const CommunicationSection: React.FC = () => {
  const { formData, handleMultiSelectChange } = useHelpRequest();

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Preferred Communication Methods
      </label>
      <div className="flex flex-wrap gap-2">
        {communicationOptions.map((option) => (
          <div
            key={option}
            onClick={() => handleMultiSelectChange('communication_preference', option)}
            className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
              formData.communication_preference.includes(option)
                ? 'bg-primary text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommunicationSection;
