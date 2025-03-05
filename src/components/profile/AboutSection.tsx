
import React, { useState } from 'react';

interface AboutSectionProps {
  description: string;
  onChange?: (value: string) => void;
}

const AboutSection: React.FC<AboutSectionProps> = ({ description, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="border-t border-border/40 p-6 md:p-8">
      <h2 className="text-xl font-semibold mb-6">About You</h2>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Brief Description
          </label>
          <div className={`relative transition-all duration-300 ${isFocused ? 'ring-2 ring-primary/20 rounded-md' : ''}`}>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={description}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
              aria-label="Brief description about yourself"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
