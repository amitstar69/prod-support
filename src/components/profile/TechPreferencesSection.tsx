
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
  const techOptions = ["React", "Node.js", "Python", "JavaScript", "TypeScript", "Java", "C#", ".NET", "PHP", "Ruby"];
  const projectTypeOptions = ["Web App", "Mobile App", "Desktop App", "API", "Database", "DevOps", "Machine Learning"];
  const helpFormatOptions = ["Chat", "Video Call", "Screen Share", "Code Review", "Pair Programming"];
  
  const handleToggleOption = (field: string, option: string, currentSelection: string[]) => {
    const newSelection = currentSelection.includes(option)
      ? currentSelection.filter(item => item !== option)
      : [...currentSelection, option];
    onChange(field, newSelection);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Technical Preferences</h2>
      <p className="text-muted-foreground text-sm">
        Let us know your technical background and preferences to match you with the right developers
      </p>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Tech Stack
          </label>
          <div className="flex flex-wrap gap-2">
            {techOptions.map((tech) => (
              <button
                key={tech}
                type="button"
                onClick={() => handleToggleOption('techStack', tech, techStack)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  techStack.includes(tech)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {tech}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Select the technologies you're working with
          </p>
        </div>
        
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
            placeholder="e.g. Finance, Healthcare, Education"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            What industry is your project in?
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Project Types
          </label>
          <div className="flex flex-wrap gap-2">
            {projectTypeOptions.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleToggleOption('projectTypes', type, projectTypes)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  projectTypes.includes(type)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            What types of projects are you working on?
          </p>
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
                onClick={() => handleToggleOption('preferredHelpFormat', format, preferredHelpFormat)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
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
            How would you prefer to receive help?
          </p>
        </div>
      </div>
    </div>
  );
};

export default TechPreferencesSection;
