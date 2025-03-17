
import React from 'react';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';

const TitleDescriptionSection: React.FC = () => {
  const { formData, handleInputChange } = useHelpRequest();

  return (
    <>
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-base font-medium text-slate-800">
          Issue Title <span className="text-red-500">*</span>
        </Label>
        <Input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="e.g., Need help with React component optimization"
          className="w-full px-4 py-3 border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm text-slate-900"
          maxLength={100}
          required
          aria-required="true"
        />
      </div>
      
      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-base font-medium text-slate-800">
          Describe Your Issue <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Please provide details about what you're trying to accomplish and what issues you're facing..."
          rows={5}
          className="w-full px-4 py-3 border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm text-slate-900 resize-y"
          required
          aria-required="true"
        />
      </div>
    </>
  );
};

export default TitleDescriptionSection;
