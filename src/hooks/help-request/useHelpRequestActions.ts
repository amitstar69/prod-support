
import { useState } from 'react';
import { HelpRequest } from '../../types/helpRequest';
import { updateHelpRequest } from '../../integrations/supabase/helpRequests';
import { isApiSuccess, isApiError } from '../../types/api';
import { toast } from 'sonner';

export const useHelpRequestActions = (
  requestId: string,
  onUpdate?: (updatedRequest: HelpRequest) => void
) => {
  const [isSaving, setIsSaving] = useState(false);

  const updateStatus = async (newStatus: string) => {
    const response = await updateHelpRequest(requestId, { status: newStatus });
    
    if (isApiSuccess(response)) {
      onUpdate?.(response.data);
      toast("Status updated successfully");
    } else if (isApiError(response)) {
      toast(response.error || "Failed to update status");
    }
  };

  const saveNotes = async (notes: { 
    developer_qa_notes?: string;
    client_feedback?: string;
  }) => {
    setIsSaving(true);
    try {
      const response = await updateHelpRequest(requestId, notes);
      
      if (isApiSuccess(response)) {
        onUpdate?.(response.data);
        toast("Notes saved successfully");
      } else if (isApiError(response)) {
        toast(response.error || "Failed to save notes");
      }
    } catch (error) {
      toast("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    updateStatus,
    saveNotes
  };
};
