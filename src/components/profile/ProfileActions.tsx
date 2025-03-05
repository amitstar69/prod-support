
import React, { useState } from 'react';
import { Save, CheckCircle2, Loader2 } from 'lucide-react';

interface ProfileActionsProps {
  isSaving: boolean;
  onSave?: () => void;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({ isSaving, onSave }) => {
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  // Handle the save action with visual feedback
  const handleSave = () => {
    if (onSave && !isSaving && !showSavedMessage) {
      onSave();
      
      // Show "Saved" message after successful save
      if (!isSaving) {
        setTimeout(() => {
          setShowSavedMessage(true);
          
          // Reset back to default state after 2 seconds
          setTimeout(() => {
            setShowSavedMessage(false);
          }, 2000);
        }, 300);
      }
    }
  };

  return (
    <div className="border-t border-border/40 p-6 md:p-8">
      <button 
        type="button"
        onClick={handleSave}
        disabled={isSaving || showSavedMessage}
        aria-busy={isSaving}
        aria-label={isSaving ? "Saving changes" : showSavedMessage ? "Changes saved" : "Save all changes"}
        className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium shadow transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
          showSavedMessage 
            ? 'bg-green-600 text-white hover:bg-green-700' 
            : isSaving 
              ? 'bg-primary/70 text-primary-foreground cursor-not-allowed opacity-80' 
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Saving changes...</span>
          </>
        ) : showSavedMessage ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            <span>Changes saved!</span>
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            <span>Save All Changes</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ProfileActions;
