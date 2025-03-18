
import React from 'react';
import { useHelpRequest } from '../../../contexts/HelpRequestContext';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { communicationOptions, budgetRangeOptions, locationOptions } from '../../../types/helpRequest';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Switch } from '../../ui/switch';

const Step2AdditionalInfo: React.FC = () => {
  const { formData, handleInputChange, handleMultiSelectChange, handleSwitchChange } = useHelpRequest();

  return (
    <div className="space-y-8">
      <h3 className="text-lg font-medium">Step 2: Additional Details</h3>
      
      {/* Communication Methods */}
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
      
      {/* Budget Range */}
      <div className="space-y-2">
        <Label htmlFor="budget_range" className="text-base font-medium text-foreground">
          Budget Range
        </Label>
        <Select 
          value={formData.budget_range} 
          onValueChange={(value) => {
            const syntheticEvent = {
              target: {
                name: 'budget_range',
                value
              }
            } as React.ChangeEvent<HTMLSelectElement>;
            handleInputChange(syntheticEvent);
          }}
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
      
      {/* Code Snippet */}
      <div className="space-y-2">
        <Label htmlFor="code_snippet" className="text-base font-medium text-foreground flex items-center">
          Code Snippet 
          <span className="text-muted-foreground font-normal text-sm ml-2">(Optional)</span>
        </Label>
        <Textarea
          id="code_snippet"
          name="code_snippet"
          value={formData.code_snippet || ''}
          onChange={handleInputChange}
          placeholder="Paste relevant code here..."
          rows={8}
          className="w-full font-mono text-sm text-foreground bg-background"
          aria-label="Optional code snippet"
        />
        <p className="text-sm text-muted-foreground mt-2">
          Sharing a code snippet helps developers understand your issue better
        </p>
      </div>
      
      {/* NDA Required */}
      <div className="flex items-center justify-between space-x-2">
        <Label htmlFor="nda_required" className="text-base font-medium cursor-pointer">
          NDA Required
        </Label>
        <Switch 
          id="nda_required" 
          checked={formData.nda_required || false}
          onCheckedChange={(checked) => handleSwitchChange('nda_required', checked)}
        />
      </div>
      
      {/* Preferred Developer Location */}
      <div className="space-y-2">
        <Label htmlFor="preferred_developer_location" className="text-base font-medium">
          Preferred Developer Location
        </Label>
        <Select 
          value={formData.preferred_developer_location || 'Global'} 
          onValueChange={(value) => {
            const syntheticEvent = {
              target: {
                name: 'preferred_developer_location',
                value
              }
            } as React.ChangeEvent<HTMLSelectElement>;
            handleInputChange(syntheticEvent);
          }}
          name="preferred_developer_location"
        >
          <SelectTrigger id="preferred_developer_location" className="w-full bg-background">
            <SelectValue placeholder="Select preferred location" />
          </SelectTrigger>
          <SelectContent>
            {locationOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Select 'Global' if location doesn't matter
        </p>
      </div>
    </div>
  );
};

export default Step2AdditionalInfo;
