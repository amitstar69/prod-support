
import React from 'react';
import { Button } from '../ui/button';
import { Loader2, Save } from 'lucide-react';

interface ProfileActionsProps {
  isSaving: boolean;
  onSave: () => void;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({ isSaving, onSave }) => {
  return (
    <div className="flex justify-end">
      <Button 
        onClick={onSave} 
        disabled={isSaving}
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
