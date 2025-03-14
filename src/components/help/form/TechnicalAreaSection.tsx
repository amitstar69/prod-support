
import React from 'react';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { technicalAreaOptions } from '../../../types/helpRequest';

const TechnicalAreaSection: React.FC = () => {
  const { formData, handleMultiSelectChange } = useHelpRequest();

  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        Technical Area (Select all that apply)
      </label>
      <div className="flex flex-wrap gap-2">
        {technicalAreaOptions.map((area) => (
          <div
            key={area}
            onClick={() => handleMultiSelectChange('technical_area', area)}
            className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
              formData.technical_area.includes(area)
                ? 'bg-primary text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {area}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnicalAreaSection;
