
import React from 'react';

interface DeveloperSkillsSectionProps {
  category: string;
  skills: string[];
  experience: string;
  hourlyRate: number;
  minuteRate: number;
  availability: boolean;
  onChange: (field: string, value: any) => void;
}

const DeveloperSkillsSection: React.FC<DeveloperSkillsSectionProps> = ({
  category,
  skills,
  experience,
  hourlyRate,
  minuteRate,
  availability,
  onChange
}) => {
  return (
    <div className="border-t border-border/40 p-6 md:p-8">
      <h2 className="text-xl font-semibold mb-6">Skills & Experience</h2>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium mb-1">
            Specialization
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => onChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
          >
            <option value="frontend">Frontend Development</option>
            <option value="backend">Backend Development</option>
            <option value="fullstack">Full Stack Development</option>
            <option value="mobile">Mobile Development</option>
            <option value="devops">DevOps</option>
            <option value="database">Database</option>
            <option value="security">Security</option>
            <option value="ai">AI & Machine Learning</option>
          </select>
        </div>

        <div>
          <label htmlFor="skills" className="block text-sm font-medium mb-1">
            Skills (comma separated)
          </label>
          <input
            id="skills"
            type="text"
            value={skills.join(', ')}
            onChange={(e) => onChange('skills', e.target.value.split(',').map(skill => skill.trim()))}
            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="experience" className="block text-sm font-medium mb-1">
            Experience Summary
          </label>
          <input
            id="experience"
            type="text"
            value={experience}
            onChange={(e) => onChange('experience', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="hourlyRate" className="block text-sm font-medium mb-1">
              Hourly Rate ($)
            </label>
            <input
              id="hourlyRate"
              type="number"
              value={hourlyRate}
              min="1"
              step="1"
              onChange={(e) => onChange('hourlyRate', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="minuteRate" className="block text-sm font-medium mb-1">
              Minute Rate ($)
            </label>
            <input
              id="minuteRate"
              type="number"
              value={minuteRate}
              min="0.1"
              step="0.05"
              onChange={(e) => onChange('minuteRate', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            id="availability"
            type="checkbox"
            checked={availability}
            onChange={(e) => onChange('availability', e.target.checked)}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary/25"
          />
          <label htmlFor="availability" className="text-sm font-medium">
            Available for hire
          </label>
        </div>
      </div>
    </div>
  );
};

export default DeveloperSkillsSection;
