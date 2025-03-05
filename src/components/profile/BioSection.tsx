
import React from 'react';

interface BioSectionProps {
  username: string;
  bio: string;
  company: string;
  position: string;
  onChange: (field: string, value: string) => void;
}

const BioSection: React.FC<BioSectionProps> = ({ 
  username, 
  bio, 
  company, 
  position, 
  onChange 
}) => {
  return (
    <div className="border-t border-border/40 p-6 md:p-8">
      <h3 className="font-medium text-lg mb-4">Professional Profile</h3>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            Username
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-secondary text-muted-foreground sm:text-sm">
              @
            </span>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => onChange('username', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-r-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
              placeholder="username"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="company" className="block text-sm font-medium mb-1">
              Company
            </label>
            <input
              id="company"
              name="company"
              type="text"
              value={company}
              onChange={(e) => onChange('company', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
              placeholder="Company name (optional)"
            />
          </div>
          <div>
            <label htmlFor="position" className="block text-sm font-medium mb-1">
              Position
            </label>
            <input
              id="position"
              name="position"
              type="text"
              value={position}
              onChange={(e) => onChange('position', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
              placeholder="Your role (optional)"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={bio}
            onChange={(e) => onChange('bio', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
            placeholder="Tell us a bit about yourself and what you're looking for help with..."
          />
        </div>
      </div>
    </div>
  );
};

export default BioSection;
