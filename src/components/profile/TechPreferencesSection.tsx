
import React from 'react';

interface TechPreferencesSectionProps {
  techStack: string[];
  industry: string;
  projectTypes: string[];
  preferredHelpFormat: string[];
  onChange: (field: string, value: any) => void;
}

const TechPreferencesSection: React.FC<TechPreferencesSectionProps> = ({
  techStack,
  industry,
  projectTypes,
  preferredHelpFormat,
  onChange
}) => {
  const helpFormatOptions = ["Chat", "Voice", "Video"];
  
  const handleTechStackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Split by commas and trim each value
    const techStackArray = value.split(',').map(item => item.trim());
    onChange('techStack', techStackArray);
  };
  
  const handleProjectTypesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Split by commas and trim each value
    const projectTypesArray = value.split(',').map(item => item.trim());
    onChange('projectTypes', projectTypesArray);
  };
  
  const handleFormatToggle = (format: string) => {
    const newFormats = preferredHelpFormat.includes(format)
      ? preferredHelpFormat.filter(f => f !== format)
      : [...preferredHelpFormat, format];
    
    onChange('preferredHelpFormat', newFormats);
  };
  
  return (
    <div className="border-t border-border/40 p-6 md:p-8">
      <h3 className="font-medium text-lg mb-4">Technical Preferences</h3>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="techStack" className="block text-sm font-medium mb-1">
            Tech Stack
          </label>
          <input
            id="techStack"
            name="techStack"
            type="text"
            value={techStack.join(', ')}
            onChange={handleTechStackChange}
            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
            placeholder="React, Node.js, TypeScript, etc. (comma separated)"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Enter technologies you're working with, separated by commas
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="industry" className="block text-sm font-medium mb-1">
              Industry
            </label>
            <input
              id="industry"
              name="industry"
              type="text"
              value={industry}
              onChange={(e) => onChange('industry', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
              placeholder="E.g., FinTech, E-commerce, Healthcare"
            />
          </div>
          <div>
            <label htmlFor="projectTypes" className="block text-sm font-medium mb-1">
              Project Types
            </label>
            <input
              id="projectTypes"
              name="projectTypes"
              type="text"
              value={projectTypes.join(', ')}
              onChange={handleProjectTypesChange}
              className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
              placeholder="Web App, Mobile App, API, etc."
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Preferred Help Format
          </label>
          <div className="flex flex-wrap gap-2">
            {helpFormatOptions.map((format) => (
              <button
                key={format}
                type="button"
                onClick={() => handleFormatToggle(format)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  preferredHelpFormat.includes(format)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {format}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Select all formats you're comfortable with
          </p>
        </div>
      </div>
    </div>
  );
};

export default TechPreferencesSection;
