
import React, { useState } from 'react';

interface BioSectionProps {
  bio: string;
  onChange?: (value: string) => void;
}

const BioSection: React.FC<BioSectionProps> = ({ bio, onChange }) => {
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
          <label htmlFor="bio" className="block text-sm font-medium mb-1">
            Bio
          </label>
          <div className={`relative transition-all duration-300 ${isFocused ? 'ring-2 ring-primary/20 rounded-md' : ''}`}>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              value={bio}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
              aria-label="Brief bio about yourself"
              placeholder="Tell us about yourself, your technical background, and what kind of help you're seeking..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BioSection;
