
import React, { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Edit2, Check } from 'lucide-react';

interface ServiceDetailsSectionProps {
  category: string;
  experience: string;
  hourlyRate: number;
  minuteRate: number;
  availability: boolean;
  communicationPreferences: string[];
  onChange: (field: string, value: any) => void;
}

const ServiceDetailsSection: React.FC<ServiceDetailsSectionProps> = ({
  category,
  experience,
  hourlyRate,
  minuteRate,
  availability,
  communicationPreferences,
  onChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };
  
  const handleSave = () => {
    setIsEditing(false);
  };
  
  const categoryOptions = [
    { value: 'frontend', label: 'Frontend Development' },
    { value: 'backend', label: 'Backend Development' },
    { value: 'fullstack', label: 'Full Stack Development' },
    { value: 'mobile', label: 'Mobile Development' },
    { value: 'devops', label: 'DevOps' },
    { value: 'data', label: 'Data Science' },
    { value: 'ai', label: 'AI/Machine Learning' },
    { value: 'blockchain', label: 'Blockchain' },
    { value: 'design', label: 'UI/UX Design' },
    { value: 'other', label: 'Other' }
  ];
  
  const experienceOptions = [
    '< 1 year', '1-2 years', '3-5 years', '5-10 years', '10+ years'
  ];
  
  const communicationOptions = [
    { value: 'chat', label: 'Chat' },
    { value: 'voice', label: 'Voice Call' },
    { value: 'video', label: 'Video Call' },
    { value: 'screen', label: 'Screen Sharing' }
  ];
  
  const getCategoryLabel = (value: string) => {
    return categoryOptions.find(option => option.value === value)?.label || value;
  };
  
  const handleCommunicationToggle = (value: string) => {
    const updated = communicationPreferences.includes(value)
      ? communicationPreferences.filter(p => p !== value)
      : [...communicationPreferences, value];
    onChange('communicationPreferences', updated);
  };
  
  return (
    <Card className="border border-border/40 shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">Service Details</h2>
          <Button variant="ghost" size="sm" onClick={handleToggleEdit}>
            <Edit2 className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>
        
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-1">
                Specialization Category
              </label>
              <select
                id="category"
                name="category"
                value={category}
                onChange={(e) => onChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="experience" className="block text-sm font-medium mb-1">
                Experience Level
              </label>
              <select
                id="experience"
                name="experience"
                value={experience}
                onChange={(e) => onChange('experience', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md"
              >
                {experienceOptions.map(option => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="hourlyRate" className="block text-sm font-medium mb-1">
                  Hourly Rate ($)
                </label>
                <input
                  id="hourlyRate"
                  name="hourlyRate"
                  type="number"
                  min="0"
                  step="1"
                  value={hourlyRate}
                  onChange={(e) => onChange('hourlyRate', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  placeholder="75"
                />
              </div>
              
              <div>
                <label htmlFor="minuteRate" className="block text-sm font-medium mb-1">
                  Per Minute Rate ($)
                </label>
                <input
                  id="minuteRate"
                  name="minuteRate"
                  type="number"
                  min="0"
                  step="0.1"
                  value={minuteRate}
                  onChange={(e) => onChange('minuteRate', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-border rounded-md"
                  placeholder="1.25"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Availability
              </label>
              <div className="flex items-center">
                <input
                  id="availability"
                  name="availability"
                  type="checkbox"
                  checked={availability}
                  onChange={(e) => onChange('availability', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="availability" className="ml-2 text-sm">
                  I am currently available for work
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Communication Preferences
              </label>
              <div className="grid grid-cols-2 gap-2">
                {communicationOptions.map((option) => (
                  <div key={option.value} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => handleCommunicationToggle(option.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm w-full ${
                        communicationPreferences.includes(option.value)
                          ? 'bg-primary/10 border border-primary/30'
                          : 'bg-secondary border border-border'
                      }`}
                    >
                      {communicationPreferences.includes(option.value) && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                      <span>{option.label}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                <p>{getCategoryLabel(category)}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Experience</h3>
                <p>{experience || 'Not specified'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Hourly Rate</h3>
                <p>${hourlyRate}/hr</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Per Minute Rate</h3>
                <p>${minuteRate}/min</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Availability</h3>
              <p>{availability ? 'Available for work' : 'Currently unavailable'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Communication Preferences</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {communicationPreferences.length > 0 ? (
                  communicationPreferences.map((pref) => (
                    <span key={pref} className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm">
                      {communicationOptions.find(o => o.value === pref)?.label || pref}
                    </span>
                  ))
                ) : (
                  <p className="text-muted-foreground">No preferences specified</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceDetailsSection;
