
import React from 'react';

interface TechPreferencesSectionProps {
  techStack: string[];
  preferredHelpFormat: string;
  onTechStackChange: (techStack: string[]) => void;
  onFormatChange: (format: string) => void;
}

const TechPreferencesSection: React.FC<TechPreferencesSectionProps> = ({ 
  techStack, 
  preferredHelpFormat, 
  onTechStackChange, 
  onFormatChange 
}) => {
  const commonTechOptions = [
    'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 
    'Node.js', 'Python', 'Java', 'PHP', 'Ruby', 
    'C#', 'Go', 'Rust', 'Swift', 'Kotlin',
    'HTML/CSS', 'SQL', 'MongoDB', 'AWS', 'Azure',
    'Docker', 'Kubernetes', 'GraphQL', 'REST API'
  ];

  const handleTechChange = (tech: string) => {
    if (techStack.includes(tech)) {
      onTechStackChange(techStack.filter(t => t !== tech));
    } else {
      onTechStackChange([...techStack, tech]);
    }
  };

  return (
    <div className="border-t border-border/40 p-6 md:p-8">
      <h2 className="text-xl font-semibold mb-6">Technical Preferences</h2>
      
      <div className="space-y-8">
        <div>
          <label className="block text-sm font-medium mb-3">
            Tech Stack
          </label>
          <p className="text-sm text-muted-foreground mb-4">
            Select the technologies you're working with or need help with
          </p>
          
          <div className="flex flex-wrap gap-2">
            {commonTechOptions.map(tech => (
              <button
                key={tech}
                type="button"
                onClick={() => handleTechChange(tech)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  techStack.includes(tech)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
                aria-pressed={techStack.includes(tech)}
              >
                {tech}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-3">
            Preferred Help Format
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {['Chat', 'Voice', 'Video'].map(format => (
              <div key={format} className="relative">
                <input
                  type="radio"
                  id={`format-${format}`}
                  name="helpFormat"
                  value={format}
                  checked={preferredHelpFormat === format}
                  onChange={() => onFormatChange(format)}
                  className="sr-only"
                />
                <label
                  htmlFor={`format-${format}`}
                  className={`block w-full px-4 py-3 text-center rounded-lg cursor-pointer border transition-all ${
                    preferredHelpFormat === format
                      ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/10'
                      : 'border-border hover:border-primary/30 hover:bg-secondary'
                  }`}
                >
                  {format}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechPreferencesSection;
