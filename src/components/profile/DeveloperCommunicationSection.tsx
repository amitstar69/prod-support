
import React from 'react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { Info } from 'lucide-react';

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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Communication Preferences</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-muted-foreground hover:text-primary transition-colors">
                <Info className="h-5 w-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[280px]">
              <p className="text-sm">
                Select the communication methods you're comfortable using with clients. 
                This helps match you with clients who prefer the same communication tools.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-medium mb-3">Preferred Communication Tools</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 p-3 border border-border rounded-md hover:bg-secondary/30 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={communicationPreferences.includes('video')}
                onChange={(e) => handlePreferenceChange('video', e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/25"
              />
              <span>In-app Video Call</span>
            </label>
            <label className="flex items-center gap-2 p-3 border border-border rounded-md hover:bg-secondary/30 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={communicationPreferences.includes('chat')}
                onChange={(e) => handlePreferenceChange('chat', e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/25"
              />
              <span>In-app Chat</span>
            </label>
            <label className="flex items-center gap-2 p-3 border border-border rounded-md hover:bg-secondary/30 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={communicationPreferences.includes('voice')}
                onChange={(e) => handlePreferenceChange('voice', e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/25"
              />
              <span>Voice Call</span>
            </label>
            <label className="flex items-center gap-2 p-3 border border-border rounded-md hover:bg-secondary/30 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={communicationPreferences.includes('screen-sharing')}
                onChange={(e) => handlePreferenceChange('screen-sharing', e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/25"
              />
              <span>Screen Sharing</span>
            </label>
            <label className="flex items-center gap-2 p-3 border border-border rounded-md hover:bg-secondary/30 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={communicationPreferences.includes('code-editor')}
                onChange={(e) => handlePreferenceChange('code-editor', e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/25"
              />
              <span>Live Code Editor</span>
            </label>
            <label className="flex items-center gap-2 p-3 border border-border rounded-md hover:bg-secondary/30 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={communicationPreferences.includes('file-sharing')}
                onChange={(e) => handlePreferenceChange('file-sharing', e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/25"
              />
              <span>File Uploads</span>
            </label>
          </div>
        </div>
        
        <div className="bg-secondary/20 p-4 rounded-md border border-border/40">
          <p className="text-sm text-muted-foreground">
            Clients can see your preferred communication methods on your profile. 
            This helps set expectations for how you'll collaborate during help sessions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeveloperCommunicationSection;
