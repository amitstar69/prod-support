
import React from 'react';

interface AboutSectionProps {
  description: string;
  bio: string;
  onChange: (field: string, value: string) => void;
}

const AboutSection: React.FC<AboutSectionProps> = ({ 
  description, 
  bio, 
  onChange 
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">About You</h2>
      <p className="text-muted-foreground text-sm">
        Share some details about yourself, your expertise, and what services you offer
      </p>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-1">
            Short Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            value={bio}
            onChange={(e) => onChange('bio', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
            placeholder="A brief introduction about yourself..."
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Detailed Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            value={description}
            onChange={(e) => onChange('description', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
            placeholder="Describe your experience, skills, and the services you provide in detail..."
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Provide a detailed description of your expertise and the services you offer. This will help clients understand how you can help them.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
