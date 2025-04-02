
import React from 'react';
import { Button } from '../ui/button';
import { Loader2, Save, X } from 'lucide-react';

interface ProfileActionsProps {
  isSaving: boolean;
  onSave: () => void;
  onCancel?: () => void;
  hasChanges?: boolean;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({ isSaving, onSave, onCancel, hasChanges = false }) => {
  return (
    <div className="flex justify-end space-x-3">
      {onCancel && (
        <Button 
          onClick={onCancel} 
          variant="outline" 
          disabled={isSaving || !hasChanges}
          className="px-6"
        >
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      )}
      <Button 
        onClick={onSave} 
        disabled={isSaving || !hasChanges}
        className="px-6"
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </>
        )}
      </Button>
    </div>
  );
};

export default ProfileActions;
