
import React from 'react';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { technicalAreaOptions, urgencyOptions } from '../../../types/helpRequest';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

const Step1BasicInfo: React.FC = () => {
  const { formData, handleInputChange, handleMultiSelectChange } = useHelpRequest();

  return (
    <div className="space-y-8">
      <div className="border-b pb-4 mb-6">
        <h3 className="text-xl font-medium text-slate-800">Step 1 out of 2</h3>
        <p className="text-lg text-slate-600 mt-2">Tell us about what you need help with</p>
      </div>
      
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
      
      {/* Technical Area */}
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
      
      {/* Urgency */}
      <div className="space-y-2">
        <Label htmlFor="urgency" className="text-base font-medium text-slate-800">
          Urgency
        </Label>
        <Select 
          value={formData.urgency} 
          onValueChange={(value) => {
            const syntheticEvent = {
              target: {
                name: 'urgency',
                value
              }
            } as React.ChangeEvent<HTMLSelectElement>;
            handleInputChange(syntheticEvent);
          }}
          name="urgency"
        >
          <SelectTrigger id="urgency" className="w-full bg-background">
            <SelectValue placeholder="Select urgency level" />
          </SelectTrigger>
          <SelectContent>
            {urgencyOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Estimated Duration */}
      <div className="space-y-2">
        <Label htmlFor="estimated_duration" className="text-base font-medium text-slate-800">
          Estimated Duration
        </Label>
        <Select 
          value={formData.estimated_duration.toString()} 
          onValueChange={(value) => {
            const syntheticEvent = {
              target: {
                name: 'estimated_duration',
                value
              }
            } as React.ChangeEvent<HTMLSelectElement>;
            handleInputChange(syntheticEvent);
          }}
          name="estimated_duration"
        >
          <SelectTrigger id="estimated_duration" className="w-full bg-background">
            <SelectValue placeholder="Select estimated duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="15">15 minutes</SelectItem>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="45">45 minutes</SelectItem>
            <SelectItem value="60">1 hour</SelectItem>
            <SelectItem value="90">1.5 hours</SelectItem>
            <SelectItem value="120">2 hours</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default Step1BasicInfo;
