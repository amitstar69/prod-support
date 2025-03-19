
import React, { useState } from 'react';
import { Save, CheckCircle2, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ProfileActionsProps {
  isSaving: boolean;
  onSave?: () => void;
  onCancel?: () => void;
  hasChanges?: boolean;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({ 
  isSaving, 
  onSave,
  onCancel, 
  hasChanges = true 
}) => {
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  // Handle the save action with visual feedback
  const handleSave = () => {
    if (onSave && !isSaving && !showSavedMessage) {
      onSave();
      
      // Show "Saved" message after successful save
      if (!isSaving) {
        setTimeout(() => {
          setShowSavedMessage(true);
          toast.success('Profile changes saved successfully');
          
          // Reset back to default state after 2 seconds
          setTimeout(() => {
            setShowSavedMessage(false);
          }, 2000);
        }, 300);
      }
    }
  };

  return (
    <div className="border-t border-border/40 p-6 md:p-8 bg-secondary/10">
      <div className="flex justify-between items-center">
        <AnimatePresence>
          {hasChanges && !showSavedMessage && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted-foreground"
            >
              You have unsaved changes
            </motion.p>
          )}
        </AnimatePresence>
        
        <div className="flex gap-3">
          {onCancel && hasChanges && !isSaving && !showSavedMessage && (
            <Button
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Cancel</span>
            </Button>
          )}
          
          <Button 
            type="button"
            onClick={handleSave}
            disabled={isSaving || showSavedMessage || !hasChanges}
            size="sm"
            aria-busy={isSaving}
            aria-label={isSaving ? "Saving changes" : showSavedMessage ? "Changes saved" : "Save all changes"}
            className={`inline-flex items-center gap-2 transition-all duration-300 ${
              showSavedMessage 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
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
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileActions;
