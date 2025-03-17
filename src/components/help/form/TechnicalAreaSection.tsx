
import React from 'react';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { technicalAreaOptions } from '../../../types/helpRequest';
import { Label } from '../../ui/label';

const TechnicalAreaSection: React.FC = () => {
  const { formData, handleMultiSelectChange } = useHelpRequest();

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium text-slate-800 block">
        Technical Area <span className="text-red-500">*</span>
        <span className="text-sm font-normal text-slate-600 ml-1">(Select all that apply)</span>
      </Label>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Technical areas">
        {technicalAreaOptions.map((area) => (
          <button
            key={area}
            type="button"
            onClick={() => handleMultiSelectChange('technical_area', area)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
              formData.technical_area.includes(area)
                ? 'bg-primary text-white shadow-sm'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
            aria-pressed={formData.technical_area.includes(area)}
          >
            {area}
          </button>
        ))}
      </div>
      {formData.technical_area.length === 0 && (
        <p className="text-sm text-amber-600">Please select at least one technical area</p>
      )}
    </div>
  );
};

export default TechnicalAreaSection;
