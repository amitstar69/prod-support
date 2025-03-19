
import React from 'react';

interface DeveloperCommunicationSectionProps {
  communicationPreferences: string[];
  onChange: (field: string, value: string[]) => void;
}

const DeveloperCommunicationSection: React.FC<DeveloperCommunicationSectionProps> = ({
  communicationPreferences,
  onChange
}) => {
  const handlePreferenceChange = (preference: string, checked: boolean) => {
    if (checked) {
      onChange('communicationPreferences', [...communicationPreferences, preference]);
    } else {
      onChange('communicationPreferences', communicationPreferences.filter(p => p !== preference));
    }
  };

  return (
    <div className="border-t border-border/40 p-6 md:p-8">
      <h2 className="text-xl font-semibold mb-6">Communication Preferences</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-medium mb-3">Preferred Communication Tools</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 p-3 border border-border rounded-md hover:bg-secondary/30 cursor-pointer">
              <input
                type="checkbox"
                checked={communicationPreferences.includes('video')}
                onChange={(e) => handlePreferenceChange('video', e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/25"
              />
              <span>In-app Video Call</span>
            </label>
            <label className="flex items-center gap-2 p-3 border border-border rounded-md hover:bg-secondary/30 cursor-pointer">
              <input
                type="checkbox"
                checked={communicationPreferences.includes('chat')}
                onChange={(e) => handlePreferenceChange('chat', e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/25"
              />
              <span>In-app Chat</span>
            </label>
            <label className="flex items-center gap-2 p-3 border border-border rounded-md hover:bg-secondary/30 cursor-pointer">
              <input
                type="checkbox"
                checked={communicationPreferences.includes('voice')}
                onChange={(e) => handlePreferenceChange('voice', e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/25"
              />
              <span>Voice Call</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperCommunicationSection;
